// admin/utils/adminHelpers.ts
// Helper functions for organizing and formatting admin tasks

import {
    UnifiedTask,
    AdminBoardColumn,
    AdminColumnStatus,
    TaskStage,
} from '../types/admin.types';

// Map task stages to column categories
export const getColumnStatusForStage = (stage: TaskStage): AdminColumnStatus => {
    switch (stage) {
        case 'pending_upload':
        case 'upload_approved':
        case 'pending_labeling':
            return 'in_progress';

        case 'upload_review':
        case 'labeling_review':
            return 'needs_review';

        case 'completed':
        case 'labeling_approved':
            return 'completed';

        case 'failed':
            return 'failed';

        default:
            return 'in_progress';
    }
};

// Group tasks by column status
export const groupTasksByColumnStatus = (tasks: UnifiedTask[]): AdminBoardColumn[] => {
    const columns: AdminBoardColumn[] = [
        {
            id: 'in_progress',
            title: 'In Progress',
            status: 'in_progress',
            tasks: [],
        },
        {
            id: 'needs_review',
            title: 'Needs Review',
            status: 'needs_review',
            tasks: [],
        },
        {
            id: 'completed',
            title: 'Completed',
            status: 'completed',
            tasks: [],
        },
        {
            id: 'failed',
            title: 'Failed',
            status: 'failed',
            tasks: [],
        },
    ];

    // Distribute tasks into columns
    tasks.forEach((task) => {
        const columnStatus = getColumnStatusForStage(task.stage);
        const column = columns.find((c) => c.status === columnStatus);
        if (column) {
            column.tasks.push(task);
        }
    });

    // Sort tasks within each column by priority, then by due date
    columns.forEach((column) => {
        column.tasks.sort((a, b) => {
            // Priority order: urgent > high > medium > low
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];

            if (priorityDiff !== 0) return priorityDiff;

            // If same priority, sort by due date (closest first)
            if (a.dueDate && b.dueDate) {
                return a.dueDate.getTime() - b.dueDate.getTime();
            }
            if (a.dueDate) return -1;
            if (b.dueDate) return 1;

            // If no due dates, sort by created date (newest first)
            return b.createdAt.getTime() - a.createdAt.getTime();
        });
    });

    return columns;
};

// Get stage label for display
export const getStageLabel = (stage: TaskStage): string => {
    const labels: Record<TaskStage, string> = {
        pending_upload: 'Pending Upload',
        upload_review: 'Upload Review',
        upload_approved: 'Upload Approved',
        pending_labeling: 'Pending Labeling',
        labeling_review: 'Labeling Review',
        labeling_approved: 'Labeling Approved',
        completed: 'Completed',
        failed: 'Failed',
    };
    return labels[stage];
};

// Get priority label and color
export const getPriorityInfo = (
    priority: UnifiedTask['priority']
): { label: string; color: string } => {
    const info = {
        urgent: { label: 'Urgent', color: '#ef4444' },
        high: { label: 'High', color: '#f59e0b' },
        medium: { label: 'Medium', color: '#3b82f6' },
        low: { label: 'Low', color: '#6b7280' },
    };
    return info[priority];
};

// Format relative date (e.g., "2 days ago")
export const formatRelativeDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    if (diffDay < 30) {
        const weeks = Math.floor(diffDay / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }

    const months = Math.floor(diffDay / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
};

// Format file size
export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

// Check if task is overdue
export const isTaskOverdue = (task: UnifiedTask): boolean => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date();
};

// Get days until due
export const getDaysUntilDue = (task: UnifiedTask): number | null => {
    if (!task.dueDate) return null;
    const now = new Date();
    const due = new Date(task.dueDate);
    const diffMs = due.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

// Check if task needs admin attention
export const needsAdminAction = (task: UnifiedTask): boolean => {
    return task.stage === 'upload_review' || task.stage === 'labeling_review';
};

// Get current stage step (for progress indicator)
export const getStageProgress = (stage: TaskStage): { current: number; total: number } => {
    const stages: TaskStage[] = [
        'pending_upload',
        'upload_review',
        'upload_approved',
        'pending_labeling',
        'labeling_review',
        'labeling_approved',
        'completed',
    ];

    if (stage === 'failed') {
        return { current: 0, total: 7 };
    }

    const current = stages.indexOf(stage) + 1;
    return { current, total: 7 };
};

// Extract username from email
export const getUsernameFromEmail = (email: string): string => {
    return email.split('@')[0];
};

// Get initials from email for avatar
export const getInitialsFromEmail = (email: string): string => {
    const username = getUsernameFromEmail(email);
    return username
        .split(/[._-]/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
};

// Calculate upload progress percentage
export const getUploadProgress = (task: UnifiedTask): number => {
    if (!task.uploadData) return 0;
    const { requiredFileCount, uploadedFiles } = task.uploadData;
    if (requiredFileCount === 0) return 100;
    return Math.round((uploadedFiles.length / requiredFileCount) * 100);
};

// Get action button text based on stage
export const getActionButtonText = (stage: TaskStage): string | null => {
    switch (stage) {
        case 'upload_review':
            return 'Review Upload';
        case 'labeling_review':
            return 'Review Labels';
        default:
            return null;
    }
};