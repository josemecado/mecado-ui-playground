import React from "react";
import styled from "styled-components";
import { BoardColumn, Task } from "../types/types";
import { TaskCard } from "./TaskCard";
import { EmptyColumn } from "./EmptyColumn";
import { getStatusIcon } from "../utils/taskHelpers";

interface TaskColumnProps {
    column: BoardColumn;
    onTaskClick: (task: Task) => void;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({ column, onTaskClick }) => {
    return (
        <ColumnContainer>
            <ColumnHeader>
                <ColumnTitleRow>
                    <ColumnIcon>{getStatusIcon(column.status)}</ColumnIcon>
                    <ColumnTitle>{column.title}</ColumnTitle>
                </ColumnTitleRow>
                <TaskCount $color={column.color}>
                    {column.tasks.length} {column.tasks.length === 1 ? "task" : "tasks"}
                </TaskCount>
                <ColumnDescription>{column.description}</ColumnDescription>
            </ColumnHeader>

            <ColumnContent>
                {column.tasks.length === 0 ? (
                    <EmptyColumn status={column.status} />
                ) : (
                    column.tasks.map((task) => (
                        <TaskCard key={task.id} task={task} onClick={onTaskClick} />
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
  min-width: 300px;
  max-width: 350px;
  height: 100%;
`;

const ColumnHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-bottom: 2px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: ${({ theme }) => `${theme.radius.lg} ${theme.radius.lg} 0 0`};
`;

const ColumnTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ColumnIcon = styled.span`
  font-size: ${({ theme }) => theme.typography.size.xl};
`;

const ColumnTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.size.lg};
  font-weight: ${({ theme }) => theme.typography.weight.semiBold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

const TaskCount = styled.div<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: ${({ theme }) => `${theme.spacing[0.5]} ${theme.spacing[2]}`};
  background: ${({ theme, $color }) => theme.colors[$color as keyof typeof theme.colors]};
  color: ${({ theme }) => theme.colors.textInverted};
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.semiBold};
  opacity: 0.9;
`;

const ColumnDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
`;

const ColumnContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.backgroundPrimary};
  border-radius: ${({ theme }) => `0 0 ${theme.radius.lg} ${theme.radius.lg}`};
  overflow-y: auto;
  flex: 1;

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