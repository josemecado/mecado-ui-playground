// nodeVisuals/versionNodes/VersionNodeBridge.tsx
import React, { useState, useEffect, useCallback } from "react";
import { VersionMiniSelector } from "./components/VersionMiniSelector";
import VersionFlowVisualization from "./views/VersionFlow";
import { ProjectAnalysisFlow } from "../analysisFlow/ProjectAnalysisFlow";
import { ProjectVersion, Analysis, AnalysisGroup } from "./utils/VersionInterfaces";
import { Equation } from "../../reusable-components/models/vulcanModels";
import { AddVersionModal } from "./components/AddVersionModal";
import { useProjectVersions } from "./bootUpHooks/useProjectVersions";
import { useAnalysisData } from "../AnalysisFlow/useAnalysisData";
import { clearAllCaches } from "./bootUpHooks/useProjectVersions";

// Types
export type BridgeMode = "mini" | "flow" | "analysis";

interface CommonBridgeProps {
  projectId: string;
  projectVersions: string[] | null;
  projectVersion: number;
  onVersionChange: (version: number) => void;
  onNewProjectVersion?: () => Promise<void>;
  refreshToken?: number | string | boolean;
}

interface MiniExtras {
  pinnedEquations: Equation[];
  uploadedFilesRefreshKey?: number;
  generatedDocsRefreshKey?: number;
}

type GraphBridgeProps = CommonBridgeProps &
  Partial<MiniExtras> & {
    mode?: BridgeMode;
  };

// Main Component
export const VersionNodeBridge: React.FC<GraphBridgeProps> = ({
  mode = "flow",
  projectId,
  projectVersions,
  projectVersion,
  onVersionChange,
  onNewProjectVersion,
  pinnedEquations = [],
  uploadedFilesRefreshKey,
  generatedDocsRefreshKey,
  refreshToken,
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);

  // Use the refactored hook for version data
  const { versions } = useProjectVersions({
    projectId,
    projectVersions,
    pinnedEquations,
    uploadedFilesRefreshKey,
    generatedDocsRefreshKey,
    refreshKey,
    useMockData: mode === "analysis", // Use mock data for analysis mode during development
  });

  // Calculate active version ID
  const activeVersionId = versions.find(v => v.title === `Version ${projectVersion}`)?.id 
    || versions[versions.length - 1]?.id 
    || "";

  // Use analysis data hook for analysis mode
  const analysisData = useAnalysisData({
    projectId,
    versionId: activeVersionId,
    refreshKey,
    useMockData: true, // Always use mock data for now
  });

  useEffect(() => {
    if (refreshToken !== undefined) {
      setRefreshKey((k) => k + 1);
    }
  }, [refreshToken]);

  useEffect(() => {
    clearAllCaches();
    setRefreshKey((k) => k + 1);
  }, [projectId]);

  useEffect(() => {
    if (projectVersions && projectVersions.length > 0) {
      setRefreshKey((k) => k + 1);
    }
  }, [projectVersions]);

  // Handlers
  const handleVersionChange = useCallback(
    (id: string) => {
      // Extract version number from id (e.g., "v1" -> 1)
      const versionNum = parseInt(id.replace(/[^0-9]/g, '')) || 1;
      onVersionChange(versionNum);
    },
    [onVersionChange]
  );

  const handleAddVersion = useCallback(
    async (newVersion: ProjectVersion, parentVersionId: string | null) => {
      if (onNewProjectVersion) {
        await onNewProjectVersion();
      }
      setShowAddModal(false);
    },
    [onNewProjectVersion]
  );

  const handleOpenAddModal = useCallback(() => {
    setShowAddModal(true);
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setShowAddModal(false);
  }, []);

  const handleRefreshGeometry = useCallback(() => {
    clearAllCaches();
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Analysis mode handlers
  const handleAnalysisClick = useCallback((analysis: Analysis) => {
    setSelectedAnalysis(analysis);
    console.log("Analysis clicked:", analysis);
    // TODO: Open analysis details modal/panel
  }, []);

  const handleGroupClick = useCallback((group: AnalysisGroup) => {
    console.log("Analysis group clicked:", group);
    // The tab switching is handled internally by ProjectAnalysisFlow
  }, []);

  const handleRequirementsClick = useCallback(() => {
    console.log("Requirements clicked");
    // TODO: Open requirements panel/modal
  }, []);

  // Early return if no versions
  if (!versions.length && mode !== "analysis") return null;

  // Render based on mode
  if (mode === "mini") {
    return (
      <>
        <VersionMiniSelector
          versions={versions}
          activeVersionId={activeVersionId}
          onVersionChange={handleVersionChange}
          onNewVersion={handleOpenAddModal}
        />

        {showAddModal && (
          <AddVersionModal
            onSave={handleAddVersion}
            onCancel={handleCloseAddModal}
            existingVersions={versions}
            projectId={projectId}
          />
        )}
      </>
    );
  }

  if (mode === "analysis") {
    return (
      <ProjectAnalysisFlow
        analysisGroups={analysisData.analysisGroups}
        requirements={analysisData.requirements}
        activeVersionId={activeVersionId}
        onAnalysisClick={handleAnalysisClick}
        onGroupClick={handleGroupClick}
        onRequirementsClick={handleRequirementsClick}
      />
    );
  }

  // mode === "flow"
  return (
    <VersionFlowVisualization
      versions={versions}
      activeVersionId={activeVersionId}
      onVersionChange={handleVersionChange}
      onAddVersion={async (newVersion) => {
        if (onNewProjectVersion) {
          await onNewProjectVersion();
        }
      }}
      onNewProjectVersion={onNewProjectVersion}
      projectId={projectId}
      onRefreshGeometry={handleRefreshGeometry}
    />
  );
};