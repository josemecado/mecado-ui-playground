// home/components/UserTaskCard.tsx
// Task card for L1 users

import React from 'react';
import styled from 'styled-components';
import { UnifiedTask } from '../../admin/types/admin.types';
import { Upload, Tag, Clock, AlertCircle } from 'lucide-react';

interface UserTaskCardProps {
    task: UnifiedTask;
    onClick: () => void;
}

export const UserTaskCard: React.FC<UserTaskCardProps> = ({ task, onClick }) => {
    // Determine what action the user needs to take
    const getTaskAction = () => {
        if (task.stage === 'pending_upload') {
            return {
                icon: <Upload size={16} />,
                action: 'Upload Files',
                description: `${task.uploadData?.requiredFileCount || 1} file(s) required`,
                color: 'accentPrimary',
            };
        } else if (task.stage === 'upload_approved' || task.stage === 'pending_labeling') {
            return {
                icon: <Tag size={16} />,
                action: 'Add Labels',
                description: 'Label geometry features',
                color: 'brandPrimary',
            };
        } else if (task.stage === 'upload_review') {
            return {
                icon: <Clock size={16} />,
                action: 'Upload Under Review',
                description: 'Waiting for admin approval',
                color: 'statusWarning',
            };
        } else if (task.stage === 'labeling_review') {
            return {
                icon: <Clock size={16} />,
                action: 'Labels Under Review',
                description: 'Waiting for admin approval',
                color: 'statusWarning',
            };
        } else {
            return {
                icon: <Tag size={16} />,
                action: 'Completed',
                description: 'Task finished',
                color: 'statusSuccess',
            };
        }
    };

    const taskAction = getTaskAction();

    // Check if task has rejection feedback
    const hasRejection =
        (task.uploadData?.review && !task.uploadData.review.approved) ||
        (task.labelingData?.review && !task.labelingData.review.approved);

    const rejectionNote =
        task.uploadData?.review?.approved === false
            ? task.uploadData.review.notes
            : task.labelingData?.review?.approved === false
                ? task.labelingData.review.notes
                : null;

    // Calculate days until due
    const getDaysUntilDue = () => {
        if (!task.dueDate) return null;
        const now = new Date();
        const due = new Date(task.dueDate);
        const diffTime = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysUntilDue = getDaysUntilDue();
    const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

    return (
        <Card onClick={onClick} $hasRejection={hasRejection}>
            {/* Priority Badge */}
            <PriorityBadge $priority={task.priority}>
                {task.priority}
            </PriorityBadge>

            {/* Title */}
            <TaskTitle>{task.title}</TaskTitle>

            {/* Description */}
            <TaskDescription>{task.description}</TaskDescription>

            {/* Rejection Notice */}
            {hasRejection && rejectionNote && (
                <RejectionNotice>
                    <AlertCircle size={14} />
                    <span>{rejectionNote}</span>
                </RejectionNotice>
            )}

            {/* Action Required */}
            <ActionRow $color={taskAction.color}>
                {taskAction.icon}
                <ActionText>
                    <ActionLabel>{taskAction.action}</ActionLabel>
                    <ActionDescription>{taskAction.description}</ActionDescription>
                </ActionText>
            </ActionRow>

            {/* Footer */}
            <CardFooter>
                {daysUntilDue !== null && (
                    <DueDate $overdue={isOverdue}>
                        <Clock size={12} />
                        {isOverdue
                            ? `${Math.abs(daysUntilDue)}d overdue`
                            : `${daysUntilDue}d remaining`}
                    </DueDate>
                )}

                {task.requirements && (
                    <RequirementsHint>View requirements →</RequirementsHint>
                )}
            </CardFooter>
        </Card>
    );
};

// ======================
// 🔹 Styled Components
// ======================

const Card = styled.div<{ $hasRejection: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.backgroundPrimary};
  border: 2px solid ${({ theme, $hasRejection }) =>
    $hasRejection ? theme.colors.statusError : theme.colors.borderSubtle};
  border-radius: ${({ theme }) => theme.radius.lg};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.fast};

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.colors.brandPrimary};
  }
`;

const PriorityBadge = styled.div<{ $priority: UnifiedTask['priority'] }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing[3]};
  right: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => `${theme.primitives.paddingY.xxxs} ${theme.primitives.paddingX.xsm}`};
  background: ${({ theme, $priority }) => {
    switch ($priority) {
        case 'urgent': return theme.colors.statusError;
        case 'high': return '#FF6B35';
        case 'medium': return theme.colors.statusWarning;
        case 'low': return theme.colors.accentPrimary;
    }
}};
  color: white;
  font-size: ${({ theme }) => theme.typography.size.xsm};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  text-transform: uppercase;
  border-radius: ${({ theme }) => theme.radius.sm};
  letter-spacing: 0.5px;
`;

const TaskTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.size.md};
  font-weight: ${({ theme }) => theme.typography.weight.semiBold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
  padding-right: ${({ theme }) => theme.spacing[8]}; /* Space for priority badge */
  line-height: 1.4;
`;

const TaskDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const RejectionNotice = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.statusError}15;
  border-left: 3px solid ${({ theme }) => theme.colors.statusError};
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: ${({ theme }) => theme.typography.size.xsm};
  color: ${({ theme }) => theme.colors.statusError};
  line-height: 1.4;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }

  span {
    flex: 1;
  }
`;

const ActionRow = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme, $color }) => theme.colors[$color] + '15'};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme, $color }) => theme.colors[$color]};
`;

const ActionText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  flex: 1;
`;

const ActionLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.semiBold};
`;

const ActionDescription = styled.div`
  font-size: ${({ theme }) => theme.typography.size.xsm};
  opacity: 0.8;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${({ theme }) => theme.spacing[2]};
  border-top: 1px solid ${({ theme }) => theme.colors.borderSubtle};
`;

const DueDate = styled.div<{ $overdue: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.typography.size.xsm};
  color: ${({ theme, $overdue }) =>
    $overdue ? theme.colors.statusError : theme.colors.textMuted};
  font-weight: ${({ $overdue }) => ($overdue ? 600 : 400)};
`;

const RequirementsHint = styled.div`
  font-size: ${({ theme }) => theme.typography.size.xsm};
  color: ${({ theme }) => theme.colors.brandPrimary};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
`;