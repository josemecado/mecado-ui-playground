// admin/components/task-card/TaskCardHeader.tsx
import React from "react";
import styled from "styled-components";

interface TaskCardHeaderProps {
    title: string;
    icon: React.ReactNode;
    isUploadStage: boolean;
}

export const TaskCardHeader: React.FC<TaskCardHeaderProps> = ({icon, title, isUploadStage}) => {
    return (
        <HeaderContainer>
            <StageIcon $isUpload={isUploadStage}>
                {icon}
            </StageIcon>
            <Title>{title}</Title>
        </HeaderContainer>
    );
};

// Styled Components
const HeaderContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing[1]};
    background: ${({theme}) => theme.colors.backgroundTertiary};
    border-radius: ${({theme}) => theme.components.card.radius};
    padding: ${({theme}) => theme.components.card.padding.componentPadding};
`;

const StageIcon = styled.div<{ $isUpload: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${({theme}) => theme.components.card.padding.tinyPadding};
    background: ${({theme}) => theme.colors.brandPrimary};
    color: ${({theme}) => theme.colors.accentSecondary};
    border-radius: ${({theme}) => theme.radius.sm};
`;

const Title = styled.h3`
    font-size: ${({theme}) => theme.components.card.typography.titleFontSize};
    font-weight: ${({theme}) => theme.components.card.typography.titleFontWeight};
    color: ${({theme}) => theme.colors.textPrimary};
    margin: 0;
    flex: 1;
`;