// services/fileService.ts
// File tracking and S3 operations (maps to /api/projects/:id/files)

import { FileProject, CreateFileProjectInput, PresignedUrlResponse } from '../types';
import { isFeatureEnabled } from '../config/featureFlags';
import { apiClient } from './apiClient';

// ============================================
// LOCAL DATA STORE (temporary)
// ============================================

let localFileProjects: FileProject[] = [];

// ============================================
// FILE SERVICE
// ============================================

export const fileService = {
    /**
     * Get all files for a project
     */
    async getProjectFiles(projectId: string): Promise<FileProject[]> {
        if (isFeatureEnabled('USE_FILE_API')) {
            try {
                const response = await apiClient.get(`/projects/${projectId}/files`);
                console.log('[FileService] Fetched files from API');
                return response.data.files;
            } catch (error) {
                console.error('[FileService] API failed, using local fallback:', error);
                return localFileProjects.filter(f => f.projectId === projectId);
            }
        }

        const files = localFileProjects.filter(f => f.projectId === projectId);
        console.log('[FileService] Using local files:', files.length);
        return files;
    },

    /**
     * Get file by ID
     */
    async getFileById(projectId: string, fileProjectId: string): Promise<FileProject | null> {
        if (isFeatureEnabled('USE_FILE_API')) {
            try {
                const response = await apiClient.get(`/projects/${projectId}/files/${fileProjectId}`);
                console.log('[FileService] Fetched file from API:', fileProjectId);
                return response.data;
            } catch (error) {
                console.error('[FileService] API failed, using local fallback:', error);
                const file = localFileProjects.find(f => f.fileProjectId === fileProjectId);
                return file || null;
            }
        }

        const file = localFileProjects.find(f => f.fileProjectId === fileProjectId);
        console.log('[FileService] Using local file:', fileProjectId, file ? 'found' : 'not found');
        return file || null;
    },

    /**
     * Create new file project (register file metadata)
     */
    async createFileProject(
        projectId: string,
        input: CreateFileProjectInput,
        uploadedBy: string
    ): Promise<FileProject> {
        if (isFeatureEnabled('USE_FILE_API')) {
            try {
                const response = await apiClient.post(`/projects/${projectId}/files`, {
                    ...input,
                    uploadedBy,
                });
                console.log('[FileService] Created file project via API:', response.data.fileProjectId);
                return response.data;
            } catch (error) {
                console.error('[FileService] API failed, using local fallback:', error);
            }
        }

        // Local mock
        const fileProjectId = crypto.randomUUID();
        const newFile: FileProject = {
            id: `file-${Date.now()}`,
            fileProjectId,
            projectId,
            fileName: input.fileName,
            fileType: input.fileType,
            fileExtension: input.fileExtension,
            stepFileS3Key: `projects/${projectId}/files/${fileProjectId}/original${input.fileExtension}`,
            vtpFiles: [],
            uploadedBy,
            uploadedAt: new Date(),
            lastModified: new Date(),
            status: 'uploaded',
            metadata: input.metadata,
        };

        localFileProjects = [newFile, ...localFileProjects];
        console.log('[FileService] Created local file project:', fileProjectId);
        return newFile;
    },

    /**
     * Get presigned URL for uploading to S3
     */
    async getUploadUrl(projectId: string, fileProjectId: string): Promise<PresignedUrlResponse> {
        if (isFeatureEnabled('USE_FILE_API')) {
            try {
                const response = await apiClient.get(
                    `/projects/${projectId}/files/${fileProjectId}/upload-url`
                );
                console.log('[FileService] Got upload URL from API');
                return response.data;
            } catch (error) {
                console.error('[FileService] API failed:', error);
                throw error;
            }
        }

        // Local mock (no actual S3)
        console.log('[FileService] Mock upload URL (local mode)');
        return {
            s3Key: `projects/${projectId}/files/${fileProjectId}/original.step`,
            uploadUrl: 'mock-upload-url',
            expiresIn: 3600,
        };
    },

    /**
     * Get presigned URL for downloading from S3
     */
    async getDownloadUrl(
        projectId: string,
        fileProjectId: string,
        type: 'step' | 'faces' | 'edges' | 'bodies'
    ): Promise<PresignedUrlResponse> {
        if (isFeatureEnabled('USE_FILE_API')) {
            try {
                const response = await apiClient.get(
                    `/projects/${projectId}/files/${fileProjectId}/download-url?type=${type}`
                );
                console.log('[FileService] Got download URL from API');
                return response.data;
            } catch (error) {
                console.error('[FileService] API failed:', error);
                throw error;
            }
        }

        // Local mock
        console.log('[FileService] Mock download URL (local mode)');
        const extension = type === 'step' ? '.step' : '.vtp';
        return {
            s3Key: `projects/${projectId}/files/${fileProjectId}/${type}${extension}`,
            downloadUrl: 'mock-download-url',
            expiresIn: 3600,
        };
    },

    /**
     * Add VTP file to file project
     */
    async addVtpFile(
        projectId: string,
        fileProjectId: string,
        type: 'faces' | 'edges' | 'bodies'
    ): Promise<FileProject> {
        if (isFeatureEnabled('USE_FILE_API')) {
            try {
                const response = await apiClient.post(
                    `/projects/${projectId}/files/${fileProjectId}/vtp`,
                    { type }
                );
                console.log('[FileService] Added VTP file via API:', type);
                return response.data;
            } catch (error) {
                console.error('[FileService] API failed, using local fallback:', error);
            }
        }

        // Local mock
        const fileIndex = localFileProjects.findIndex(f => f.fileProjectId === fileProjectId);
        if (fileIndex === -1) {
            throw new Error(`File project ${fileProjectId} not found`);
        }

        const s3Key = `projects/${projectId}/files/${fileProjectId}/${type}.vtp`;
        localFileProjects[fileIndex].vtpFiles.push({
            type,
            s3Key,
            generatedAt: new Date(),
        });
        localFileProjects[fileIndex].status = 'completed';

        console.log('[FileService] Added VTP file locally:', type);
        return localFileProjects[fileIndex];
    },

    /**
     * Upload file to S3 (direct upload after getting presigned URL)
     */
    async uploadToS3(presignedUrl: string, file: File): Promise<void> {
        return apiClient.uploadToS3(presignedUrl, file);
    },

    /**
     * Download file from S3 (direct download after getting presigned URL)
     */
    async downloadFromS3(presignedUrl: string): Promise<Blob> {
        return apiClient.downloadFromS3(presignedUrl);
    },
};

// Expose for debugging
if (typeof window !== 'undefined') {
    (window as any).fileService = fileService;
    console.log('[FileService] Exposed to window.fileService');
}