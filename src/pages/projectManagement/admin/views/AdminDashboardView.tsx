// admin/views/AdminDashboardView.tsx
import React, { useState } from "react";
import styled from "styled-components";
import { Plus, Filter, Search } from "lucide-react";
import { UnifiedTask, CreateTaskInput, ReviewAction } from "../types/admin.types";
import { AdminTaskBoard } from "../components/AdminTaskBoard";
import { TaskCreationForm } from "../components/TaskCreationForm";
import { ReviewSubmissionModal } from "../components/ReviewSubmissionModal";
import { mockAdminTasks } from "../utils/mockAdminData";
import {BaseButton} from "components/buttons/BaseButton";

interface AdminDashboardViewProps {
    onTaskClick?: (task: UnifiedTask) => void;
    onCreateTask?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
                                                                          onTaskClick,
                                                                      }) => {
    const [tasks, setTasks] = useState<UnifiedTask[]>(mockAdminTasks);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterPriority, setFilterPriority] = useState<string>("all");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [reviewingTask, setReviewingTask] = useState<UnifiedTask | null>(null);

    // Filter tasks based on search and priority
    const filteredTasks = tasks.filter((task) => {
        const matchesSearch =
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesPriority = filterPriority === "all" || task.priority === filterPriority;

        return matchesSearch && matchesPriority;
    });

    const handleViewSubmission = (task: UnifiedTask) => {
        console.log("🔍 View submission clicked:", task); // Add this
        setReviewingTask(task);
    };

    const handleEdit = (task: UnifiedTask) => {
        console.log("Edit task:", task);
        onTaskClick?.(task);
        // TODO: Navigate to edit view or open edit modal
    };

    const handleApproveSubmission = (action: ReviewAction) => {
        setTasks((prev) =>
            prev.map((task) => {
                if (task.id !== action.taskId) return task;

                // Determine which stage to advance to
                let newStage: UnifiedTask['stage'];
                const isUploadReview = task.stage === 'upload_review';

                if (isUploadReview) {
                    // Upload approved -> ready for labeling
                    newStage = 'upload_approved';
                } else {
                    // Labeling approved -> completed
                    newStage = 'labeling_approved';
                }

                // Update the appropriate review data
                const updatedTask: UnifiedTask = {
                    ...task,
                    stage: newStage,
                    updatedAt: new Date(),
                };

                if (isUploadReview && task.uploadData) {
                    updatedTask.uploadData = {
                        ...task.uploadData,
                        review: {
                            reviewedBy: 'admin@mecado.com', // TODO: Get from auth
                            reviewedAt: new Date(),
                            approved: true,
                            notes: action.notes,
                        },
                    };
                } else if (task.labelingData) {
                    updatedTask.labelingData = {
                        ...task.labelingData,
                        review: {
                            reviewedBy: 'admin@mecado.com', // TODO: Get from auth
                            reviewedAt: new Date(),
                            approved: true,
                            notes: action.notes,
                        },
                    };
                }

                // Add to history
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
        console.log("Approved submission:", action);
        // TODO Phase 2: Call API
        // await taskService.reviewTask(action.taskId, action);
    };

    const handleRejectSubmission = (action: ReviewAction) => {
        setTasks((prev) =>
            prev.map((task) => {
                if (task.id !== action.taskId) return task;

                // Determine which stage to send back to
                let newStage: UnifiedTask['stage'];
                const isUploadReview = task.stage === 'upload_review';

                if (isUploadReview) {
                    // Upload rejected -> back to pending upload
                    newStage = 'pending_upload';
                } else {
                    // Labeling rejected -> back to pending labeling (don't redo upload)
                    newStage = 'pending_labeling';
                }

                // Update the appropriate review data with rejection
                const updatedTask: UnifiedTask = {
                    ...task,
                    stage: newStage,
                    updatedAt: new Date(),
                };

                if (isUploadReview && task.uploadData) {
                    updatedTask.uploadData = {
                        ...task.uploadData,
                        review: {
                            reviewedBy: 'admin@mecado.com', // TODO: Get from auth
                            reviewedAt: new Date(),
                            approved: false,
                            notes: action.notes, // This is the rejection reason
                        },
                    };
                } else if (task.labelingData) {
                    updatedTask.labelingData = {
                        ...task.labelingData,
                        review: {
                            reviewedBy: 'admin@mecado.com', // TODO: Get from auth
                            reviewedAt: new Date(),
                            approved: false,
                            notes: action.notes, // This is the rejection reason
                        },
                    };
                }

                // Add to history
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
        console.log("Rejected submission:", action);
        // TODO Phase 2: Call API
        // await taskService.reviewTask(action.taskId, action);
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
            createdBy: "admin@mecado.com", // TODO: Get from auth
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

        console.log("Created task:", newTask);
        // TODO Phase 2: Call API
        // await taskService.createTask(input);
    };

    return (
        <>
            <DashboardContainer>
                <DashboardHeader>
                    <HeaderTop>
                        <HeaderContent>
                            <Title>⚙️ Admin Task Management</Title>
                            <Subtitle>Manage and review all annotation tasks</Subtitle>
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

                    {/* Filters */}
                    <FiltersRow>
                        <SearchBar>
                            <SearchIcon>
                                <Search size={16} />
                            </SearchIcon>
                            <SearchInput
                                type="text"
                                placeholder="Search tasks by title, description, or user..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </SearchBar>

                        <FilterGroup>
                            <FilterIcon>
                                <Filter size={16} />
                            </FilterIcon>
                            <FilterLabel>Priority:</FilterLabel>
                            <FilterSelect
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="urgent">Urgent</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </FilterSelect>
                        </FilterGroup>
                    </FiltersRow>
                </DashboardHeader>

                <BoardWrapper>
                    <AdminTaskBoard
                        tasks={filteredTasks}
                        onViewSubmission={handleViewSubmission}
                        onEdit={handleEdit}
                    />
                </BoardWrapper>
            </DashboardContainer>

            {/* Task Creation Form Modal */}
            {showCreateForm && (
                <TaskCreationForm
                    onSubmit={handleCreateTaskSubmit}
                    onCancel={() => setShowCreateForm(false)}
                />
            )}

            {/* Review Submission Modal */}
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
// 🔹 Styled Components (same as before)
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

    &:hover:not(:disabled) {
        opacity: 0.9;
        transform: translateY(-1px);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }
`;

const FiltersRow = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing[4]};
    align-items: center;
    flex-wrap: wrap;
`;

const SearchBar = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[2]};
    flex: 1;
    min-width: 300px;
    padding: ${({ theme }) => `${theme.primitives.paddingY.xsm} ${theme.primitives.paddingX.sm}`};
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    border: 1px solid ${({ theme }) => theme.colors.borderSubtle};
    border-radius: ${({ theme }) => theme.radius.md};

    &:focus-within {
        border-color: ${({ theme }) => theme.colors.brandPrimary};
    }
`;

const SearchIcon = styled.div`
    display: flex;
    color: ${({ theme }) => theme.colors.textMuted};
`;

const SearchInput = styled.input`
    flex: 1;
    border: none;
    background: none;
    outline: none;
    font-size: ${({ theme }) => theme.typography.size.md};
    color: ${({ theme }) => theme.colors.textPrimary};

    &::placeholder {
        color: ${({ theme }) => theme.colors.textMuted};
    }
`;

const FilterGroup = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[2]};
    padding: ${({ theme }) => `${theme.primitives.paddingY.xsm} ${theme.primitives.paddingX.sm}`};
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    border: 1px solid ${({ theme }) => theme.colors.borderSubtle};
    border-radius: ${({ theme }) => theme.radius.md};
`;

const FilterIcon = styled.div`
    display: flex;
    color: ${({ theme }) => theme.colors.textMuted};
`;

const FilterLabel = styled.span`
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.textMuted};
    font-weight: ${({ theme }) => theme.typography.weight.medium};
`;

const FilterSelect = styled.select`
    border: none;
    background: none;
    outline: none;
    font-size: ${({ theme }) => theme.typography.size.md};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-weight: ${({ theme }) => theme.typography.weight.medium};
    cursor: pointer;
    padding: ${({ theme }) => `${theme.primitives.paddingY.xxs} ${theme.primitives.paddingX.xsm}`};
    border-radius: ${({ theme }) => theme.radius.sm};

    &:hover {
        background: ${({ theme }) => theme.colors.backgroundPrimary};
    }
`;

const BoardWrapper = styled.div`
    flex: 1;
    overflow: hidden;
`;