// admin/components/task-card/TaskCardHeader.tsx
import React from "react";
import styled from "styled-components";
import {UnifiedTask} from "../../../../types";
import {UserCircle} from "lucide-react";

interface TaskCardHeaderProps {
    task: UnifiedTask;
    icon: React.ReactNode;
    isUploadStage: boolean;
}

export const TaskCardHeader: React.FC<TaskCardHeaderProps> = ({task, icon, isUploadStage}) => {
    return (
        <MainContainer>
            {task.assignedTo && (
                <UserRow>
                    <StageIcon $isUpload={isUploadStage}>
                        <UserCircle size={14}/>
                    </StageIcon>
                    <UserText>{task.assignedTo}</UserText>
                </UserRow>
            )}

            <HeaderContainer>
                <StageIcon $isUpload={isUploadStage} $variant="title">
                    {icon}
                </StageIcon>
                <Title>{task.title}</Title>
            </HeaderContainer>
        </MainContainer>
    );
};

// Styled Components
const MainContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing[1]};;
`;

const UserRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing[1]};
    background: ${({theme}) => theme.colors.backgroundPrimary};
    border-radius: ${({theme}) => theme.components.card.radius};
    padding: ${({theme}) => theme.components.card.padding.componentPadding};
`;

const HeaderContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing[1]};
    background: ${({theme}) => theme.colors.backgroundTertiary};
    border-radius: ${({theme}) => theme.components.card.radius};
    padding: ${({theme}) => theme.components.card.padding.componentPadding};
`;

const StageIcon = styled.div<{ $isUpload: boolean, $variant?: "title" | "user" }>`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${({theme}) => theme.components.card.padding.tinyPadding};
    background: ${(p) => (p.$variant === "title" ? p.theme.colors.brandPrimary : p.theme.colors.accentPrimary)};
    color: ${({theme}) => theme.colors.accentSecondary};
    color: ${(p) => (p.$variant === "title" ? p.theme.colors.accentSecondary : p.theme.primitives.colors.text1000)};
    border-radius: ${({theme}) => theme.radius.sm};
`;

const Title = styled.h3`
    font-size: ${({theme}) => theme.components.card.typography.titleFontSize};
    font-weight: ${({theme}) => theme.components.card.typography.titleFontWeight};
    color: ${({theme}) => theme.colors.textPrimary};
    margin: 0;
    flex: 1;
`;

const UserText = styled.p`
    font-size: ${({theme}) => theme.components.card.typography.titleFontSize};
    font-weight: ${({theme}) => theme.typography.weight.medium};
    color: ${({theme}) => theme.colors.textMutedStrong};
    margin: 0;
    flex: 1;
`;