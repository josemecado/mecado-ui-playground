// admin/components/AdminTasksTable.tsx
import React from "react";
import styled from "styled-components";
import { UnifiedTask } from "../../../types";
import { AdminTaskRow } from "./AdminTaskRow";

interface AdminTasksTableProps {
    tasks: UnifiedTask[];
    onViewSubmission?: (task: UnifiedTask) => void;
    onEdit?: (task: UnifiedTask) => void;
}

export const AdminTasksTable: React.FC<AdminTasksTableProps> = ({
                                                                    tasks,
                                                                    onViewSubmission,
                                                                    onEdit,
                                                                }) => {
    return (
        <TableContainer>
            <TableWrapper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader $width="35%">Task</TableHeader>
                            <TableHeader $width="15%">Assigned To</TableHeader>
                            <TableHeader $width="15%">Status</TableHeader>
                            <TableHeader $width="10%">Priority</TableHeader>
                            <TableHeader $width="12%">Due Date</TableHeader>
                            <TableHeader $width="13%">Actions</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tasks.length === 0 ? (
                            <EmptyRow>
                                <EmptyCell colSpan={6}>
                                    No tasks found
                                </EmptyCell>
                            </EmptyRow>
                        ) : (
                            tasks.map((task) => (
                                <AdminTaskRow
                                    key={task.id}
                                    task={task}
                                    onViewSubmission={onViewSubmission}
                                    onEdit={onEdit}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableWrapper>
        </TableContainer>
    );
};

// ======================
// 🔹 Styled Components
// ======================

const TableContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: ${({ theme }) => theme.colors.backgroundPrimary};
    padding: ${({ theme }) => theme.spacing[6]};
`;

const TableWrapper = styled.div`
    flex: 1;
    overflow: auto;
    border-radius: ${({ theme }) => theme.radius.lg};
    border: 1px solid ${({ theme }) => theme.colors.borderSubtle};
    background: ${({ theme }) => theme.colors.backgroundSecondary};

    &::-webkit-scrollbar {
        width: 8px;
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

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const TableHead = styled.thead`
    position: sticky;
    top: 0;
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    z-index: 10;
    border-bottom: 2px solid ${({ theme }) => theme.colors.borderDefault};
`;

const TableRow = styled.tr`
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderSubtle};
`;

const TableHeader = styled.th<{ $width?: string }>`
    padding: ${({ theme }) => `${theme.primitives.paddingY.sm} ${theme.primitives.paddingX.md}`};
    text-align: left;
    font-size: ${({ theme }) => theme.typography.size.sm};
    font-weight: ${({ theme }) => theme.typography.weight.semiBold};
    color: ${({ theme }) => theme.colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.05em;
    width: ${({ $width }) => $width || 'auto'};
`;

const TableBody = styled.tbody``;

const EmptyRow = styled.tr``;

const EmptyCell = styled.td`
    padding: ${({ theme }) => theme.spacing[12]};
    text-align: center;
    font-size: ${({ theme }) => theme.typography.size.md};
    color: ${({ theme }) => theme.colors.textMuted};
`;