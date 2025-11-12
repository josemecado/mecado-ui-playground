import React, { useMemo } from "react";
import styled from "styled-components";
import { Task } from "../types/types";
import { TaskColumn } from "./TaskColumn";
import { groupTasksByStatus } from "../utils/taskHelpers";

interface TaskBoardProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onTaskClick }) => {
    // Group tasks by status into columns
    const columns = useMemo(() => groupTasksByStatus(tasks), [tasks]);

    return (
        <BoardContainer>
            {columns.map((column) => (
                <TaskColumn key={column.id} column={column} onTaskClick={onTaskClick} />
            ))}
        </BoardContainer>
    );
};

// ======================
// 🔹 Styled Components
// ======================

const BoardContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  height: 100%;
  padding: ${({ theme }) => theme.spacing[6]};
  overflow-x: auto;
  overflow-y: hidden;

  &::-webkit-scrollbar {
    height: 8px;
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