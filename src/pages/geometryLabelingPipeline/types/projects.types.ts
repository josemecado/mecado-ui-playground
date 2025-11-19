// types/project.types.ts
// Project and file tracking types (maps to backend /api/projects)

export type FileStatus =
    | 'uploaded'    // File uploaded, not processed yet
    | 'processing'  // Geometry server processing
    | 'completed'   // VTP files generated
    | 'failed';     // Processing failed

export interface VtpFile {
    type: 'faces' | 'edges' | 'bodies';
    s3Key: string;
    generatedAt: Date;
}

export interface Project {
    id: string;               // MongoDB _id
    projectId: string;        // UUID for S3 directory
    projectName: string;
    description?: string;
    createdBy: string;        // Username
    createdAt: Date;
    lastModified: Date;
    fileCount?: number;
}

export interface FileProject {
    id: string;               // MongoDB _id
    fileProjectId: string;    // UUID for file
    projectId: string;        // Parent project UUID
    fileName: string;
    fileType: string;         // 'step', etc.
    fileExtension?: string;   // '.step', '.stp'

    // S3 keys
    stepFileS3Key: string;
    vtpFiles: VtpFile[];

    // Metadata
    uploadedBy: string;       // Username
    uploadedAt: Date;
    lastModified: Date;
    status: FileStatus;
    metadata?: Record<string, any>;
}

export interface CreateProjectInput {
    projectName: string;
    description?: string;
}

export interface CreateFileProjectInput {
    fileName: string;
    fileType: string;
    fileExtension: string;
    metadata?: Record<string, any>;
}

export interface PresignedUrlResponse {
    s3Key: string;
    uploadUrl?: string;     // For uploads
    downloadUrl?: string;   // For downloads
    expiresIn: number;
}