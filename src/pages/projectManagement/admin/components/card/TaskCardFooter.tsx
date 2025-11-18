// admin/components/task-card/TaskCardFooter.tsx
import React from "react";
import styled from "styled-components";
import {Clock, ArrowRight} from "lucide-react";
import {BaseButton} from "components/buttons/BaseButton";

interface TaskCardFooterProps {
    statusText: string;
    stage: string;
    showViewSubmission?: boolean;
    showEdit?: boolean;
    onViewSubmission?: () => void;
    onEdit?: () => void;
}

export const TaskCardFooter: React.FC<TaskCardFooterProps> = ({
                                                                  statusText,
                                                                  stage,
                                                                  showViewSubmission,
                                                                  showEdit,
                                                                  onViewSubmission,
                                                                  onEdit,
                                                              }) => {
    return (
        <FooterContainer>
            <StatusBadge $stage={stage}>
                <StageIcon>
                    <Clock size={12}/>
                </StageIcon>
                {statusText}
            </StatusBadge>

            {showViewSubmission && (
                <ActionButton
                    $variant="primary"
                    onClick={onViewSubmission}
                >
                    Review
                    <ArrowRight size={14}/>
                </ActionButton>
            )}

            {showEdit && (
                <ActionButton
                    $variant="secondary"
                    onClick={onEdit}
                >
                    Edit
                </ActionButton>
            )}
        </FooterContainer>
    );
};

// Styled Components
const FooterContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${({theme}) => theme.spacing[2]};
    padding-top: ${({theme}) => theme.spacing[2]};
    border-top: 1px solid ${({theme}) => theme.colors.borderSubtle};
`;

const StatusBadge = styled.div<{ $stage: string }>`
    display: flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing[1]};
    padding: ${({theme}) => theme.components.card.padding.tinyPadding};
    background: ${({theme}) => theme.colors.backgroundTertiary};
    border: 1px solid ${({theme}) => theme.colors.borderSubtle};
    color: ${({theme}) => theme.colors.textMutedStrong};
    border-radius: ${({theme}) => theme.components.card.radius};
    font-size: ${({theme}) => theme.typography.size.xsm};
    font-weight: ${({theme}) => theme.typography.weight.medium};
`;

const ActionButton = styled(BaseButton)`
    padding-left: ${({theme}) => theme.paddingX.xsm};
    padding-right: ${({theme}) => theme.paddingX.xsm};
    padding-top: ${({theme}) => theme.paddingX.xxs};
    padding-bottom: ${({theme}) => theme.paddingX.xxs};
    font-size: ${({theme}) => theme.typography.size.xsm};
    font-weight: ${({theme}) => theme.typography.weight.medium};
    border-radius: ${({theme}) => theme.radius.pill};

    ${({$variant, theme}) => $variant === 'primary' && `
        background: ${theme.colors.brandPrimary};
        color: ${theme.colors.textInverted};
        
        &:hover:not(:disabled) {
            opacity: 0.9;
        }
    `}

    ${({$variant, theme}) => $variant === 'secondary' && `
        background: transparent;
        color: ${theme.colors.textPrimary};
        border: 1px solid ${theme.colors.borderDefault};
        
        &:hover:not(:disabled) {
            background: ${theme.colors.backgroundTertiary};
        }
    `}
`;

const StageIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${({theme}) => theme.components.card.padding.tinyPadding};
    background: ${({theme}) => theme.colors.accentPrimary};
    color: ${({theme}) => theme.primitives.colors.text1000};
    border-radius: ${({theme}) => theme.radius.sm};
`;