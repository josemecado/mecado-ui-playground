// ============================================================================
// TASK TYPES FOR MVP
// ============================================================================

export type TaskType = "geometry_labeling" | "geometry_upload";

export type TaskStatus = "todo" | "pending" | "approved" | "failed";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

// ============================================================================
// BASE TASK INTERFACE
// ============================================================================

export interface BaseTask {
    id: string;
    type: TaskType;
    status: TaskStatus;
    priority: TaskPriority;

    // Assignment
    assignedTo: string;
    assignedBy?: string;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
    dueDate?: Date;
    submittedAt?: Date;

    // Review info (for pending/approved/failed)
    reviewedAt?: Date;
    reviewedBy?: string;
    reviewNotes?: string;
}

// ============================================================================
// GEOMETRY LABELING TASK
// ============================================================================

export interface GeometryLabelingTask extends BaseTask {
    type: "geometry_labeling";

    // Geometry info
    modelId: string;
    geometryId: string;
    geometryType: "edge" | "face" | "body";
    geometryName: string;

    // Labeling info (populated when submitted)
    labels?: string[];                 // NEW: Array of label names
    labelName?: string;                // Legacy: keep for backward compatibility
    confidence?: number;

    // Display
    description?: string;
    thumbnailUrl?: string;
}

// ============================================================================
// GEOMETRY UPLOAD TASK
// ============================================================================

export interface GeometryUploadTask extends BaseTask {
    type: "geometry_upload";

    // Upload requirements
    requiredFileCount: number;
    uploadedFileCount: number;

    // File info
    fileNames: string[];

    // Display
    description: string;
    batchName: string;                 // e.g., "Bracket Models Set A"
}

// ============================================================================
// UNION TYPE
// ============================================================================

export type Task = GeometryLabelingTask | GeometryUploadTask;

// ============================================================================
// TASK CONTEXT (passed when navigating to tools)
// ============================================================================

export interface TaskContext {
    taskId: string;
    taskType: TaskType;

    // For geometry labeling
    modelId?: string;
    geometryId?: string;
    geometryType?: "edge" | "face" | "body";
    geometryName?: string;

    // For upload
    requiredFileCount?: number;
    batchName?: string;
}

// ============================================================================
// BOARD COLUMN
// ============================================================================

export interface BoardColumn {
    id: string;
    title: string;
    status: TaskStatus;
    tasks: Task[];
    color: string;                     // Theme color token key
    description: string;
}