// views/ProjectAnalysisFlow.tsx
import React, { useState, useCallback, useRef } from "react";
import styled from "styled-components";
import { 
  AnalysisGroup, 
  Analysis, 
  Requirement 
} from "../versionNodes/utils/VersionInterfaces";
import { AnalysisToolbar } from "./components/AnalysisFlowToolbar";
import { AnalysisGroupsOverview } from "./components/AnalysisGroupOverview";
import { AnalysisDetailFlow } from "./components/AnalysisDetailFlow";

interface ProjectAnalysisFlowProps {
  analysisGroups: AnalysisGroup[];
  requirements: Requirement[];
  activeVersionId: string;
  onAnalysisClick?: (analysis: Analysis) => void;
  onRequirementsClick?: () => void;
  onRefreshAnalyses?: () => void;
}

export const ProjectAnalysisFlow: React.FC<ProjectAnalysisFlowProps> = ({
  analysisGroups,
  requirements,
  activeVersionId,
  onAnalysisClick,
  onRequirementsClick,
  onRefreshAnalyses,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<AnalysisGroup | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const detailFlowRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);

  // Tab management for toolbar
  const activeTab = selectedGroup ? selectedGroup.id : "all";

  const handleTabChange = useCallback((tabId: string | "all") => {
    // Don't allow tab changes while running
    if (isRunning) return;
    
    if (tabId === "all") {
      setSelectedGroup(null);
    } else {
      const group = analysisGroups.find(g => g.id === tabId);
      if (group) {
        setSelectedGroup(group);
      }
    }
  }, [analysisGroups, isRunning]);

  const handleGroupSelect = useCallback((group: AnalysisGroup) => {
    if (!isRunning) {
      setSelectedGroup(group);
    }
  }, [isRunning]);

  const handleToolbarRun = useCallback(() => {
    if (isRunning) {
      // Stop the animation
      if (detailFlowRef.current) {
        detailFlowRef.current.stopAnimation();
      }
      setIsRunning(false);
    } else {
      // Start animation
      if (selectedGroup) {
        // If a group is selected, trigger the detail flow animation
        if (detailFlowRef.current) {
          detailFlowRef.current.startAnimation();
          setIsRunning(true);
        }
        console.log("Running analyses for:", selectedGroup.name);
      } else {
        // If in overview mode, could run all groups
        console.log("Running all analysis groups");
        setIsRunning(true);
        // TODO: Implement batch run functionality
        // For now, just simulate running
        setTimeout(() => {
          setIsRunning(false);
        }, 3000);
      }
    }
  }, [selectedGroup, isRunning]);

  // Add effect to detect when animation completes
  React.useEffect(() => {
    // This will be called when the detail flow animation completes
    const checkAnimationStatus = setInterval(() => {
      // Check if animation has stopped naturally (completed or failed)
      // This is a simplified approach - you might want to add a callback from the animation hook
      if (isRunning && selectedGroup && detailFlowRef.current) {
        // The animation hook will handle its own completion
        // We just need to update our state when it's done
      }
    }, 500);
    
    return () => clearInterval(checkAnimationStatus);
  }, [isRunning, selectedGroup]);

  return (
    <MainContainer>
      <AnalysisToolbar
        analysisGroups={analysisGroups}
        requirements={requirements}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onRequirementsClick={onRequirementsClick}
        onRunAnalyses={handleToolbarRun}
        isRunning={isRunning}
      />
      
      <ViewContainer>
        {selectedGroup ? (
          <AnalysisDetailFlow
            ref={detailFlowRef}
            analysisGroup={selectedGroup}
            onAnalysisClick={onAnalysisClick}
            onAnimationComplete={() => setIsRunning(false)}
          />
        ) : (
          <AnalysisGroupsOverview
            analysisGroups={analysisGroups}
            onGroupSelect={handleGroupSelect}
          />
        )}
      </ViewContainer>
    </MainContainer>
  );
};

// Styled Components
const MainContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  position: relative;
`;

const ViewContainer = styled.div`
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
`;