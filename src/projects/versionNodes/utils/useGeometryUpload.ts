import { useState, useCallback } from 'react';

const FILE_NAMES = {
  CONVERSATION: "conversation.json",
  FEA_SELECTION: "FEAselection.json",
  HC_SELECTION: "HCselection.json",
  HC: "HC.json",
  MODEL_STEP: "model.step",
  MODEL_PARASOLID: "model.x_t",
  MODEL_JSON: "model.json",
  MECHANICAL_MAP: "mechanical_map.json",
  DISCOVERY_MAP: "discovery_map.json",
  INFERENCE_MAP: "inference_map.json",
  MIDSURFACE_CONTEXT: "midsurface_context.json",
  ORIGINAL_GEOMETRY_STEP: "original_geometry.step",
} as const;

// Types
export interface GeometryFile {
  fileName: string;
  filePath: string;
  fileType: 'step' | 'stp' | 'x_t';
  uploadedAt: number;
  isProcessed: boolean;
}

export interface GeometryUploadResult {
  success: boolean;
  hasGeometry: boolean;
  hasViz: boolean;
  error?: string;
  geometryFile?: GeometryFile;
}

export interface GeometryStatus {
  hasStep: boolean;
  hasViz: boolean;
}

interface UploadGeometryParams {
  projectID: string;
  projectVersion: number;
  filePath: string;
  fileName: string;
}

