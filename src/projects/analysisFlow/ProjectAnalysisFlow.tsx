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
  const [selectedGroup, setSelectedGroup] = useState<AnalysisGroup | null>(
    null
  );
  const [isRunning, setIsRunning] = useState(false);
  const [showRequirements, setShowRequirements] = useState(true);
  const detailFlowRef = useRef<{
    startAnimation: () => void;
    stopAnimation: () => void;
  } | null>(null);

  const activeTab = selectedGroup ? selectedGroup.id : "all";

  const handleTabChange = useCallback(
    (tabId: string | "all") => {
      if (isRunning) return;

      if (tabId === "all") {
        setSelectedGroup(null);
      } else {
        const group = analysisGroups.find((g) => g.id === tabId);
        if (group) {
          setSelectedGroup(group);
        }
      }
    },
    [analysisGroups, isRunning]
  );

  const handleGroupSelect = useCallback(
    (group: AnalysisGroup) => {
      if (!isRunning) {
        setSelectedGroup(group);
      }
    },
    [isRunning]
  );

  const handleToolbarRun = useCallback(() => {
    if (isRunning) {
      detailFlowRef.current?.stopAnimation();
      setIsRunning(false);
    } else {
      if (selectedGroup) {
        detailFlowRef.current?.startAnimation();
        setIsRunning(true);
      } else {
        console.log("Running all analysis groups");
        setIsRunning(true);
        setTimeout(() => setIsRunning(false), 3000);
      }
    }
  }, [selectedGroup, isRunning]);

  return (
    <MainContainer>
      <AnalysisToolbar
        analysisGroups={analysisGroups}
        requirements={requirements}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onRequirementsClick={() => setShowRequirements(!showRequirements)}
        onRunAnalyses={handleToolbarRun}
        isRunning={isRunning}
      />

      <ViewContainer>
        {/* Centralized Requirements Modal */}
        {showRequirements && analysisGroups && analysisGroups.length > 0 && (
          <RequirementsModal
            analysisGroups={analysisGroups}
            selectedGroup={selectedGroup}
          />
        )}

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
