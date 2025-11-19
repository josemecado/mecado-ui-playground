// admin/components/AdminTaskBoard.tsx
import React, { useMemo } from "react";
import styled from "styled-components";
import { UnifiedTask, User } from "../../../types";
import { AdminTaskColumn } from "./AdminTaskColumn";
import { groupTasksByColumnStatus } from "../../utils/adminHelpers";

interface AdminTaskBoardProps {
    tasks: UnifiedTask[];
    availableUsers?: User[];  // ADD THIS
    onViewSubmission?: (task: UnifiedTask) => void;
    onEdit?: (task: UnifiedTask) => void;
    onAssign?: (taskId: string, userEmail: string) => void;  // ADD THIS
}

export const AdminTaskBoard: React.FC<AdminTaskBoardProps> = ({
                                                                  tasks,
                                                                  availableUsers,  // ADD THIS
                                                                  onViewSubmission,
                                                                  onEdit,
                                                                  onAssign,  // ADD THIS
                                                              }) => {
    // Group tasks into 4 columns (now includes unassigned)
    const columns = useMemo(() => groupTasksByColumnStatus(tasks), [tasks]);

    return (
        <BoardContainer>
            {columns.map((column) => (
                <AdminTaskColumn
                    key={column.id}
                    column={column}
                    availableUsers={availableUsers}  // ADD THIS
                    onViewSubmission={onViewSubmission}
                    onEdit={onEdit}
                    onAssign={onAssign}  // ADD THIS
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
    justify-content: space-evenly;
    gap: ${({ theme }) => theme.spacing[4]};
    height: 100%;
    padding: ${({ theme }) => theme.spacing[4]};
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
        border-radius: ${({ theme }) => theme.radius.pill};
    }

    &::-webkit-scrollbar-thumb:hover {
        background: ${({ theme }) => theme.colors.accentSecondary};
    }
`;