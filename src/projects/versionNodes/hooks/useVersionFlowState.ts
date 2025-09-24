// hooks/useVersionFlowState.ts
import { useState, useCallback } from "react";
import { ProjectVersion } from "../utils/VersionInterfaces";

export interface UseVersionFlowStateReturn {
  // Modal states
  selectedVersion: ProjectVersion | null;
  showAddModal: boolean;
  showSortModal: boolean;
  
  // Notification states
  uploadSuccess: string | null;
  isRefreshing: boolean;

  // Modal actions
  openVersionDetails: (version: ProjectVersion) => void;
  closeVersionDetails: () => void;
  openAddModal: () => void;
  closeAddModal: () => void;
  openSortModal: () => void;
  closeSortModal: () => void;

  // Notification actions
  setUploadSuccess: (message: string | null) => void;
  setIsRefreshing: (refreshing: boolean) => void;
}

/**
 * Hook for managing UI state in VersionFlowVisualization
 * Handles modals, notifications, and temporary UI states
 */
export const useVersionFlowState = (): UseVersionFlowStateReturn => {
  // Modal states
  const [selectedVersion, setSelectedVersion] = useState<ProjectVersion | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  
  // Notification states
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal actions
  const openVersionDetails = useCallback((version: ProjectVersion) => {
    setSelectedVersion(version);
  }, []);

  const closeVersionDetails = useCallback(() => {
    setSelectedVersion(null);
  }, []);

  const openAddModal = useCallback(() => {
    setShowAddModal(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
  }, []);

  const openSortModal = useCallback(() => {
    setShowSortModal(true);
  }, []);

  const closeSortModal = useCallback(() => {
    setShowSortModal(false);
  }, []);

  // Enhanced setUploadSuccess with auto-clear
  const setUploadSuccessWithClear = useCallback((message: string | null) => {
    setUploadSuccess(message);
    if (message) {
      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(null);
      }, 3000);
    }
  }, []);

  return {
    // States
    selectedVersion,
    showAddModal,
    showSortModal,
    uploadSuccess,
    isRefreshing,

    // Actions
    openVersionDetails,
    closeVersionDetails,
    openAddModal,
    closeAddModal,
    openSortModal,
    closeSortModal,
    setUploadSuccess: setUploadSuccessWithClear,
    setIsRefreshing,
  };
};