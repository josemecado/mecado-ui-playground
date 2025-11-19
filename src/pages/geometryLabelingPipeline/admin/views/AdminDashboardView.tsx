// admin/views/AdminDashboardView.tsx
// Updated for new structure with consolidated types and reorganized components

import React, { useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import { Plus } from "lucide-react";

// ============================================
// NEW STRUCTURE IMPORTS - Types
// ============================================
import { UnifiedTask, CreateTaskInput, ReviewAction, User } from "../../types";

// ============================================
// NEW STRUCTURE IMPORTS - Components
// ============================================
// Board components
import { AdminTaskBoard } from "../components/board/AdminTaskBoard";

// Table components
import { AdminTasksTable } from "../components/table/AdminTasksTable";

// Form components
import { TaskCreationForm } from "../components/forms/TaskCreationForm";
import { TaskEditForm } from "../components/forms/TaskEditForm";
import { ReviewSubmissionModal } from "../components/forms/ReviewSubmissionModal";

// Control components
import {
    AdminViewControls,
    ViewMode,
    SortBy,
    SortOrder,
    StatusFilter,
} from "../components/controls/AdminViewControls";

// ============================================
// NEW STRUCTURE IMPORTS - Services & Data
// ============================================
import { taskService } from "../../services/taskService";
import { mockUsers } from "../../services/mockData";

// ============================================
// KEEP - Context & Shared Components
// ============================================
import { useUser } from "../../context/UserContext";
import {BaseButton} from "components/buttons/BaseButton";

// ============================================
// COMPONENT
// ============================================

interface AdminDashboardViewProps {
    onTaskClick?: (task: UnifiedTask) => void;
    onCreateTask?: () => void;
}

// Helper to map stage to column status for filtering
const getColumnStatus = (stage: UnifiedTask['stage']): StatusFilter => {
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
};

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
                                                                          onTaskClick,
                                                                      }) => {
    const { currentUser } = useUser();
    const [tasks, setTasks] = useState<UnifiedTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [reviewingTask, setReviewingTask] = useState<UnifiedTask | null>(null);
    const [editingTask, setEditingTask] = useState<UnifiedTask | null>(null);

    // View mode
    const [viewMode, setViewMode] = useState<ViewMode>('board');

    // Search
    const [searchQuery, setSearchQuery] = useState("");

    // Filters
    const [filterPriority, setFilterPriority] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<StatusFilter>("all");
    const [filterAssignedTo, setFilterAssignedTo] = useState<string>("all");

    // Sorting
    const [sortBy, setSortBy] = useState<SortBy>('status');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    // Load all tasks on mount (admin can see everything)
    useEffect(() => {
        const loadTasks = async () => {
            setLoading(true);
            try {
                const allTasks = await taskService.getAllTasks();
                setTasks(allTasks);
            } catch (error) {
                console.error('[AdminDashboardView] Failed to load tasks:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTasks();

        // Subscribe to task changes
        const unsubscribe = taskService.subscribe((updatedTasks) => {
            setTasks(updatedTasks);
        });

        return unsubscribe;
    }, []);

    // Get unique users for filter dropdown (FILTER OUT UNDEFINED)
    const availableUsers = useMemo(() => {
        const users = Array.from(
            new Set(
                tasks
                    .map(t => t.assignedTo)
                    .filter((email): email is string => email !== undefined)
            )
        );
        return users.sort();
    }, [tasks]);

    // Filter and sort tasks
    const filteredAndSortedTasks = useMemo(() => {
        let result = [...tasks];

        // Apply search filter
        if (searchQuery) {
            result = result.filter((task) =>
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply priority filter
        if (filterPriority !== "all") {
            result = result.filter(task => task.priority === filterPriority);
        }

        // Apply status filter
        if (filterStatus !== "all") {
            result = result.filter(task => {
                const columnStatus = getColumnStatus(task.stage);
                return columnStatus === filterStatus;
            });
        }

        // Apply assigned to filter
        if (filterAssignedTo !== "all") {
            result = result.filter(task => task.assignedTo === filterAssignedTo);
        }

        // Apply sorting
        result.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;

                case 'assignedTo':
                    comparison = (a.assignedTo || '').localeCompare(b.assignedTo || '');
                    break;

                case 'priority':
                    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
                    comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
                    break;

                case 'dueDate':
                    const aDate = a.dueDate?.getTime() || Infinity;
                    const bDate = b.dueDate?.getTime() || Infinity;
                    comparison = aDate - bDate;
                    break;

                case 'status':
                    const statusOrder = {
                        pending_upload: 0,
                        upload_review: 1,
                        upload_approved: 2,
                        pending_labeling: 3,
                        labeling_review: 4,
                        labeling_approved: 5,
                        completed: 6,
                        failed: 7,
                    };
                    comparison = statusOrder[a.stage] - statusOrder[b.stage];
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [tasks, searchQuery, filterPriority, filterStatus, filterAssignedTo, sortBy, sortOrder]);

    const handleViewSubmission = (task: UnifiedTask) => {
        console.log('[AdminDashboardView] View submission clicked for task:', task.id, task.title);
        setReviewingTask(task);
    };

    const handleEdit = (task: UnifiedTask) => {
        console.log('[AdminDashboardView] Edit task:', task.id, task.title);
        setEditingTask(task);
    };

    const handleEditSubmit = async (taskId: string, updates: Partial<UnifiedTask>) => {
        if (!currentUser) {
            alert('No user logged in');
            return;
        }

        try {
            // Add history entry for the edit
            const historyEntry = {
                timestamp: new Date(),
                action: 'edited',
                user: currentUser.email,
                notes: 'Task details updated',
            };

            const task = tasks.find(t => t.id === taskId);
            const updatesWithHistory = {
                ...updates,
                history: task ? [...task.history, historyEntry] : [historyEntry],
            };

            await taskService.updateTask(taskId, updatesWithHistory);
            setEditingTask(null);
            console.log('[AdminDashboardView] Updated task:', taskId);
        } catch (error) {
            console.error('[AdminDashboardView] Failed to update task:', error);
            alert('Failed to update task');
        }
    };

    const handleApproveSubmission = async (action: ReviewAction) => {
        if (!currentUser) {
            alert('No user logged in');
            return;
        }

        try {
            await taskService.reviewSubmission(
                { ...action, approved: true },
                currentUser.email
            );
            setReviewingTask(null);
            console.log('[AdminDashboardView] Approved submission:', action.taskId);
        } catch (error) {
            console.error('[AdminDashboardView] Failed to approve submission:', error);
            alert('Failed to approve submission');
        }
    };

    const handleRejectSubmission = async (action: ReviewAction) => {
        if (!currentUser) {
            alert('No user logged in');
            return;
        }

        try {
            await taskService.reviewSubmission(
                { ...action, approved: false },
                currentUser.email
            );
            setReviewingTask(null);
            console.log('[AdminDashboardView] Rejected submission:', action.taskId);
        } catch (error) {
            console.error('[AdminDashboardView] Failed to reject submission:', error);
            alert('Failed to reject submission');
        }
    };

    const handleCreateTaskSubmit = async (input: CreateTaskInput) => {
        if (!currentUser) {
            alert('No user logged in');
            return;
        }

        try {
            await taskService.createTask(input, currentUser.email);
            setShowCreateForm(false);
            console.log('[AdminDashboardView] Created task:', input.title);
        } catch (error) {
            console.error('[AdminDashboardView] Failed to create task:', error);
            alert('Failed to create task');
        }
    };

    const handleAssignTask = async (taskId: string, userEmail: string) => {
        if (!currentUser) {
            alert('No user logged in');
            return;
        }

        try {
            await taskService.assignTask(taskId, userEmail, currentUser.email);
            console.log('[AdminDashboardView] Assigned task:', taskId, '→', userEmail);
        } catch (error) {
            console.error('[AdminDashboardView] Failed to assign task:', error);
            alert('Failed to assign task');
        }
    };

    if (loading) {
        return (
            <DashboardContainer>
                <LoadingState>
                    <LoadingSpinner />
                    <LoadingText>Loading tasks...</LoadingText>
                </LoadingState>
            </DashboardContainer>
        );
    }

    return (
        <>
            <DashboardContainer>
                <DashboardHeader>
                    <HeaderTop>
                        <HeaderContent>
                            <Title>Task Management</Title>
                            <Subtitle>
                                Manage and review all annotation tasks ({tasks.length} total)
                            </Subtitle>
                        </HeaderContent>
                        <HeaderActions>
                            <CreateTaskButton
                                $variant="primary"
                                onClick={() => setShowCreateForm(true)}
                            >
                                <Plus size={18} />
                                Create Task
                            </CreateTaskButton>
                        </HeaderActions>
                    </HeaderTop>

                    {/* View Controls: Tabs, Filters, Sorting */}
                    <AdminViewControls
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        filterPriority={filterPriority}
                        onFilterPriorityChange={setFilterPriority}
                        filterStatus={filterStatus}
                        onFilterStatusChange={setFilterStatus}
                        filterAssignedTo={filterAssignedTo}
                        onFilterAssignedToChange={setFilterAssignedTo}
                        sortBy={sortBy}
                        onSortByChange={setSortBy}
                        sortOrder={sortOrder}
                        onSortOrderChange={setSortOrder}
                        availableUsers={availableUsers}
                    />
                </DashboardHeader>

                <ContentWrapper>
                    {viewMode === 'board' ? (
                        <AdminTaskBoard
                            tasks={filteredAndSortedTasks}
                            availableUsers={mockUsers}
                            onViewSubmission={handleViewSubmission}
                            onEdit={handleEdit}
                            onAssign={handleAssignTask}
                        />
                    ) : (
                        <AdminTasksTable
                            tasks={filteredAndSortedTasks}
                            onViewSubmission={handleViewSubmission}
                            onEdit={handleEdit}
                        />
                    )}
                </ContentWrapper>
            </DashboardContainer>

            {showCreateForm && (
                <TaskCreationForm
                    onSubmit={handleCreateTaskSubmit}
                    onCancel={() => setShowCreateForm(false)}
                />
            )}

            {editingTask && (
                <TaskEditForm
                    task={editingTask}
                    onSubmit={handleEditSubmit}
                    onCancel={() => setEditingTask(null)}
                />
            )}

            {reviewingTask && (
                <ReviewSubmissionModal
                    task={reviewingTask}
                    onApprove={handleApproveSubmission}
                    onReject={handleRejectSubmission}
                    onClose={() => setReviewingTask(null)}
                />
            )}
        </>
    );
};

// ======================
// 🔹 Styled Components
// ======================

const DashboardContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background: ${({ theme }) => theme.colors.backgroundPrimary};
`;

const DashboardHeader = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[4]};
    padding: ${({ theme }) => theme.spacing[6]};
    background: ${({ theme }) => theme.colors.backgroundSecondary};
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

const HeaderTop = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
`;

const HeaderContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[1]};
`;

const Title = styled.h1`
    font-size: ${({ theme }) => theme.typography.size.xxl};
    font-weight: ${({ theme }) => theme.typography.weight.bold};
    color: ${({ theme }) => theme.colors.textPrimary};
    margin: 0;
`;

const Subtitle = styled.p`
    font-size: ${({ theme }) => theme.typography.size.md};
    color: ${({ theme }) => theme.colors.textMuted};
    margin: 0;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing[3]};
    align-items: center;
`;

const CreateTaskButton = styled(BaseButton)`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[1]};
    background: ${({ theme }) => theme.colors.brandPrimary};
    color: ${({ theme }) => theme.colors.textInverted};
    padding: ${({ theme }) => `${theme.primitives.paddingY.sm} ${theme.primitives.paddingX.lg}`};

    &:hover:not(:disabled) {
        opacity: 0.9;
        transform: translateY(-1px);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }
`;

const ContentWrapper = styled.div`
    flex: 1;
    overflow: hidden;
`;

const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: ${({ theme }) => theme.spacing[4]};
`;

const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    border: 4px solid ${({ theme }) => theme.colors.borderSubtle};
    border-top-color: ${({ theme }) => theme.colors.brandPrimary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: ${({ theme }) => theme.typography.size.md};
    color: ${({ theme }) => theme.colors.textMuted};
`;