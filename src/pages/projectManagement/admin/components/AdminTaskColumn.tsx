// admin/components/AdminTaskColumn.tsx
import React from "react";
import styled from "styled-components";
import { AdminBoardColumn, UnifiedTask } from "../types/admin.types";
import { AdminTaskCard } from "./AdminTaskCard";
import { Inbox } from "lucide-react";

interface AdminTaskColumnProps {
    column: AdminBoardColumn;
    onTaskClick: (task: UnifiedTask) => void;
}

export const AdminTaskColumn: React.FC<AdminTaskColumnProps> = ({ column, onTaskClick }) => {
    const isEmpty = column.tasks.length === 0;

    return (
        <ColumnContainer>
            <ColumnHeader>
                <ColumnTitle>{column.title}</ColumnTitle>
                <TaskCount $status={column.status}>
                    {column.tasks.length} {column.tasks.length === 1 ? "task" : "tasks"}
                </TaskCount>
            </ColumnHeader>

            <StyledDivider />

            <ColumnContent>
                {isEmpty ? (
                    <EmptyState>
                        <EmptyIcon>
                            <Inbox size={32} />
                        </EmptyIcon>
                        <EmptyText>No tasks {column.status.replace('_', ' ')}</EmptyText>
                    </EmptyState>
                ) : (
                    column.tasks.map((task) => (
                        <AdminTaskCard key={task.id} task={task} onClick={onTaskClick} />
                    ))
                )}
            </ColumnContent>
        </ColumnContainer>
    );
};

// ======================
// 🔹 Styled Components
// ======================

const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 320px;
  max-width: 380px;
  padding: ${({ theme }) => theme.spacing[3]};
  gap: ${({ theme }) => theme.primitives.spacing[3]};
  border-radius: ${({ theme }) => theme.primitives.radius.lg};
  background: ${({ theme }) => theme.colors.backgroundTertiary};
`;

const ColumnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ColumnTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.family.base};
  font-size: ${({ theme }) => theme.typography.size.md};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  color: ${({ theme }) => theme.colors.textPrimary};
  text-wrap: nowrap;
  margin: 0;
`;

const TaskCount = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => `${theme.spacing[0.5]} ${theme.spacing[2]}`};
  background: ${({ theme, $status }) => {
    switch ($status) {
        case 'needs_review':
            return theme.colors.statusWarning;
        case 'completed':
            return theme.colors.statusSuccess;
        case 'failed':
            return theme.colors.statusError;
        default:
            return theme.colors.accentPrimary;
    }
}};
  color: ${({ theme }) => theme.colors.textInverted};
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
`;

const ColumnContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => `0 0 ${theme.radius.lg} ${theme.radius.lg}`};
  overflow-y: auto;
  max-height: calc(100vh - 250px);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.accentPrimary};
    border-radius: ${({ theme }) => theme.radius.sm};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.accentSecondary};
  }
`;

const StyledDivider = styled.div`
  width: 100%;
  height: 2px;
  background-color: ${({ theme }) => theme.colors.accentTertiary};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[4]};
  gap: ${({ theme }) => theme.spacing[2]};
`;

const EmptyIcon = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
  opacity: 0.5;
`;

const EmptyText = styled.p`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
  text-align: center;
`;