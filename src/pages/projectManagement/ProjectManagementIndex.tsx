import React, { useState } from "react";
import styled from "styled-components";
import SideMenu from "./sideMenu/SideMenu";
import HomeView from "./home/HomeView";
import { ViewType } from "./sideMenu/components/sharedComponents";
import { TaskContext } from "./home/types/types";
import { SimpleLabelCreator } from "./simpleLabelCreator/SimpleLabelCreator";
import { SimpleFileUploader } from "./simpleFileUploader/SimpleFileUploader";
import { updateTaskStatus } from "./home/utils/mockTasks";

export const ProjectManagementIndex: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>("home");
  const [taskContext, setTaskContext] = useState<TaskContext | null>(null);

  const handleNavigateToTool = (view: ViewType, context?: TaskContext) => {
    setActiveView(view);
    if (context) {
      setTaskContext(context);
    }
  };

  const handleLabelSubmit = (taskId: string, labels: string[]) => {
    updateTaskStatus(taskId, "pending", undefined, labels);
    setActiveView("home");
    setTaskContext(null);
  };

  const handleFileUploadSubmit = (taskId: string, fileNames: string[]) => {
    updateTaskStatus(taskId, "pending", undefined, undefined, fileNames);
    setActiveView("home");
    setTaskContext(null);
  };

  const handleCancel = () => {
    setActiveView("home");
    setTaskContext(null);
  };

  const renderView = () => {
    switch (activeView) {
      case "home":
        return <HomeView onNavigateToTool={handleNavigateToTool} />;

      case "reports":
        return <ViewPlaceholder>Reports & Submissions View</ViewPlaceholder>;

      case "notifications":
        return <ViewPlaceholder>Notifications View</ViewPlaceholder>;

      case "geometry-labeler":
        return taskContext ? (
          <SimpleLabelCreator
            taskContext={taskContext}
            onSubmit={handleLabelSubmit}
            onCancel={handleCancel}
          />
        ) : (
          <ViewPlaceholder>No task context available</ViewPlaceholder>
        );

      case "geometry-uploader":
        return taskContext ? (
          <SimpleFileUploader
            taskContext={taskContext}
            onSubmit={handleFileUploadSubmit}
            onCancel={handleCancel}
          />
        ) : (
          <ViewPlaceholder>No task context available</ViewPlaceholder>
        );

      case "geometry-library":
        return (
          <ViewPlaceholder>
            <div>Geometry Library View</div>
            {taskContext && (
              <ContextInfo>
                <h3>Task Context:</h3>
                <pre>{JSON.stringify(taskContext, null, 2)}</pre>
              </ContextInfo>
            )}
          </ViewPlaceholder>
        );

      default:
        return <ViewPlaceholder>Home Dashboard View</ViewPlaceholder>;
    }
  };

  return (
    <LayoutContainer>
      <SideMenu activeView={activeView} onViewChange={setActiveView} />
      <MainContent>{renderView()}</MainContent>
    </LayoutContainer>
  );
};

export default ProjectManagementIndex;

// ======================
// 🔹 Styled Components
// ======================

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.backgroundPrimary};
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.backgroundPrimary};

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.accentPrimary};
    border-radius: ${({ theme }) => theme.radius.sm};
  }
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.accentSecondary};
  }
`;

// Temporary placeholder for views
const ViewPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: ${({ theme }) => theme.typography.size.xl};
  color: ${({ theme }) => theme.colors.textMuted};
  gap: ${({ theme }) => theme.spacing[4]};
`;

const ContextInfo = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: ${({ theme }) => theme.radius.lg};
  max-width: 600px;

  h3 {
    margin: 0 0 ${({ theme }) => theme.spacing[2]} 0;
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: ${({ theme }) => theme.typography.size.lg};
  }

  pre {
    margin: 0;
    padding: ${({ theme }) => theme.spacing[3]};
    background: ${({ theme }) => theme.colors.backgroundPrimary};
    border-radius: ${({ theme }) => theme.radius.md};
    font-family: ${({ theme }) => theme.typography.family.mono};
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.accentPrimary};
    overflow-x: auto;
  }
`;
