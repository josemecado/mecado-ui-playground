import React from "react";
import styled from "styled-components";
import { TaskStatus } from "../types/types";

interface EmptyColumnProps {
    status: TaskStatus;
}

const emptyMessages = {
    todo: {
        icon: "🎉",
        title: "All caught up!",
        message: "No tasks to do right now.",
    },
    pending: {
        icon: "📭",
        title: "Nothing pending",
        message: "No tasks awaiting review.",
    },
    approved: {
        icon: "🏆",
        title: "No approvals yet",
        message: "Completed tasks will appear here.",
    },
    failed: {
        icon: "✨",
        title: "All clear!",
        message: "No tasks need attention.",
    },
};

export const EmptyColumn: React.FC<EmptyColumnProps> = ({ status }) => {
    const content = emptyMessages[status];

    return (
        <EmptyContainer>
            <EmptyIcon>{content.icon}</EmptyIcon>
            <EmptyTitle>{content.title}</EmptyTitle>
            <EmptyMessage>{content.message}</EmptyMessage>
        </EmptyContainer>
    );
};

// ======================
// 🔹 Styled Components
// ======================

const EmptyContainer = styled.div`
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
  opacity: 0.6;
`;

const EmptyTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.size.lg};
  font-weight: ${({ theme }) => theme.typography.weight.semiBold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 ${({ theme }) => theme.spacing[2]} 0;
`;

const EmptyMessage = styled.p`
  font-size: ${({ theme }) => theme.typography.size.md};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
`;