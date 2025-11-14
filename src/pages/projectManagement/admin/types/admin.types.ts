// admin/types/admin.types.ts
// Type definitions for the unified admin task management system

export type TaskStage =
    | 'pending_upload'      // User needs to upload files
    | 'upload_review'       // Admin reviewing upload
    | 'upload_approved'     // Upload OK, ready for labeling
    | 'pending_labeling'    // User needs to add labels
    | 'labeling_review'     // Admin reviewing labels
    | 'labeling_approved'   // Labels OK
    | 'completed'           // Fully done
    | 'failed';             // Rejected at any stage

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type UserRole = 'admin' | 'reviewer' | 'labeler' | 'uploader';

// For organizing tasks in columns
export type AdminColumnStatus =
    | 'in_progress'     // All active user work (pending_upload, upload_approved, pending_labeling)
    | 'needs_review'    // Admin action needed (upload_review, labeling_review)
    | 'completed'       // Done (completed, labeling_approved)
    | 'failed';         // Rejected

export interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

export interface HistoryEntry {
    timestamp: Date;
    action: string;
    user: string;
    notes?: string;
}

export interface ReviewData {
    reviewedBy: string;
    reviewedAt: Date;
    approved: boolean;
    notes: string;
}

export interface UploadedFile {
    name: string;
    url?: string;      // S3 URL (future)
    size: number;
    uploadedAt: Date;
}

export interface UploadData {
    requiredFileCount: number;
    uploadedFiles: UploadedFile[];
    review?: ReviewData;
}

export interface LabelingData {
    geometryId?: string;
    geometryType?: 'edge' | 'face' | 'body';
    labels: string[];
    confidence?: number;
    review?: ReviewData;
}

export interface UnifiedTask {
    id: string;
    stage: TaskStage;
    priority: TaskPriority;

    // Core info
    title: string;
    description: string;
    requirements?: string;
    referenceImages?: string[];
    referenceLinks?: string[];

    // Assignment
    assignedTo: string;      // User email
    createdBy: string;       // Admin who created it

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
    dueDate?: Date;

    // Stage-specific data
    uploadData?: UploadData;
    labelingData?: LabelingData;

    // Audit trail
    history: HistoryEntry[];
}

// For organizing into columns
export interface AdminBoardColumn {
    id: string;
    title: string;
    status: AdminColumnStatus;
    tasks: UnifiedTask[];
}

// Form inputs
export interface CreateTaskInput {
    title: string;
    description: string;
    requirements?: string;
    referenceImages?: string[];
    referenceLinks?: string[];
    assignedTo: string;
    priority: TaskPriority;
    dueDate?: Date;
    requiredFileCount: number;
}

export interface ReviewAction {
    taskId: string;
    approved: boolean;
    notes: string;
}