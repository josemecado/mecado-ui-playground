import { Task, TaskStatus, BoardColumn } from "../types/types";
import { formatDistanceToNow, isPast, differenceInDays } from "date-fns";

// ============================================================================
// GROUP TASKS BY STATUS
// ============================================================================

export const groupTasksByStatus = (tasks: Task[]): BoardColumn[] => {
    const columns: BoardColumn[] = [
        {
            id: "todo",
            title: "To Do",
            status: "todo",
            tasks: tasks.filter((t) => t.status === "todo"),
            color: "brandPrimary",
            description: "Tasks ready to start",
        },
        {
            id: "pending",
            title: "Pending Approval",
            status: "pending",
            tasks: tasks.filter((t) => t.status === "pending"),
            color: "statusWarning",
            description: "Awaiting review",
        },
        {
            id: "approved",
            title: "Approved",
            status: "approved",
            tasks: tasks.filter((t) => t.status === "approved"),
            color: "statusSuccess",
            description: "Successfully completed",
        },
        {
            id: "failed",
            title: "Failed",
            status: "failed",
            tasks: tasks.filter((t) => t.status === "failed"),
            color: "statusError",
            description: "Requires attention",
        },
    ];

    return columns;
};

// ============================================================================
// FORMAT DATE HELPERS
// ============================================================================

export const formatRelativeDate = (date: Date): string => {
    return formatDistanceToNow(date, { addSuffix: true });
};

export const formatDueDate = (dueDate?: Date): string => {
    if (!dueDate) return "";

    const days = differenceInDays(dueDate, new Date());

    if (isPast(dueDate)) {
        return `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""}`;
    }

    if (days === 0) {
        return "Due today";
    }

    if (days === 1) {
        return "Due tomorrow";
    }

    return `Due in ${days} days`;
};

// ============================================================================
// PRIORITY HELPERS
// ============================================================================

export const getPriorityColor = (priority: Task["priority"]): string => {
    switch (priority) {
        case "urgent":
            return "statusError";
        case "high":
            return "statusError";
        case "medium":
            return "statusWarning";
        case "low":
            return "accentSecondary";
        default:
            return "accentPrimary";
    }
};

export const getPriorityLabel = (priority: Task["priority"]): string => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
};

// ============================================================================
// TASK TYPE HELPERS
// ============================================================================

export const getTaskTypeLabel = (type: Task["type"]): string => {
    switch (type) {
        case "geometry_labeling":
            return "Label Geometry";
        case "geometry_upload":
            return "Upload Files";
        default:
            return type;
    }
};

export const getTaskTypeIcon = (type: Task["type"]): string => {
    switch (type) {
        case "geometry_labeling":
            return "🏷️";
        case "geometry_upload":
            return "📦";
        default:
            return "📋";
    }
};

// ============================================================================
// STATUS HELPERS
// ============================================================================

export const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
        case "todo":
            return "brandPrimary";
        case "pending":
            return "statusWarning";
        case "approved":
            return "statusSuccess";
        case "failed":
            return "statusError";
        default:
            return "accentPrimary";
    }
};

export const getStatusIcon = (status: TaskStatus): string => {
    switch (status) {
        case "todo":
            return "📝";
        case "pending":
            return "⏳";
        case "approved":
            return "✅";
        case "failed":
            return "❌";
        default:
            return "📋";
    }
};

// ============================================================================
// FILTER & SORT HELPERS
// ============================================================================

export const sortTasksByPriority = (tasks: Task[]): Task[] => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};

export const sortTasksByDueDate = (tasks: Task[]): Task[] => {
    return [...tasks].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
    });
};

export const filterTasksByType = (tasks: Task[], type: Task["type"]): Task[] => {
    return tasks.filter((task) => task.type === type);
};

// ============================================================================
// PROGRESS CALCULATION (for upload tasks)
// ============================================================================

export const calculateProgress = (uploaded: number, required: number): number => {
    if (required === 0) return 0;
    return Math.round((uploaded / required) * 100);
};