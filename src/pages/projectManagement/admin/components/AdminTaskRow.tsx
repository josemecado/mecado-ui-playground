// admin/components/AdminTaskRow.tsx
import React from "react";
import styled from "styled-components";
import { UnifiedTask } from "../types/admin.types";
import { getUsernameFromEmail, getPriorityInfo, getDaysUntilDue, isTaskOverdue } from "../utils/adminHelpers";
import { BaseButton } from "components/buttons/BaseButton";
import { Upload, Tag, AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface AdminTaskRowProps {
    task: UnifiedTask;
    onViewSubmission?: (task: UnifiedTask) => void;
    onEdit?: (task: UnifiedTask) => void;
}

export const AdminTaskRow: React.FC<AdminTaskRowProps> = ({
                                                              task,
                                                              onViewSubmission,
                                                              onEdit,
                                                          }) => {
    const assignedUser = getUsernameFromEmail(task.assignedTo);
    const priorityInfo = getPriorityInfo(task.priority);
    const daysUntilDue = getDaysUntilDue(task);
    const overdue = isTaskOverdue(task);

    // Determine task state
    const isAwaitingReview = task.stage === 'upload_review' || task.stage === 'labeling_review';
    const isCompleted = task.stage === 'completed' || task.stage === 'labeling_approved';
    const isInProgress = !isAwaitingReview && !isCompleted;

    // Determine which stage (upload or labeling)
    const isUploadStage = task.stage === 'pending_upload' || task.stage === 'upload_review' || task.stage === 'upload_approved';
    const isLabelingStage = task.stage === 'pending_labeling' || task.stage === 'labeling_review' || task.stage === 'labeling_approved' || task.stage === 'completed';

    // Check for rejection
    const uploadReview = task.uploadData?.review;
    const labelingReview = task.labelingData?.review;
    const hasRejection = (uploadReview && !uploadReview.approved) || (labelingReview && !labelingReview.approved);

    // Get detailed status
    const getDetailedStatus = () => {
        if (hasRejection) {
            if (task.stage === 'pending_upload') {
                return { label: 'To Do - Upload Rejected', type: 'rejected' as const };
            } else if (task.stage === 'pending_labeling') {
                return { label: 'To Do - Labeling Rejected', type: 'rejected' as const };
            }
        }

        switch (task.stage) {
            case 'pending_upload':
                return { label: 'To Do - Upload', type: 'todo' as const };
            case 'upload_review':
                return { label: 'Awaiting Upload Review', type: 'review' as const };
            case 'upload_approved':
            case 'pending_labeling':
                return { label: 'To Do - Labeling', type: 'todo' as const };
            case 'labeling_review':
                return { label: 'Awaiting Label Review', type: 'review' as const };
            case 'labeling_approved':
            case 'completed':
                return { label: 'Completed', type: 'completed' as const };
            default:
                return { label: 'In Progress', type: 'todo' as const };
        }
    };

    const status = getDetailedStatus();

    return (
        <TableRow>
            {/* Task Title */}
            <TaskCell>
                <TaskTitleRow>
                    <StageIcon $isUpload={isUploadStage}>
                        {isUploadStage ? <Upload size={14} /> : <Tag size={14} />}
                    </StageIcon>
                    <TaskTitle>{task.title}</TaskTitle>
                </TaskTitleRow>
                <TaskDescription>{task.description}</TaskDescription>
            </TaskCell>

            {/* Assigned To */}
            <AssignedCell>
                <AssignedUser>{assignedUser}</AssignedUser>
            </AssignedCell>

            {/* Status */}
            <StatusCell>
                <StatusBadge $type={status.type}>
                    {status.type === 'review' && <AlertCircle size={12} />}
                    {status.type === 'completed' && <CheckCircle2 size={12} />}
                    {status.type === 'rejected' && <AlertCircle size={12} />}
                    {status.type === 'todo' && <Clock size={12} />}
                    {status.label}
                </StatusBadge>
            </StatusCell>

            {/* Priority */}
            <PriorityCell>
                <PriorityBadge $color={priorityInfo.color}>
                    {priorityInfo.label}
                </PriorityBadge>
            </PriorityCell>

            {/* Due Date */}
            <DueDateCell>
                {task.dueDate ? (
                    <DueDate $overdue={overdue}>
                        {daysUntilDue !== null && daysUntilDue >= 0
                            ? `${daysUntilDue}d left`
                            : overdue
                                ? `${Math.abs(daysUntilDue || 0)}d overdue`
                                : 'No due date'}
                    </DueDate>
                ) : (
                    <DueDate $overdue={false}>-</DueDate>
                )}
            </DueDateCell>

            {/* Actions */}
            <ActionsCell>
                {isAwaitingReview && (
                    <ActionButton
                        $variant="primary"
                        onClick={() => onViewSubmission?.(task)}
                    >
                        View Submission
                    </ActionButton>
                )}

                {isInProgress && (
                    <ActionButton
                        $variant="secondary"
                        onClick={() => onEdit?.(task)}
                    >
                        Edit
                    </ActionButton>
                )}

                {isCompleted && (
                    <CompletedText>✓ Done</CompletedText>
                )}
            </ActionsCell>
        </TableRow>
    );
};

// ======================
// 🔹 Styled Components
// ======================

const TableRow = styled.tr`
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderSubtle};
    transition: background ${({ theme }) => theme.animation.duration.fast};

    &:hover {
        background: ${({ theme }) => theme.colors.backgroundTertiary};
    }
`;

const TaskCell = styled.td`
    padding: ${({ theme }) => `${theme.primitives.paddingY.sm} ${theme.primitives.paddingX.md}`};
`;

const TaskTitleRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[2]};
    margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const StageIcon = styled.div<{ $isUpload: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    background: ${({ theme, $isUpload }) =>
    $isUpload ? theme.colors.accentPrimary : theme.colors.brandPrimary};
    color: ${({ theme }) => theme.colors.textInverted};
    border-radius: ${({ theme }) => theme.radius.sm};
`;

const TaskTitle = styled.div`
    font-size: ${({ theme }) => theme.typography.size.sm};
    font-weight: ${({ theme }) => theme.typography.weight.medium};
    color: ${({ theme }) => theme.colors.textPrimary};
`;

const TaskDescription = styled.div`
    font-size: ${({ theme }) => theme.typography.size.xsm};
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
`;

const AssignedCell = styled.td`
    padding: ${({ theme }) => `${theme.primitives.paddingY.sm} ${theme.primitives.paddingX.md}`};
`;

const AssignedUser = styled.div`
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.textPrimary};
`;

const StatusCell = styled.td`
    padding: ${({ theme }) => `${theme.primitives.paddingY.sm} ${theme.primitives.paddingX.md}`};
