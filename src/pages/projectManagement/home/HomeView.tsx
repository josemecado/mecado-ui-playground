import React, { useState } from "react";
import styled from "styled-components";
import { Task, TaskContext } from "./types/types";
import { TaskBoard } from "./components/TaskBoard";
import { mockTasks, updateTaskStatus } from "./utils/mockTasks";
import { ViewType } from "../sideMenu/components/sharedComponents";

interface HomeViewProps {
  onNavigateToTool: (view: ViewType, context?: TaskContext) => void;
  onLoadGeometry?: () => Promise<void>; // ADD THIS
  geometryLoaded?: boolean; // ADD THIS
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigateToTool,
  onLoadGeometry, // ADD THIS
  geometryLoaded, // ADD THIS
}) => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  const handleTaskClick = (task: Task) => {
    // Create task context to pass to tool
    const context: TaskContext = {
      taskId: task.id,
      taskType: task.type,
    };

    // Add task-specific context
    if (task.type === "geometry_labeling") {
      context.modelId = task.modelId;
      context.geometryId = task.geometryId;
      context.geometryType = task.geometryType;
      context.geometryName = task.geometryName;
    } else if (task.type === "geometry_upload") {
      context.requiredFileCount = task.requiredFileCount;
      context.batchName = task.batchName;
    }

    // Navigate to appropriate tool
    if (task.type === "geometry_labeling") {
      onNavigateToTool("geometry-labeler", context);
    } else if (task.type === "geometry_upload") {
      onNavigateToTool("geometry-uploader", context);
    }
  };

  // Function to simulate task submission (for demo)
  const handleTaskSubmit = (taskId: string) => {
    updateTaskStatus(taskId, "pending");
    setTasks([...mockTasks]); // Trigger re-render
  };

  return (
    <HomeContainer>
      <HomeHeader>
        <HeaderContent>
          <Title>📋 My Tasks</Title>
          <Subtitle>Manage your geometry labeling and upload tasks</Subtitle>
        </HeaderContent>
        <HeaderActions>
          {onLoadGeometry && (
            <LoadGeometryButton
              onClick={onLoadGeometry}
              $loaded={geometryLoaded || false}
              disabled={geometryLoaded}
            >
              {geometryLoaded ? "✓ Geometry Loaded" : "📁 Load Demo Geometry"}
            </LoadGeometryButton>
          )}
          <TaskStats>
            <StatItem>
              <StatValue>
                {tasks.filter((t) => t.status === "todo").length}
              </StatValue>
              <StatLabel>To Do</StatLabel>
            </StatItem>
          </TaskStats>
        </HeaderActions>
      </HomeHeader>

      <BoardWrapper>
        <TaskBoard tasks={tasks} onTaskClick={handleTaskClick} />
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

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.size.xxl};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
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

const TaskStats = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[6]};
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const StatValue = styled.div<{ $success?: boolean }>`
  font-size: ${({ theme }) => theme.typography.size.xxl};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  color: ${({ theme, $success }) =>
    $success ? theme.colors.statusSuccess : theme.colors.brandPrimary};
`;

const StatLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const BoardWrapper = styled.div`
  flex: 1;
  overflow: hidden;
`;

const LoadGeometryButton = styled.button<{ $loaded: boolean }>`
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[4]}`};
  background: ${({ theme, $loaded }) =>
    $loaded ? theme.colors.statusSuccess : theme.colors.brandPrimary};
  color: ${({ theme }) => theme.colors.textInverted};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.typography.size.md};
  font-weight: ${({ theme }) => theme.typography.weight.semiBold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.fast};
  white-space: nowrap;

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