// types/task.types.ts
// Consolidated task-related types

export type TaskStage =
    | 'pending_upload'      // User needs to upload files
    | 'upload_review'       // Admin reviewing upload
    | 'upload_approved'     // Upload OK, ready for labeling
    | 'pending_labeling'    // User needs to add labels
    | 'labeling_review'     // Admin reviewing labels
    | 'labeling_approved'   // Labels OK
    | 'completed'           // Fully done
    | 'failed';             // Rejected at any stage (deprecated - use rejection flow instead)

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// For organizing tasks in columns - 4 COLUMNS
export type AdminColumnStatus =
    | 'unassigned'      // Tasks not yet assigned to anyone
    | 'assigned'        // All in-progress work (pending_upload, upload_approved, pending_labeling)
    | 'awaiting_review' // Admin action needed (upload_review, labeling_review)
    | 'completed';      // Done (completed, labeling_approved)

export interface HistoryEntry {
    timestamp: Date;
    action: string;
    user: string;
    notes?: string;
}

export interface ReviewData {
    reviewedBy: string;
    reviewedAt: Date;
    approved: boolean;  // If false, task goes back to in-progress with rejection reason
    notes: string;      // Either approval notes or rejection reason
}

export interface UploadedFile {
    name: string;
    url?: string;
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

    // Assignment (OPTIONAL)
    assignedTo?: string;     // User email (optional - can be unassigned)
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
    assignedTo?: string;     // OPTIONAL
    priority: TaskPriority;
    dueDate?: Date;
    requiredFileCount: number;
}

export interface UpdateTaskInput {
    title?: string;
    description?: string;
    requirements?: string;
    referenceImages?: string[];
    referenceLinks?: string[];
    assignedTo?: string;
    priority?: TaskPriority;
    dueDate?: Date;
    requiredFileCount?: number;
}

export interface ReviewAction {
    taskId: string;
    approved: boolean;
    notes: string;  // Either approval notes or rejection reason
}

// Task context for tools (uploader, labeler)
export interface TaskContext {
    taskId: string;
    taskType: 'geometry_upload' | 'geometry_labeling';
    requiredFileCount?: number;
    modelId?: string;
    geometryId?: string;
    geometryType?: 'edge' | 'face' | 'body';
    geometryName?: string;
    batchName?: string;
}