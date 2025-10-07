// views/ProjectAnalysisFlow.tsx
import React, { useState, useCallback } from "react";
import styled from "styled-components";
import {
  AnalysisGroup,
  Analysis,
  Requirement,
} from "../nodeVisuals/versionNodes/utils/VersionInterfaces";

import { useAnalysisAnimation } from "./hooks/useAnalysisAnimation";

import { AnalysisToolbar } from "./components/AnalysisFlowToolbar";
import { AnalysisGroupsOverview } from "./components/AnalysisGroupOverview";
import { AnalysisDetailFlow } from "./components/AnalysisDetailFlow";

import { AnimationDebugPanel } from "./components/AnimationDebugPanel";
import { RequirementsModal } from "./components/requirements/RequirementsModal";
import { AnalysisSetupBuilder } from "./components/AnalysisBuilder/AnalysisSetupBuilder";

interface ProjectAnalysisFlowProps {
  analysisGroups: AnalysisGroup[];
  requirements: Requirement[];
  onAnalysisClick?: (analysis: Analysis) => void;
  onUpdateGroup: (groupId: string, updatedGroup: AnalysisGroup) => void;
  onSaveConfiguration: (config: {
    requirements: Requirement[];
    analysisGroups: AnalysisGroup[];
  }) => void;
  projectId: string;
  versionId: string;
}

export const ProjectAnalysisFlow: React.FC<ProjectAnalysisFlowProps> = ({
  analysisGroups,
  requirements,
  onAnalysisClick,
  onUpdateGroup,
  onSaveConfiguration,
  projectId,
  versionId,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showDebug, setShowDebug] = useState(true);

  const selectedGroup = selectedGroupId
    ? analysisGroups.find((g) => g.id === selectedGroupId) || null
    : null;

  // Single animation instance - handles ALL animations
  const animation = useAnalysisAnimation({
    analysisGroup: selectedGroup || undefined,
    analysisGroups: analysisGroups,
    onUpdateGroup: (groupIdOrGroup, updatedGroup) => {
      if (typeof groupIdOrGroup === "string" && updatedGroup) {
        onUpdateGroup(groupIdOrGroup, updatedGroup);
      } else if (typeof groupIdOrGroup === "object") {
        onUpdateGroup(groupIdOrGroup.id, groupIdOrGroup);
      }
    },
    onAnimationComplete: () => {
      console.log("Animation completed");
    },
  });

  const activeTab = selectedGroup ? selectedGroup.id : "all";

  const handleTabChange = useCallback((tabId: string | "all") => {
    if (tabId === "all") {
      setSelectedGroupId(null);
    } else {
      setSelectedGroupId(tabId);
    }
  }, []);

  const handleGroupSelect = useCallback((group: AnalysisGroup) => {
    setSelectedGroupId(group.id);
  }, []);

  const handleToolbarRun = useCallback(() => {
    if (animation.isRunning) {
      animation.stopAnimation();
    } else {
      if (selectedGroup) {
        animation.startAnimation();
      } else {
        animation.runAllGroups();
      }
    }
  }, [selectedGroup, animation]);

  const handleReset = useCallback(() => {
    animation.resetAnimation();
  }, [animation]);

  const handleOpenBuilder = useCallback(() => {
    setShowBuilder(true);
  }, []);

  const handleCloseBuilder = useCallback(() => {
    setShowBuilder(false);
  }, []);

  const handleSaveBuilder = useCallback(
    (config: {
      requirements: Requirement[];
      analysisGroups: AnalysisGroup[];
    }) => {
      onSaveConfiguration(config);
      setShowBuilder(false);
    },
    [onSaveConfiguration]
  );

  // Check if animation is running for the currently selected group
  const isCurrentGroupAnimating =
    animation.isRunning &&
    (selectedGroup ? animation.currentGroupId === selectedGroup.id : true);

  return (
    <MainContainer>
      <AnalysisToolbar
        analysisGroups={analysisGroups}
        requirements={requirements}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onRunAnalyses={handleToolbarRun}
        onResetAnalyses={handleReset}
        onOpenBuilder={handleOpenBuilder}
        isRunning={animation.isRunning}
      />

      <ViewContainer>
        {analysisGroups && analysisGroups.length > 0 && (
          <RequirementsModal
            analysisGroups={analysisGroups}
            selectedGroup={selectedGroup}
          />
        )}

        {showDebug && (
          <AnimationDebugPanel
            currentStepInfo={animation.currentStepInfo}
            currentAnalysisId={animation.currentAnalysisId}
            currentGroupId={animation.currentGroupId}
            isRunning={animation.isRunning}
          />
        )}

        {/* Main content area - shrinks when panel is open */}
        <FlowContent>
          {selectedGroup ? (
            <AnalysisDetailFlow
              key={`${selectedGroup.id}-detail`}
              analysisGroup={selectedGroup}
              allAnalysisGroups={analysisGroups}
              onAnalysisClick={onAnalysisClick}
              isAnimating={isCurrentGroupAnimating}
              currentAnalysisId={animation.currentAnalysisId}
              currentStepInfo={animation.currentStepInfo}
            />
          ) : (
            <AnalysisGroupsOverview
              analysisGroups={analysisGroups}
              onGroupSelect={handleGroupSelect}
              currentGroupId={animation.currentGroupId}
              currentAnalysisId={animation.currentAnalysisId}
            />
          )}
        </FlowContent>

        {showBuilder && (
          <ConfigPanel>
            <AnalysisSetupBuilder
              onClose={handleCloseBuilder}
              onSave={handleSaveBuilder}
              initialRequirements={requirements}
              initialGroups={analysisGroups}
              mode="edit"
            />
          </ConfigPanel>
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

const FlowContent = styled.div`
  flex: 3 1 0;
  display: flex;
  transition: all 0.3s ease;
  overflow: hidden;
`;

const ConfigPanel = styled.div`
  display: flex;
  flex: 1 1 0;
  min-width: 400px;

  transition: all 0.3s ease;
  overflow: hidden;
`;

const ViewContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
`;
