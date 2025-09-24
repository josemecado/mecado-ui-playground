// hooks/useVersionFlowActions.ts
import { useCallback } from "react";
import { Node } from "@xyflow/react";
import { ProjectVersion } from "../utils/VersionInterfaces";
import { useGeometryUpload } from "../utils/useGeometryUpload";
import { SimpleVersionRelationshipStorage } from "./versionRelationshipStorage";
import { extractVersionNumber } from "../../../utilities/Interfaces";


export interface UseVersionFlowActionsReturn {
  // Geometry actions
  handleGeometryUpload: (versionId: string) => Promise<void>;
  
  // Version management
  handleArchiveVersion: (versionId: string) => void;
  handleRefresh: () => Promise<void>;
  
  // Navigation
  navigateToGeometryLinking: (projectId: string, sourceId: string, targetId: string) => void;
  
  // Version details
  showVersionDetails: (versionId: string) => void;
  
  // Modal actions  
  handleAddModalSave: (newVersion: ProjectVersion) => void;

  // From useGeometryUpload hook
  isUploading: boolean;
  uploadError: string | null;
}

interface UseVersionFlowActionsProps {
  projectId: string;
  versions: ProjectVersion[];
  setNodes: (updater: (nodes: Node[]) => Node[]) => void;
  onRefreshGeometry?: () => void;
  onVersionChange: (versionId: string) => void;
  onAddVersion: (newVersion: ProjectVersion) => void;
  setUploadSuccess: (message: string | null) => void;
  setIsRefreshing: (refreshing: boolean) => void;
  openVersionDetails: (version: ProjectVersion) => void;
  closeAddModal: () => void;
  navigate: (url: string) => void;
}

/**
 * Hook for managing user actions in VersionFlowVisualization
 * Handles geometry upload, archiving, navigation, and other user interactions
 */
export const useVersionFlowActions = ({
  projectId,
  versions,
  setNodes,
  onRefreshGeometry,
  onVersionChange,
  onAddVersion,
  setUploadSuccess,
  setIsRefreshing,
  openVersionDetails,
  closeAddModal,
  navigate,
}: UseVersionFlowActionsProps): UseVersionFlowActionsReturn => {

  const {
    isUploading,
    uploadError,
    selectAndUploadGeometry,
    clearError,
  } = useGeometryUpload();

  // Handle geometry upload for a specific version
  const handleGeometryUpload = useCallback(
    async (versionId: string) => {
      const versionNumber = extractVersionNumber(versionId);
      if (!versionNumber) return;

      clearError();

      try {
        const result = await selectAndUploadGeometry(projectId, versionNumber);

        if (result.success) {
          setUploadSuccess(
            `Geometry uploaded successfully to ${versionId.toUpperCase()}`
          );

          // Trigger geometry refresh to update the visualization
          if (onRefreshGeometry) {
            onRefreshGeometry();
          }
        }
      } catch (error) {
        console.error("Error uploading geometry:", error);
      }
    },
    [projectId, selectAndUploadGeometry, clearError, onRefreshGeometry, setUploadSuccess]
  );

  // Handle version archiving with visual updates
  const handleArchiveVersion = useCallback(
    (versionId: string) => {
      // Toggle archive status
      const isNowArchived = SimpleVersionRelationshipStorage.toggleVersionArchive(
        projectId,
        versionId
      );

      // Update the node visually
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === versionId) {
            return {
              ...n,
              data: {
                ...n.data,
                isArchived: isNowArchived,
              },
            };
          }
          return n;
        })
      );

      // Optionally trigger a refresh to update the versions
      if (onRefreshGeometry) {
        onRefreshGeometry();
      }

      console.log(
        `Version ${versionId} ${isNowArchived ? "archived" : "unarchived"}`
      );
    },
    [projectId, setNodes, onRefreshGeometry]
  );

  // Handle refresh with loading state
  const handleRefresh = useCallback(async () => {
    if (onRefreshGeometry) {
      setIsRefreshing(true);
      try {
        await onRefreshGeometry();
      } finally {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  }, [onRefreshGeometry, setIsRefreshing]);

  // Navigate to GeometryLinking page
  const navigateToGeometryLinking = useCallback((
    projectId: string, 
    sourceId: string, 
    targetId: string
  ) => {
    const sourceVersion = extractVersionNumber(sourceId);
    const targetVersion = extractVersionNumber(targetId);
    const url = `/geometryLinking?projectId=${projectId}&oldVersion=${sourceVersion}&newVersion=${targetVersion}`;
    navigate(url);
  }, [navigate]);

  // Show version details modal
  const showVersionDetails = useCallback(
    (versionId: string) => {
      const version = versions.find((v) => v.id === versionId);
      if (version) {
        openVersionDetails(version);
      }
    },
    [versions, openVersionDetails]
  );

  // Handle add version modal save
  const handleAddModalSave = useCallback(
    (newVersion: ProjectVersion) => {
      onAddVersion(newVersion);
      closeAddModal();
    },
    [onAddVersion, closeAddModal]
  );

  return {
    // Actions
    handleGeometryUpload,
    handleArchiveVersion,
    handleRefresh,
    navigateToGeometryLinking,
    showVersionDetails,
    handleAddModalSave,

    // State from useGeometryUpload
    isUploading,
    uploadError,
  };
};