// admin/views/AdminDashboardView.tsx
import React, {useState, useMemo} from "react";
import styled from "styled-components";
import {Plus} from "lucide-react";
import {UnifiedTask, CreateTaskInput, ReviewAction} from "../types/admin.types";
import {AdminTaskBoard} from "../components/AdminTaskBoard";
import {AdminTasksTable} from "../components/AdminTasksTable";
import {TaskCreationForm} from "../components/TaskCreationForm";
import {ReviewSubmissionModal} from "../components/ReviewSubmissionModal";
import {AdminViewControls, ViewMode, SortBy, SortOrder, StatusFilter} from "../components/AdminViewControls";
import {mockAdminTasks} from "../utils/mockAdminData";
import {BaseButton} from "components/buttons/BaseButton";

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
    const [tasks, setTasks] = useState<UnifiedTask[]>(mockAdminTasks);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [reviewingTask, setReviewingTask] = useState<UnifiedTask | null>(null);

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

    // Get unique users for filter dropdown
    const availableUsers = useMemo(() => {
        const users = Array.from(new Set(tasks.map(t => t.assignedTo)));
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
                task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
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
                    comparison = a.assignedTo.localeCompare(b.assignedTo);
                    break;

                case 'priority':
                    const priorityOrder = {urgent: 0, high: 1, medium: 2, low: 3};
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
        console.log("🔍 View submission clicked for task:", task.id, task.title);
        setReviewingTask(task);
    };

    const handleEdit = (task: UnifiedTask) => {
        console.log("Edit task:", task);
        onTaskClick?.(task);
    };

    const handleApproveSubmission = (action: ReviewAction) => {
        setTasks((prev) =>
            prev.map((task) => {
                if (task.id !== action.taskId) return task;

                let newStage: UnifiedTask['stage'];
                const isUploadReview = task.stage === 'upload_review';

                if (isUploadReview) {
                    newStage = 'upload_approved';
                } else {
                    newStage = 'labeling_approved';
                }

                const updatedTask: UnifiedTask = {
                    ...task,
                    stage: newStage,
                    updatedAt: new Date(),
                };

                if (isUploadReview && task.uploadData) {
                    updatedTask.uploadData = {
                        ...task.uploadData,
                        review: {
                            reviewedBy: 'admin@mecado.com',
                            reviewedAt: new Date(),
                            approved: true,
                            notes: action.notes,
                        },
                    };
                } else if (task.labelingData) {
                    updatedTask.labelingData = {
                        ...task.labelingData,
                        review: {
                            reviewedBy: 'admin@mecado.com',
                            reviewedAt: new Date(),
                            approved: true,
                            notes: action.notes,
                        },
                    };
                }

                updatedTask.history = [
                    ...task.history,
                    {
                        timestamp: new Date(),
                        action: isUploadReview ? 'upload_approved' : 'labeling_approved',
                        user: 'admin@mecado.com',
                        notes: action.notes,
                    },
                ];

                return updatedTask;
            })
        );

        setReviewingTask(null);
    };

    const handleRejectSubmission = (action: ReviewAction) => {
        setTasks((prev) =>
            prev.map((task) => {
                if (task.id !== action.taskId) return task;

                let newStage: UnifiedTask['stage'];
                const isUploadReview = task.stage === 'upload_review';

                if (isUploadReview) {
                    newStage = 'pending_upload';
                } else {
                    newStage = 'pending_labeling';
                }

                const updatedTask: UnifiedTask = {
                    ...task,
                    stage: newStage,
                    updatedAt: new Date(),
                };

                if (isUploadReview && task.uploadData) {
                    updatedTask.uploadData = {
                        ...task.uploadData,
                        review: {
                            reviewedBy: 'admin@mecado.com',
                            reviewedAt: new Date(),
                            approved: false,
                            notes: action.notes,
                        },
                    };
                } else if (task.labelingData) {
                    updatedTask.labelingData = {
                        ...task.labelingData,
                        review: {
                            reviewedBy: 'admin@mecado.com',
                            reviewedAt: new Date(),
                            approved: false,
                            notes: action.notes,
                        },
                    };
                }

                updatedTask.history = [
                    ...task.history,
                    {
                        timestamp: new Date(),
                        action: isUploadReview ? 'upload_rejected' : 'labeling_rejected',
                        user: 'admin@mecado.com',
                        notes: action.notes,
                    },
                ];

                return updatedTask;
            })
        );

        setReviewingTask(null);
    };

    const handleCreateTaskSubmit = (input: CreateTaskInput) => {
        const newTask: UnifiedTask = {
            id: `task-${Date.now()}`,
            stage: "pending_upload",
            priority: input.priority,
            title: input.title,
            description: input.description,
            requirements: input.requirements,
            referenceLinks: input.referenceLinks,
            assignedTo: input.assignedTo,
            createdBy: "admin@mecado.com",
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
                    action: "created",
                    user: "admin@mecado.com",
                    notes: `Task created and assigned to ${input.assignedTo}`,
                },
            ],
        };

        setTasks([newTask, ...tasks]);
        setShowCreateForm(false);
    };

    return (
        <>
            <DashboardContainer>
                <DashboardHeader>
                    <HeaderTop>
                        <HeaderContent>
                            <Title>Task Management</Title>
                            <Subtitle>Manage and review all annotation tasks</Subtitle>
                        </HeaderContent>
                        <HeaderActions>
                            <CreateTaskButton
                                $variant="primary"
                                onClick={() => setShowCreateForm(true)}
                            >
                                <Plus size={18}/>
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
                            onViewSubmission={handleViewSubmission}
                            onEdit={handleEdit}
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
    background: ${({theme}) => theme.colors.backgroundPrimary};
`;

const DashboardHeader = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing[4]};
    padding: ${({theme}) => theme.spacing[6]};
    background: ${({theme}) => theme.colors.backgroundSecondary};
    border-bottom: 1px solid ${({theme}) => theme.colors.borderDefault};
`;

const HeaderTop = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
`;

const HeaderContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing[1]};
`;

const Title = styled.h1`
    font-size: ${({theme}) => theme.typography.size.xxl};
    font-weight: ${({theme}) => theme.typography.weight.bold};
    color: ${({theme}) => theme.colors.textPrimary};
    margin: 0;
`;

const Subtitle = styled.p`
    font-size: ${({theme}) => theme.typography.size.md};
    color: ${({theme}) => theme.colors.textMuted};
    margin: 0;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${({theme}) => theme.spacing[3]};
    align-items: center;
`;

const CreateTaskButton = styled(BaseButton)`
    display: flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing[1]};
    background: ${({theme}) => theme.colors.brandPrimary};
    color: ${({theme}) => theme.colors.textInverted};
    padding: ${({theme}) => `${theme.primitives.paddingY.sm} ${theme.primitives.paddingX.lg}`};

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