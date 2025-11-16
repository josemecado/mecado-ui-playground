// admin/components/AdminTaskColumn.tsx
import React from "react";
import styled from "styled-components";
import { AdminBoardColumn, UnifiedTask } from "../types/admin.types";
import { AdminTaskCard } from "./AdminTaskCard";
import { Inbox } from "lucide-react";

interface AdminTaskColumnProps {
    column: AdminBoardColumn;
    onViewSubmission?: (task: UnifiedTask) => void;
    onEdit?: (task: UnifiedTask) => void;
}

export const AdminTaskColumn: React.FC<AdminTaskColumnProps> = ({
                                                                    column,
                                                                    onViewSubmission,
                                                                    onEdit,
                                                                }) => {
    const isEmpty = column.tasks.length === 0;
    const taskCountText = `${column.tasks.length} Task${column.tasks.length === 1 ? '' : 's'}`;

    return (
        <ColumnContainer>
            <ColumnHeader>
                <ColumnTitle>{column.title}</ColumnTitle>
                <TaskCount $status={column.status}>
                    {taskCountText}
                </TaskCount>
            </ColumnHeader>

            <ColumnContent>
                {isEmpty ? (
                    <EmptyState>
                        <EmptyIcon>
                            <Inbox size={32} />
                        </EmptyIcon>
                        <EmptyText>No tasks</EmptyText>
                    </EmptyState>
                ) : (
                    column.tasks.map((task) => (
                        <AdminTaskCard
                            key={task.id}
                            task={task}
                            onViewSubmission={onViewSubmission}
                            onEdit={onEdit}
                        />
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
    min-width: 340px;
    max-width: 380px;
    flex: 1;
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    border-radius: ${({ theme }) => theme.radius.lg};
    overflow: hidden;
`;

const ColumnHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${({ theme }) => theme.primitives.paddingX.md};
    background: ${({ theme }) => theme.colors.backgroundSecondary};
    border-bottom: 2px solid ${({ theme }) => theme.colors.borderSubtle};
`;

const ColumnTitle = styled.h2`
    font-size: ${({ theme }) => theme.typography.size.md};
    font-weight: ${({ theme }) => theme.typography.weight.semiBold};
    color: ${({ theme }) => theme.colors.textPrimary};
    margin: 0;
`;

const TaskCount = styled.div<{ $status: string }>`
    padding: ${({ theme }) => `${theme.primitives.paddingY.xxxs} ${theme.primitives.paddingX.xsm}`};
    background: ${({ theme, $status }) => {
        switch ($status) {
            case 'awaiting_review':
                return theme.colors.statusWarning;
            case 'completed':
                return theme.colors.statusSuccess;
            default:
                return theme.colors.accentPrimary;
        }
    }};
    color: ${({ theme }) => theme.colors.textInverted};
    border-radius: ${({ theme }) => theme.radius.pill};
    font-size: ${({ theme }) => theme.typography.size.xsm};
    font-weight: ${({ theme }) => theme.typography.weight.medium};
`;

const ColumnContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[3]};
    padding: ${({ theme }) => theme.primitives.paddingX.md};
    overflow-y: auto;
    max-height: calc(100vh - 280px);

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
    padding: ${({ theme }) => theme.spacing[12]};
    gap: ${({ theme }) => theme.spacing[2]};
`;

const EmptyIcon = styled.div`
    color: ${({ theme }) => theme.colors.textMuted};
    opacity: 0.4;
`;

const EmptyText = styled.p`
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.textMuted};
    margin: 0;
    text-align: center;
`;