// home/components/UserTaskBoard.tsx
// Task board for L1 users (shows only their assigned tasks)

import React from 'react';
import styled from 'styled-components';
import { UnifiedTask } from '../../admin/types/admin.types';
import { UserTaskCard } from './UserTaskCard';

interface UserTaskBoardProps {
    tasks: UnifiedTask[];
    onTaskClick: (task: UnifiedTask) => void;
}

// Group tasks by user-friendly categories
const groupTasksForUser = (tasks: UnifiedTask[]) => {
    return {
        todo: tasks.filter(t =>
            t.stage === 'pending_upload' ||
            t.stage === 'upload_approved' ||
            t.stage === 'pending_labeling'
        ),
        inReview: tasks.filter(t =>
            t.stage === 'upload_review' ||
            t.stage === 'labeling_review'
        ),
        completed: tasks.filter(t =>
            t.stage === 'labeling_approved' ||
            t.stage === 'completed'
        ),
    };
};

export const UserTaskBoard: React.FC<UserTaskBoardProps> = ({ tasks, onTaskClick }) => {
    const grouped = groupTasksForUser(tasks);

    return (
        <BoardContainer>
            {/* To Do Column */}
            <Column>
                <ColumnHeader>
                    <ColumnTitle>📋 To Do</ColumnTitle>
                    <ColumnCount>{grouped.todo.length}</ColumnCount>
                </ColumnHeader>
                <TaskList>
                    {grouped.todo.map(task => (
                        <UserTaskCard
                            key={task.id}
                            task={task}
                            onClick={() => onTaskClick(task)}
                        />
                    ))}
                    {grouped.todo.length === 0 && (
                        <EmptyState>
                            <EmptyIcon>✅</EmptyIcon>
                            <EmptyText>No tasks to do</EmptyText>
                            <EmptySubtext>Check back later for new assignments</EmptySubtext>
                        </EmptyState>
                    )}
                </TaskList>
            </Column>

            {/* In Review Column */}
            <Column>
                <ColumnHeader>
                    <ColumnTitle>⏳ In Review</ColumnTitle>
                    <ColumnCount>{grouped.inReview.length}</ColumnCount>
                </ColumnHeader>
                <TaskList>
                    {grouped.inReview.map(task => (
                        <UserTaskCard
                            key={task.id}
                            task={task}
                            onClick={() => onTaskClick(task)}
                        />
                    ))}
                    {grouped.inReview.length === 0 && (
                        <EmptyState>
                            <EmptyIcon>👀</EmptyIcon>
                            <EmptyText>Nothing in review</EmptyText>
                            <EmptySubtext>Your submissions will appear here</EmptySubtext>
                        </EmptyState>
                    )}
                </TaskList>
            </Column>

            {/* Completed Column */}
            <Column>
                <ColumnHeader>
                    <ColumnTitle>✅ Completed</ColumnTitle>
                    <ColumnCount>{grouped.completed.length}</ColumnCount>
                </ColumnHeader>
                <TaskList>
                    {grouped.completed.map(task => (
                        <UserTaskCard
                            key={task.id}
                            task={task}
                            onClick={() => onTaskClick(task)}
                        />
                    ))}
                    {grouped.completed.length === 0 && (
                        <EmptyState>
                            <EmptyIcon>🎯</EmptyIcon>
                            <EmptyText>No completed tasks yet</EmptyText>
                            <EmptySubtext>Complete tasks to see them here</EmptySubtext>
                        </EmptyState>
                    )}
                </TaskList>
            </Column>
        </BoardContainer>
    );
};

// ======================
// 🔹 Styled Components
// ======================

const BoardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing[6]};
  padding: ${({ theme }) => theme.spacing[6]};
  height: 100%;
  overflow: hidden;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  overflow: hidden;
`;

const ColumnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing[4]} ${theme.spacing[5]}`};
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  border-bottom: 2px solid ${({ theme }) => theme.colors.borderDefault};
`;

const ColumnTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.size.lg};
  font-weight: ${({ theme }) => theme.typography.weight.semiBold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

const ColumnCount = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.brandPrimary};
  color: ${({ theme }) => theme.colors.textInverted};
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  border-radius: ${({ theme }) => theme.radius.pill};
`;

const TaskList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.accentPrimary};
    border-radius: ${({ theme }) => theme.radius.pill};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.accentSecondary};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[8]};
  text-align: center;
  min-height: 200px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  opacity: 0.5;
`;

const EmptyText = styled.div`
  font-size: ${({ theme }) => theme.typography.size.md};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const EmptySubtext = styled.div`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  opacity: 0.7;
`;