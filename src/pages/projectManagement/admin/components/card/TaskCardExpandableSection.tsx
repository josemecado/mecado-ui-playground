// admin/components/task-card/TaskCardExpandableSection.tsx
import React from "react";
import styled from "styled-components";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TaskCardExpandableSectionProps {
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    alwaysOpen?: boolean;
}

export const TaskCardExpandableSection: React.FC<TaskCardExpandableSectionProps> = ({
                                                                                        title,
                                                                                        isExpanded,
                                                                                        onToggle,
                                                                                        children,
                                                                                        alwaysOpen = false,
                                                                                    }) => {
    return (
        <Container>
            <SectionHeader
                onClick={alwaysOpen ? undefined : onToggle}
                $clickable={!alwaysOpen}
            >
                <SectionTitle>{title}</SectionTitle>
                {!alwaysOpen && (
                    <ExpandIcon>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </ExpandIcon>
                )}
            </SectionHeader>
            {(isExpanded || alwaysOpen) && (
                <SectionContent>
                    {children}
                </SectionContent>
            )}
        </Container>
    );
};

// Styled Components
const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[1]};
`;

const SectionHeader = styled.div<{ $clickable: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: ${({ $clickable }) => $clickable ? 'pointer' : 'default'};
    user-select: none;

    &:hover {
        opacity: ${({ $clickable }) => $clickable ? 0.8 : 1};
    }
`;

const SectionTitle = styled.span`
    font-size: ${({ theme }) => theme.components.card.typography.subTitleFontSize};
    font-weight: ${({ theme }) => theme.typography.weight.medium};
    color: ${({ theme }) => theme.colors.textAccent};
`;

const ExpandIcon = styled.div`
    display: flex;
    color: ${({ theme }) => theme.colors.textAccent};
`;

const SectionContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[2]};
    padding: ${({ theme }) => theme.components.card.padding.componentPadding};
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    border-radius: ${({ theme }) => theme.components.card.radius};
`;