// Pure geometry management hook - no AI/agent dependencies
export const useGeometryUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Helper function to get file extension
  const getFileExtension = useCallback((fileName: string): string => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  }, []);

  // Validate if file is a supported geometry format
  const isGeometryFile = useCallback((fileName: string): boolean => {
    const extension = getFileExtension(fileName);
    return ['step', 'stp', 'x_t'].includes(extension);
  }, [getFileExtension]);

  // Check current geometry status for a project version
  const checkGeometryStatus = useCallback(
    async (projectID: string, projectVersion: number): Promise<GeometryStatus> => {
      try {
        const geometryStatus = await window.projectAPI.geometry.checkGeometryStatus(
          projectID,
          projectVersion
        );
        return {
          hasStep: geometryStatus.hasStep,
          hasViz: geometryStatus.hasViz,
        };
      } catch (error) {
        console.error('Error checking geometry status:', error);
        return { hasStep: false, hasViz: false };
      }
    },
    []
  );

  // Handle geometry file selection dialog
  const selectGeometryFile = useCallback(async (): Promise<string | null> => {
    try {
      const result = await window.electron.openFileDialog({
        properties: ["openFile"],
        filters: [{ name: "Geometry Files", extensions: ["step", "stp", "x_t"] }],
        title: "Select Geometry File",
        buttonLabel: "Select",
      });

      if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
      }
      return null;
    } catch (error) {
      console.error('Error selecting geometry file:', error);
      setUploadError('Error selecting geometry file');
      return null;
    }
  }, []);

  // Main upload function - handles the complete upload and conversion process
  const uploadGeometry = useCallback(
    async ({ projectID, projectVersion, filePath, fileName }: UploadGeometryParams): Promise<GeometryUploadResult> => {
      setIsUploading(true);
      setUploadError(null);

      try {
        // Validate file extension
        const extension = getFileExtension(fileName).toLowerCase();
        if (!isGeometryFile(fileName)) {
          throw new Error('Invalid geometry file format. Only STEP (.step, .stp) and Parasolid (.x_t) files are supported.');
        }

        // Create geometry file info object
        const geometryFile: GeometryFile = {
          fileName,
          filePath,
          fileType: extension as 'step' | 'stp' | 'x_t',
          uploadedAt: Date.now(),
          isProcessed: false
        };

        // Upload and process the geometry file via the project API
        await window.projectAPI.geometry.uploadStepAndVisualize(
          projectID,
          projectVersion,
          filePath
        );

        // Check the updated geometry status
        const status = await checkGeometryStatus(projectID, projectVersion);

        return {
          success: true,
          hasGeometry: status.hasStep,
          hasViz: status.hasViz,
          geometryFile: {
            ...geometryFile,
            isProcessed: true
          }
        };

      } catch (error) {
        console.error('Error uploading geometry:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setUploadError(errorMessage);
        
        return {
          success: false,
          hasGeometry: false,
          hasViz: false,
          error: errorMessage
        };
      } finally {
        setIsUploading(false);
      }
    },
    [getFileExtension, isGeometryFile, checkGeometryStatus]
  );

  // Combined function to select and upload geometry file
  const selectAndUploadGeometry = useCallback(
    async (projectID: string, projectVersion: number): Promise<GeometryUploadResult> => {
      const selectedPath = await selectGeometryFile();
      
      if (!selectedPath) {
        return {
          success: false,
          hasGeometry: false,
          hasViz: false,
          error: 'No file selected'
        };
      }

      const fileName = selectedPath.split(/[/\\]/).pop() || 'unnamed';
      
      return uploadGeometry({
        projectID,
        projectVersion,
        filePath: selectedPath,
        fileName
      });
    },
    [selectGeometryFile, uploadGeometry]
  );

  // Get the file path for existing geometry in a project version
  const getGeometryFilePath = useCallback(
    async (projectID: string, projectVersion: number): Promise<string | null> => {
      try {
        const status = await checkGeometryStatus(projectID, projectVersion);
        if (!status.hasStep) return null;

        return await window.electron.joinPath(
          await window.electron.getUserDataDir(),
          "projects",
          projectID,
          "v" + projectVersion,
          FILE_NAMES.ORIGINAL_GEOMETRY_STEP
        );
      } catch (error) {
        console.error('Error getting geometry file path:', error);
        return null;
      }
    },
    [checkGeometryStatus]
  );

  // Load existing geometry file info for a project version
  const getExistingGeometry = useCallback(
    async (projectID: string, projectVersion: number): Promise<GeometryFile | null> => {
      try {
        const geometryStatus = await checkGeometryStatus(projectID, projectVersion);
        
        if (!geometryStatus.hasStep) return null;

        const filePath = await getGeometryFilePath(projectID, projectVersion);
        if (!filePath) return null;

        return {
          fileName: FILE_NAMES.ORIGINAL_GEOMETRY_STEP,
          filePath,
          fileType: 'step',
          uploadedAt: 0, // We don't track upload time for existing files
          isProcessed: true
        };
      } catch (error) {
        console.error('Error loading existing geometry:', error);
        return null;
      }
    },
    [checkGeometryStatus, getGeometryFilePath]
  );

  // Remove/delete geometry from a project version
  const removeGeometry = useCallback(
    async (projectID: string, projectVersion: number): Promise<boolean> => {
      try {
        // This would call a project API method to remove geometry files
        // await window.projectAPI.geometry.removeGeometry(projectID, projectVersion);
        console.warn('removeGeometry not implemented in project API yet');
        return false;
      } catch (error) {
        console.error('Error removing geometry:', error);
        setUploadError('Failed to remove geometry');
        return false;
      }
    },
    []
  );

  // Add this new method to useGeometryUpload hook
const selectMultipleGeometryFiles = useCallback(async (): Promise<string[]> => {
  try {
    const result = await window.electron.openFileDialog({
      properties: ["openFile", "multiSelections"],
      filters: [{ name: "Geometry Files", extensions: ["step", "stp", "x_t"] }],
      title: "Select Geometry Files for Exploration",
      buttonLabel: "Add Files",
    });

    if (!result.canceled && result.filePaths.length > 0) {
      // Validate all selected files
      const validFiles = result.filePaths.filter(filePath => {
        const fileName = filePath.split(/[/\\]/).pop() || '';
        return isGeometryFile(fileName);
      });
      
      if (validFiles.length !== result.filePaths.length) {
        const invalidCount = result.filePaths.length - validFiles.length;
        setUploadError(`${invalidCount} file(s) were skipped (unsupported format)`);
      }
      
      return validFiles;
    }
    return [];
  } catch (error) {
    console.error('Error selecting geometry files:', error);
    setUploadError('Error selecting geometry files');
    return [];
  }
}, [isGeometryFile]);

  // Clear upload error
  const clearError = useCallback(() => {
    setUploadError(null);
  }, []);

  return {
    // State
    isUploading,
    uploadError,
    
    // Core actions
    uploadGeometry,
    selectAndUploadGeometry,
    selectMultipleGeometryFiles,
    removeGeometry,
    
    // Status and info
    checkGeometryStatus,
    getExistingGeometry,
    getGeometryFilePath,
    
    // File selection
    selectGeometryFile,
    
    // Utilities
    isGeometryFile,
    getFileExtension,
    clearError
  };
};