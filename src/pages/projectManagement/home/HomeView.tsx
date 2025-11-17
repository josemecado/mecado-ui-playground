// home/HomeView.tsx
// Updated to use unified task system and show only current user's tasks

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { BaseButton } from "components/buttons/BaseButton";
import { taskService } from "../api/services/taskService";
import { useUser } from "../context/UserContext";
import { UnifiedTask } from "../admin/types/admin.types";
import { UserTaskBoard } from "./components/UserTaskBoard";
import { UserSwitcher } from "./components/UserSwitcher";
import { ViewType } from "../sideMenu/components/sharedComponents";

interface TaskContext {
    taskId: string;
    taskType: 'geometry_upload' | 'geometry_labeling';
    requiredFileCount?: number;
    modelId?: string;
    geometryId?: string;
    geometryType?: 'edge' | 'face' | 'body';
    geometryName?: string;
    batchName?: string;
}

interface HomeViewProps {
    onNavigateToTool: (view: ViewType, context?: TaskContext) => void;
    onLoadGeometry?: () => Promise<void>;
    geometryLoaded?: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
                                                      onNavigateToTool,
                                                      onLoadGeometry,
                                                      geometryLoaded,
                                                  }) => {
    const { currentUser } = useUser();
    const [tasks, setTasks] = useState<UnifiedTask[]>([]);
    const [loading, setLoading] = useState(true);

    // Load user's tasks on mount and when user changes
    useEffect(() => {
        if (!currentUser) {
            setTasks([]);
            setLoading(false);
            return;
        }

        const loadTasks = async () => {
            setLoading(true);
            try {
                const userTasks = await taskService.getTasksByUser(currentUser.email);
                setTasks(userTasks);
            } catch (error) {
                console.error('[HomeView] Failed to load tasks:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTasks();

        // Subscribe to task changes
        const unsubscribe = taskService.subscribe(async () => {
            const userTasks = await taskService.getTasksByUser(currentUser.email);
            setTasks(userTasks);
        });

        return unsubscribe;
    }, [currentUser]);

    const handleTaskClick = (task: UnifiedTask) => {
        // Determine which tool to open based on task stage
        if (task.stage === 'pending_upload') {
            // User needs to upload files
            onNavigateToTool('geometry-uploader', {
                taskId: task.id,
                taskType: 'geometry_upload',
                requiredFileCount: task.uploadData?.requiredFileCount || 1,
                batchName: task.title,
            });
        } else if (task.stage === 'upload_approved' || task.stage === 'pending_labeling') {
            // User needs to add labels
            onNavigateToTool('geometry-labeler', {
                taskId: task.id,
                taskType: 'geometry_labeling',
                modelId: task.uploadData?.uploadedFiles[0]?.name, // Use filename as model ID for now
                geometryName: task.title,
            });
        } else if (task.stage === 'upload_review' || task.stage === 'labeling_review') {
            // Task is in review - show details (can't edit)
            alert(`This task is currently under review.\n\nAdmin will review your submission and provide feedback.`);
        } else if (task.stage === 'labeling_approved' || task.stage === 'completed') {
            // Task is completed - show success message
            alert(`Task completed! ✅\n\n"${task.title}"\n\nGreat work!`);
        }
    };

    if (!currentUser) {
        return (
            <HomeContainer>
                <NoUserState>
                    <NoUserIcon>🔒</NoUserIcon>
                    <NoUserText>Please log in to view your tasks</NoUserText>
                </NoUserState>
            </HomeContainer>
        );
    }

    if (loading) {
        return (
            <HomeContainer>
                <LoadingState>
                    <LoadingSpinner />
                    <LoadingText>Loading your tasks...</LoadingText>
                </LoadingState>
            </HomeContainer>
        );
    }

    return (
        <HomeContainer>
            <HomeHeader>
                <HeaderContent>
                    <TitleRow>
                        <Title>📋 My Tasks</Title>
                        <DevBadge>DEV MODE</DevBadge>
                    </TitleRow>
                    <Subtitle>
                        {tasks.length} active task{tasks.length !== 1 ? 's' : ''} assigned to {currentUser.username}
                    </Subtitle>
                </HeaderContent>
                <HeaderActions>
                    {onLoadGeometry && (
                        <LoadGeometryButton
                            $variant={geometryLoaded ? "secondary" : "primary"}
                            onClick={onLoadGeometry}
                            $loaded={geometryLoaded || false}
                            disabled={geometryLoaded}
                        >
                            {geometryLoaded ? "✓ Geometry Loaded" : "📁 Load Demo Geometry"}
                        </LoadGeometryButton>
                    )}
                    <UserSwitcher />
                </HeaderActions>
            </HomeHeader>

            <BoardWrapper>
                <UserTaskBoard tasks={tasks} onTaskClick={handleTaskClick} />
            </BoardWrapper>
        </HomeContainer>
    );
};

export default HomeView;

// ======================
// 🔹 Styled Components
// ======================

const HomeContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background: ${({ theme }) => theme.colors.backgroundPrimary};
`;

const HomeHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${({ theme }) => theme.spacing[6]};
    background: ${({ theme }) => theme.colors.backgroundSecondary};
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

const HeaderContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[1]};
`;

const TitleRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[3]};
`;

const Title = styled.h1`
    font-size: ${({ theme }) => theme.typography.size.xxl};
    font-weight: ${({ theme }) => theme.typography.weight.bold};
    color: ${({ theme }) => theme.colors.textPrimary};
    margin: 0;
`;

const DevBadge = styled.div`
    padding: ${({ theme }) => `${theme.primitives.paddingY.xxxs} ${theme.primitives.paddingX.xsm}`};
    background: ${({ theme }) => theme.colors.statusWarning};
    color: ${({ theme }) => theme.colors.textInverted};
    font-size: ${({ theme }) => theme.typography.size.xsm};
    font-weight: ${({ theme }) => theme.typography.weight.bold};
    border-radius: ${({ theme }) => theme.radius.sm};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const Subtitle = styled.p`
    font-size: ${({ theme }) => theme.typography.size.md};
    color: ${({ theme }) => theme.colors.textMuted};
    margin: 0;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing[4]};
    align-items: center;
`;

const BoardWrapper = styled.div`
    flex: 1;
    overflow: hidden;
`;

const LoadGeometryButton = styled(BaseButton)<{ $variant: "primary" | "secondary", $loaded: boolean }>`
    &:hover:not(:disabled) {
        background: ${({ theme, $loaded }) =>
    $loaded ? theme.colors.statusSuccess : theme.colors.brandSecondary};
        transform: translateY(-1px);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.8;
    }
`;

const NoUserState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: ${({ theme }) => theme.spacing[4]};
`;

const NoUserIcon = styled.div`
    font-size: 64px;
`;

const NoUserText = styled.div`
    font-size: ${({ theme }) => theme.typography.size.lg};
    color: ${({ theme }) => theme.colors.textMuted};
`;

const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: ${({ theme }) => theme.spacing[4]};
`;

const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    border: 4px solid ${({ theme }) => theme.colors.borderSubtle};
    border-top-color: ${({ theme }) => theme.colors.brandPrimary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.div`
    font-size: ${({ theme }) => theme.typography.size.md};
    color: ${({ theme }) => theme.colors.textMuted};
`;