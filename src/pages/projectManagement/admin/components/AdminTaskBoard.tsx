// admin/components/AdminTaskBoard.tsx
import React, { useMemo } from "react";
import styled from "styled-components";
import { UnifiedTask } from "../types/admin.types";
import { AdminTaskColumn } from "./AdminTaskColumn";
import { groupTasksByColumnStatus } from "../utils/adminHelpers";

interface AdminTaskBoardProps {
    tasks: UnifiedTask[];
    onTaskClick: (task: UnifiedTask) => void;
}

export const AdminTaskBoard: React.FC<AdminTaskBoardProps> = ({ tasks, onTaskClick }) => {
    // Group tasks into columns
    const columns = useMemo(() => groupTasksByColumnStatus(tasks), [tasks]);

    return (
        <BoardContainer>
            {columns.map((column) => (
                <AdminTaskColumn key={column.id} column={column} onTaskClick={onTaskClick} />
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
  background: ${({ theme }) => theme.colors.backgroundSecondary};
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