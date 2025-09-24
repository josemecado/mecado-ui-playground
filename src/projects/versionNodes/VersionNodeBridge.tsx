// nodeVisuals/versionNodes/VersionMiniSelector.bridge.tsx
import React, { useState, useEffect, useCallback } from "react";
import { VersionMiniSelector } from "./components/VersionMiniSelector";
import VersionFlowVisualization from "./views/VersionFlow";
import { ProjectVersion } from "./utils/VersionInterfaces";
import { Equation } from "../../reusable-components/models/vulcanModels";
import { AddVersionModal } from "./components/AddVersionModal";
import { useProjectVersions } from "./bootUpHooks/useProjectVersions";
import { clearAllCaches } from "./bootUpHooks/useProjectVersions";

// Types
export type BridgeMode = "mini" | "flow";

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

  // Use the refactored hook
  const { versions } = useProjectVersions({
    projectId,
    projectVersions,
    pinnedEquations,
    uploadedFilesRefreshKey,
    generatedDocsRefreshKey,
    refreshKey,
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

  // Calculate active version ID
  const activeVersionId = "";

  // Handlers
  const handleVersionChange = useCallback(
    (id: string) => {
      // onVersionChange(extractVersionNumber(id));
    },
    [onVersionChange]
  );

  const handleAddVersion = useCallback(
    async (newVersion: ProjectVersion, parentVersionId: string | null) => {
      // The relationship storage is already updated in the modal
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
    // Clear all caches and force re-fetch
    clearAllCaches();
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Early return if no versions
  if (!versions.length) return null;

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

  // mode === "flow"
  return (
  <VersionFlowVisualization
    versions={versions}
    activeVersionId={activeVersionId}
    onVersionChange={handleVersionChange}
    onAddVersion={async (newVersion) => {
      // When called from VersionFlowVisualization, relationships are already saved
      if (onNewProjectVersion) {
        await onNewProjectVersion();
      }
    }}
    onNewProjectVersion={onNewProjectVersion} // NEW: Pass through the backend version creator
    projectId={projectId}
    onRefreshGeometry={handleRefreshGeometry}
  />
  );
};