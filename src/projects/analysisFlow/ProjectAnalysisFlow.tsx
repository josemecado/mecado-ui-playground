// views/ProjectAnalysisFlow.tsx
import React, { useState, useCallback, useRef } from "react";
import styled from "styled-components";
import {
  AnalysisGroup,
  Analysis,
  Requirement,
} from "../versionNodes/utils/VersionInterfaces";
import { AnalysisToolbar } from "./components/AnalysisFlowToolbar";
import { AnalysisGroupsOverview } from "./components/AnalysisGroupOverview";
import { AnalysisDetailFlow } from "./components/AnalysisDetailFlow";
import { RequirementsModal } from "./components/requirements/RequirementsModal";
import { useAnalysisAnimation } from "./hooks/useAnalysisAnimation";

interface ProjectAnalysisFlowProps {
  analysisGroups: AnalysisGroup[];
  requirements: Requirement[];
  activeVersionId: string;
  onAnalysisClick?: (analysis: Analysis) => void;
  onRequirementsClick?: () => void;
  onRefreshAnalyses?: () => void;
  onUpdateGroup: (groupId: string, updatedGroup: AnalysisGroup) => void;
}

export const ProjectAnalysisFlow: React.FC<ProjectAnalysisFlowProps> = ({
  analysisGroups,
  requirements,
  activeVersionId,
  onAnalysisClick,
  onRequirementsClick,
  onRefreshAnalyses,
  onUpdateGroup,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const selectedGroup = selectedGroupId
    ? analysisGroups.find((g) => g.id === selectedGroupId) || null
    : null;

  const [showRequirements, setShowRequirements] = useState(true);

  // Single animation instance at parent level - handles both overview and detail
  const animation = useAnalysisAnimation({
    analysisGroup: selectedGroup || undefined,
    analysisGroups: analysisGroups,
    onUpdateGroup: (groupIdOrGroup, updatedGroup) => {
      if (typeof groupIdOrGroup === 'string' && updatedGroup) {
        onUpdateGroup(groupIdOrGroup, updatedGroup);
      } else if (typeof groupIdOrGroup === 'object') {
        onUpdateGroup(groupIdOrGroup.id, groupIdOrGroup);
      }
    },
    onAnimationComplete: () => {
      console.log("Animation completed");
    },
  });

  const activeTab = selectedGroup ? selectedGroup.id : "all";

  const handleTabChange = useCallback(
    (tabId: string | "all") => {
      // Allow tab changes even during animation
      if (tabId === "all") {
        setSelectedGroupId(null);
      } else {
        setSelectedGroupId(tabId);
      }
    },
    [] // No dependencies on isRunning
  );

  const handleGroupSelect = useCallback(
    (group: AnalysisGroup) => {
      // Allow group selection even during animation
      setSelectedGroupId(group.id);
    },
    []
  );

  const handleToolbarRun = useCallback(() => {
    if (animation.isRunning) {
      // Stop animation
      animation.stopAnimation();
    } else {
      // Start animation based on current view
      if (selectedGroup) {
        // Run single group
        animation.startAnimation();
      } else {
        // Run all groups
        animation.runAllGroups();
      }
    }
  }, [selectedGroup, animation]);

  return (
    <MainContainer>
      <AnalysisToolbar
        analysisGroups={analysisGroups}
        requirements={requirements}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onRequirementsClick={() => setShowRequirements(!showRequirements)}
        onRunAnalyses={handleToolbarRun}
        isRunning={animation.isRunning}
      />

      <ViewContainer>
        {showRequirements && analysisGroups && analysisGroups.length > 0 && (
          <RequirementsModal
            analysisGroups={analysisGroups}
            selectedGroup={selectedGroup}
          />
        )}

        {selectedGroup ? (
          <AnalysisDetailFlow
            key={selectedGroup.id} // Force remount when switching groups
            analysisGroup={selectedGroup}
            onAnalysisClick={onAnalysisClick}
            onUpdateGroup={(updatedGroup) =>
              onUpdateGroup(updatedGroup.id, updatedGroup)
            }
            onAnimationComplete={() => console.log("Detail flow complete")}
            // Don't pass animation controls - parent manages it
            isAnimating={animation.isRunning && animation.currentGroupId === selectedGroup.id}
            currentAnalysisId={animation.currentAnalysisId}
          />
        ) : (
          <AnalysisGroupsOverview
            analysisGroups={analysisGroups}
            onGroupSelect={handleGroupSelect}
            currentGroupId={animation.currentGroupId}
            currentAnalysisId={animation.currentAnalysisId}
          />
        )}
      </ViewContainer>
    </MainContainer>
  );
};

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