`;

const StatusBadge = styled.div<{ $type: 'todo' | 'review' | 'completed' | 'rejected' }>`
    display: inline-flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[1]};
    padding: ${({ theme }) => `${theme.primitives.paddingY.xxxs} ${theme.primitives.paddingX.xsm}`};
    background: ${({ theme, $type }) => {
    switch ($type) {
        case 'review':
            return theme.colors.statusWarning;
        case 'completed':
            return theme.colors.statusSuccess;
        case 'rejected':
            return theme.colors.statusError;
        default:
            return theme.colors.accentPrimary;
    }
}};
    color: ${({ theme }) => theme.colors.textInverted};
    border-radius: ${({ theme }) => theme.radius.md};
    font-size: ${({ theme }) => theme.typography.size.xsm};
    font-weight: ${({ theme }) => theme.typography.weight.medium};
    white-space: nowrap;
`;

const PriorityCell = styled.td`
    padding: ${({ theme }) => `${theme.primitives.paddingY.sm} ${theme.primitives.paddingX.md}`};
`;

const PriorityBadge = styled.div<{ $color: string }>`
    display: inline-block;
    padding: ${({ theme }) => `${theme.primitives.paddingY.xxxs} ${theme.primitives.paddingX.xsm}`};
    background: ${({ $color }) => $color};
    color: white;
    border-radius: ${({ theme }) => theme.radius.md};
    font-size: ${({ theme }) => theme.typography.size.xsm};
    font-weight: ${({ theme }) => theme.typography.weight.medium};
`;

const DueDateCell = styled.td`
    padding: ${({ theme }) => `${theme.primitives.paddingY.sm} ${theme.primitives.paddingX.md}`};
`;

const DueDate = styled.div<{ $overdue: boolean }>`
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme, $overdue }) =>
    $overdue ? theme.colors.statusError : theme.colors.textMuted};
    font-weight: ${({ $overdue }) => ($overdue ? 600 : 400)};
`;

const ActionsCell = styled.td`
    padding: ${({ theme }) => `${theme.primitives.paddingY.sm} ${theme.primitives.paddingX.md}`};
`;

const ActionButton = styled(BaseButton)`
    padding: ${({ theme }) => `${theme.primitives.paddingY.xxs} ${theme.primitives.paddingX.sm}`};
    font-size: ${({ theme }) => theme.typography.size.xsm};
    border-radius: ${({ theme }) => theme.radius.sm};
    white-space: nowrap;

    ${({ $variant, theme }) => $variant === 'primary' && `
        background: ${theme.colors.brandPrimary};
        color: ${theme.colors.textInverted};
        
        &:hover:not(:disabled) {
            opacity: 0.9;
        }
    `}

    ${({ $variant, theme }) => $variant === 'secondary' && `
        background: transparent;
        color: ${theme.colors.textPrimary};
        border: 1px solid ${theme.colors.borderDefault};
        
        &:hover:not(:disabled) {
            background: ${theme.colors.backgroundPrimary};
        }
    `}
`;

const CompletedText = styled.div`
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.statusSuccess};
    font-weight: ${({ theme }) => theme.typography.weight.medium};
`;