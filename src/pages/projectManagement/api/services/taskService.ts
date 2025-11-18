// services/taskService.ts
// Unified task management service with local/API routing

import { UnifiedTask, CreateTaskInput, ReviewAction } from '../../admin/types/admin.types';
import { isFeatureEnabled } from '../../config/featureFlags';
import { mockAdminTasks } from '../../admin/utils/mockAdminData';
import { apiClient } from '../client/apiClient';

// ============================================
// LOCAL DATA STORE
// ============================================

// In-memory task store (will be replaced by API)
let localTasks: UnifiedTask[] = [...mockAdminTasks];

// Subscribe to task changes
type TaskListener = (tasks: UnifiedTask[]) => void;
const listeners: TaskListener[] = [];

const notifyListeners = () => {
    listeners.forEach(listener => listener([...localTasks]));
};

// ============================================
// TASK SERVICE
// ============================================

export const taskService = {
    // ============================================
    // READ OPERATIONS
    // ===================================api=========

    /**
     * Get all tasks (admin only)
     */
    async getAllTasks(): Promise<UnifiedTask[]> {
        if (isFeatureEnabled('USE_TASK_API')) {
            try {
                const response = await apiClient.get('/api/tasks');
                console.log('[TaskService] Fetched all tasks from API');
                return response.data.tasks;
            } catch (error) {
                console.error('[TaskService] API failed, using local fallback:', error);
                return Promise.resolve([...localTasks]);
            }
        }

        // Local mock
        console.log('[TaskService] Using local tasks:', localTasks.length);
        return Promise.resolve([...localTasks]);
    },

    /**
     * Get tasks for a specific user
     */
    async getTasksByUser(userEmail: string): Promise<UnifiedTask[]> {
        if (isFeatureEnabled('USE_TASK_API')) {
            try {
                const response = await apiClient.get(`/api/tasks?assignedTo=${userEmail}`);
                console.log(`[TaskService] Fetched tasks for ${userEmail} from API`);
                return response.data.tasks;
            } catch (error) {
                console.error('[TaskService] API failed, using local fallback:', error);
                const userTasks = localTasks.filter(task => task.assignedTo === userEmail);
                return Promise.resolve([...userTasks]);
            }
        }

        // Local mock - filter by assignedTo
        const userTasks = localTasks.filter(task => task.assignedTo === userEmail);
        console.log(`[TaskService] Using local tasks for ${userEmail}:`, userTasks.length);
        return Promise.resolve([...userTasks]);
    },

    /**
     * Get single task by ID
     */
    async getTaskById(taskId: string): Promise<UnifiedTask | null> {
        if (isFeatureEnabled('USE_TASK_API')) {
            try {
                const response = await apiClient.get(`/api/tasks/${taskId}`);
                console.log(`[TaskService] Fetched task ${taskId} from API`);
                return response.data;
            } catch (error) {
                console.error('[TaskService] API failed, using local fallback:', error);
                const task = localTasks.find(t => t.id === taskId);
                return Promise.resolve(task || null);
            }
        }

        // Local mock
        const task = localTasks.find(t => t.id === taskId);
        console.log(`[TaskService] Using local task ${taskId}:`, task ? 'found' : 'not found');
        return Promise.resolve(task || null);
    },

    // ============================================
    // CREATE/UPDATE OPERATIONS
    // ============================================

    /**
     * Create new task (admin only)
     */
    async createTask(input: CreateTaskInput, createdBy: string): Promise<UnifiedTask> {
        if (isFeatureEnabled('USE_TASK_API')) {
            try {
                const response = await apiClient.post('/api/tasks', { ...input, createdBy });
                console.log('[TaskService] Created task via API:', response.data.id);
                return response.data;
            } catch (error) {
                console.error('[TaskService] API failed, using local fallback:', error);
                // Fall through to local creation
            }
        }

        // Local mock
        const newTask: UnifiedTask = {
            id: `task-${Date.now()}`,
            stage: 'pending_upload',
            priority: input.priority,
            title: input.title,
            description: input.description,
            requirements: input.requirements,
            referenceLinks: input.referenceLinks,
            assignedTo: input.assignedTo,
            createdBy,
            createdAt: new Date(),
            updatedAt: new Date(),
            dueDate: input.dueDate,
            uploadData: {
                requiredFileCount: input.requiredFileCount,
                uploadedFiles: [],
            },
            labelingData: {
                labels: [],
            },
            history: [
                {
                    timestamp: new Date(),
                    action: 'created',
                    user: createdBy,
                    notes: input.assignedTo
                        ? `Task created and assigned to ${input.assignedTo}`
                        : 'Task created (unassigned)',
                },
            ],
        };

        localTasks = [newTask, ...localTasks];
        notifyListeners();
        console.log('[TaskService] Created local task:', newTask.id);
        return Promise.resolve(newTask);
    },

    /**
     * Assign task to a user
     */
    async assignTask(taskId: string, userEmail: string, assignedBy: string): Promise<UnifiedTask> {
        if (isFeatureEnabled('USE_TASK_API')) {
            try {
                const response = await apiClient.post(`/api/tasks/${taskId}/assign`, {
                    assignedTo: userEmail,
                    assignedBy,
                });
                console.log('[TaskService] Assigned task via API:', taskId, '→', userEmail);
                return response.data;
            } catch (error) {
                console.error('[TaskService] API failed, using local fallback:', error);
                // Fall through to local
            }
        }

        // Local mock
        const task = localTasks.find(t => t.id === taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }

        const updates: Partial<UnifiedTask> = {
            assignedTo: userEmail,
            history: [
                ...task.history,
                {
                    timestamp: new Date(),
                    action: 'assigned',
                    user: assignedBy,
                    notes: `Task assigned to ${userEmail}`,
                },
            ],
        };

        console.log('[TaskService] Assigned local task:', taskId, '→', userEmail);
        return this.updateTask(taskId, updates);
    },

    /**
     * Update existing task
     */
    async updateTask(taskId: string, updates: Partial<UnifiedTask>): Promise<UnifiedTask> {
        if (isFeatureEnabled('USE_TASK_API')) {
            try {
                const response = await apiClient.patch(`/api/tasks/${taskId}`, updates);
                console.log('[TaskService] Updated task via API:', taskId);
                return response.data;
            } catch (error) {
                console.error('[TaskService] API failed, using local fallback:', error);
                // Fall through to local update
            }
        }

        // Local mock
        const index = localTasks.findIndex(t => t.id === taskId);
        if (index === -1) {
            throw new Error(`Task ${taskId} not found`);
        }

        localTasks[index] = {
            ...localTasks[index],
            ...updates,
            updatedAt: new Date(),
        };

        notifyListeners();
        console.log('[TaskService] Updated local task:', taskId);
        return Promise.resolve(localTasks[index]);
    },

    // ============================================
    // WORKFLOW OPERATIONS
    // ============================================

    /**
     * Advance task to next stage
     */
    async advanceStage(
        taskId: string,
        newStage: UnifiedTask['stage'],
        user: string,
        notes?: string
    ): Promise<UnifiedTask> {
        if (isFeatureEnabled('USE_TASK_API')) {
            try {
                const response = await apiClient.post(`/api/tasks/${taskId}/advance-stage`, {
                    newStage,
                    user,
                    notes,
                });
                console.log('[TaskService] Advanced stage via API:', taskId, '→', newStage);
                return response.data;
            } catch (error) {
                console.error('[TaskService] API failed, using local fallback:', error);
                // Fall through to local
            }
        }

        // Local mock
        const task = localTasks.find(t => t.id === taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }

        const updatedTask: UnifiedTask = {
            ...task,
            stage: newStage,
            updatedAt: new Date(),
            history: [
                ...task.history,
                {
                    timestamp: new Date(),
                    action: newStage,
                    user,
                    notes,
                },
            ],
        };

        return this.updateTask(taskId, updatedTask);
    },

    /**
     * Review submission (approve or reject)
     */
    async reviewSubmission(action: ReviewAction, reviewer: string): Promise<UnifiedTask> {
        if (isFeatureEnabled('USE_TASK_API')) {
            try {
                const response = await apiClient.post(`/api/tasks/${action.taskId}/review`, {
                    ...action,
                    reviewer,
                });
                console.log('[TaskService] Reviewed submission via API:', action.taskId);
                return response.data;
            } catch (error) {
                console.error('[TaskService] API failed, using local fallback:', error);
                // Fall through to local
            }
        }

        // Local mock
        const task = localTasks.find(t => t.id === action.taskId);
        if (!task) {
            throw new Error(`Task ${action.taskId} not found`);
        }

        let newStage: UnifiedTask['stage'];
        const isUploadReview = task.stage === 'upload_review';

        if (action.approved) {
            newStage = isUploadReview ? 'upload_approved' : 'labeling_approved';
        } else {
            newStage = isUploadReview ? 'pending_upload' : 'pending_labeling';
        }

        const reviewData = {
            reviewedBy: reviewer,
            reviewedAt: new Date(),
            approved: action.approved,
            notes: action.notes,
        };

        const updates: Partial<UnifiedTask> = {
            stage: newStage,
            updatedAt: new Date(),
        };

        if (isUploadReview && task.uploadData) {
            updates.uploadData = {
                ...task.uploadData,
                review: reviewData,
            };
        } else if (task.labelingData) {
            updates.labelingData = {
                ...task.labelingData,
                review: reviewData,
            };
        }

        updates.history = [
            ...task.history,
            {
                timestamp: new Date(),
                action: action.approved
                    ? (isUploadReview ? 'upload_approved' : 'labeling_approved')
                    : (isUploadReview ? 'upload_rejected' : 'labeling_rejected'),
                user: reviewer,
                notes: action.notes,
            },
        ];

        console.log('[TaskService] Reviewed local submission:', action.taskId, action.approved ? 'approved' : 'rejected');
        return this.updateTask(action.taskId, updates);
    },

    // ============================================
    // FILE UPLOAD OPERATIONS
    // ============================================

    /**
     * Submit files for review
     */
    async submitFilesForReview(
        taskId: string,
        files: Array<{ name: string; size: number }>,
        user: string
    ): Promise<UnifiedTask> {
        const task = await this.getTaskById(taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }

        const uploadedFiles = files.map(file => ({
            name: file.name,
            size: file.size,
            uploadedAt: new Date(),
        }));

        const updates: Partial<UnifiedTask> = {
            stage: 'upload_review',
            uploadData: {
                ...task.uploadData!,
                uploadedFiles: [...task.uploadData!.uploadedFiles, ...uploadedFiles],
            },
            history: [
                ...task.history,
                {
                    timestamp: new Date(),
                    action: 'files_uploaded',
                    user,
                    notes: `Uploaded ${files.length} file(s)`,
                },
            ],
        };

        console.log('[TaskService] Submitted files for review:', taskId, files.length);
        return this.updateTask(taskId, updates);
    },

    // ============================================
    // LABELING OPERATIONS
    // ============================================

    /**
     * Submit labels for review
     */
    async submitLabelsForReview(
        taskId: string,
        labels: string[],
        geometryId: string,
        user: string
    ): Promise<UnifiedTask> {
        const task = await this.getTaskById(taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }

        const updates: Partial<UnifiedTask> = {
            stage: 'labeling_review',
            labelingData: {
                ...task.labelingData!,
                labels,
                geometryId,
            },
            history: [
                ...task.history,
                {
                    timestamp: new Date(),
                    action: 'labels_submitted',
                    user,
                    notes: `Submitted ${labels.length} label(s) for review`,
                },
            ],
        };

        console.log('[TaskService] Submitted labels for review:', taskId, labels.length);
        return this.updateTask(taskId, updates);
    },

    // ============================================
    // SUBSCRIPTIONS
    // ============================================

    /**
     * Subscribe to task changes
     * Returns unsubscribe function
     */
    subscribe(listener: TaskListener): () => void {
        listeners.push(listener);
        console.log('[TaskService] New subscriber added. Total:', listeners.length);

        // Return unsubscribe function
        return () => {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
                console.log('[TaskService] Subscriber removed. Total:', listeners.length);
            }
        };
    },

    // ============================================
    // UTILITIES (for debugging)
    // ============================================

    /**
     * Get local tasks directly (for debugging)
     */
    _getLocalTasks(): UnifiedTask[] {
        return [...localTasks];
    },

    /**
     * Reset local tasks to initial state (for testing)
     */
    _resetLocalTasks(): void {
        localTasks = [...mockAdminTasks];
        notifyListeners();
        console.log('[TaskService] Local tasks reset to initial state');
    },

    /**
     * Manually trigger listener notifications (for testing)
     */
    _notifyListeners(): void {
        notifyListeners();
        console.log('[TaskService] Manually notified all listeners');
    },
};

// Expose to window for debugging
if (typeof window !== 'undefined') {
    (window as any).taskService = taskService;
    console.log('[TaskService] Exposed to window.taskService for debugging');
}