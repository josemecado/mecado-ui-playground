// admin/components/AdminTaskBoard.tsx
import React, { useMemo } from "react";
import styled from "styled-components";
import { UnifiedTask } from "../types/admin.types";
import { AdminTaskColumn } from "./AdminTaskColumn";
import { groupTasksByColumnStatus } from "../utils/adminHelpers";

interface AdminTaskBoardProps {
    tasks: UnifiedTask[];
    onViewSubmission?: (task: UnifiedTask) => void;
    onEdit?: (task: UnifiedTask) => void;
}

export const AdminTaskBoard: React.FC<AdminTaskBoardProps> = ({
                                                                  tasks,
                                                                  onViewSubmission,
                                                                  onEdit,
                                                              }) => {
    // Group tasks into 3 columns
    const columns = useMemo(() => groupTasksByColumnStatus(tasks), [tasks]);

    return (
        <BoardContainer>
            {columns.map((column) => (
                <AdminTaskColumn
                    key={column.id}
                    column={column}
                    onViewSubmission={onViewSubmission}
                    onEdit={onEdit}
                />
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
    background: ${({ theme }) => theme.colors.backgroundPrimary};
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
        border-radius: ${({ theme }) => theme.radius.pill};
    }

    &::-webkit-scrollbar-thumb:hover {
        background: ${({ theme }) => theme.colors.accentSecondary};
    }
`;