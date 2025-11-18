// admin/utils/adminHelpers.ts
import { UnifiedTask, AdminBoardColumn, AdminColumnStatus, TaskPriority } from "../types/admin.types";

/**
 * Group tasks into 4 columns based on stage and assignment
 */
export function groupTasksByColumnStatus(tasks: UnifiedTask[]): AdminBoardColumn[] {
    const columns: AdminBoardColumn[] = [
        {
            id: 'unassigned',
            title: 'Unassigned',
            status: 'unassigned',
            tasks: [],
        },
        {
            id: 'assigned',
            title: 'Assigned',
            status: 'assigned',
            tasks: [],
        },
        {
            id: 'awaiting_review',
            title: 'Awaiting Review',
            status: 'awaiting_review',
            tasks: [],
        },
        {
            id: 'completed',
            title: 'Completed',
            status: 'completed',
            tasks: [],
        },
    ];

    tasks.forEach((task) => {
        const columnStatus = getColumnStatusFromStage(task.stage, task.assignedTo);
        const column = columns.find((col) => col.status === columnStatus);
        if (column) {
            column.tasks.push(task);
        }
    });

    return columns;
}

/**
 * Map task stage to column status, considering assignment
 */
function getColumnStatusFromStage(stage: string, assignedTo?: string): AdminColumnStatus {
    // If no assignedTo, task is unassigned regardless of stage
    if (!assignedTo) {
        return 'unassigned';
    }

    // Otherwise, use stage to determine column
    switch (stage) {
        case 'pending_upload':
        case 'upload_approved':
        case 'pending_labeling':
            return 'assigned';

        case 'upload_review':
        case 'labeling_review':
            return 'awaiting_review';

        case 'labeling_approved':
        case 'completed':
            return 'completed';

        default:
            return 'assigned';
    }
}

/**
 * Get human-readable stage label
 */
export function getStageLabel(stage: string): string {
    const labels: Record<string, string> = {
        pending_upload: 'Pending Upload',
        upload_review: 'Upload Review',
        upload_approved: 'Upload Approved',
        pending_labeling: 'Pending Labeling',
        labeling_review: 'Labeling Review',
        labeling_approved: 'Labeling Approved',
        completed: 'Completed',
        failed: 'Failed',
    };
    return labels[stage] || 'Unknown';
}

/**
 * Get priority info (label and color)
 */
export function getPriorityInfo(priority: TaskPriority): { label: string; color: string } {
    const priorities: Record<TaskPriority, { label: string; color: string }> = {
        urgent: { label: 'Urgent', color: '#ef4444' },
        high: { label: 'High', color: '#f59e0b' },
        medium: { label: 'Medium', color: '#3b82f6' },
        low: { label: 'Low', color: '#6b7280' },
    };
    return priorities[priority];
}

/**
 * Extract username from email
 */
export function getUsernameFromEmail(email: string): string {
    return email.split('@')[0];
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i)) + ' ' + sizes[i];
}

/**
 * Format relative date
 */
export function formatRelativeDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

/**
 * Get days until due date
 */
export function getDaysUntilDue(task: UnifiedTask): number | null {
    if (!task.dueDate) return null;
    const now = new Date();
    const due = new Date(task.dueDate);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    return diffDays;
}

/**
 * Check if task is overdue
 */
export function isTaskOverdue(task: UnifiedTask): boolean {
    if (!task.dueDate) return false;
    const now = new Date();
    const due = new Date(task.dueDate);
    return due < now;
}

/**
 * Get upload progress percentage
 */
export function getUploadProgress(task: UnifiedTask): number {
    if (!task.uploadData) return 0;
    const { uploadedFiles, requiredFileCount } = task.uploadData;
    if (requiredFileCount === 0) return 0;
    return Math.round((uploadedFiles.length / requiredFileCount) * 100);
}