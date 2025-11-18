// ProjectManagementIndex.tsx
// Updated to use UserContext and unified task system

import React, { useState } from "react";
import styled from "styled-components";
import SideMenu from "./sideMenu/SideMenu";
import HomeView from "./home/HomeView";
import { ViewType } from "./sideMenu/components/sharedComponents";
import { SimpleFileUploader } from "./simpleFileUploader/SimpleFileUploader";
import { GeoLabelManagerWrapper } from "./geoLabelWrapper/Geolabelmanagerwrapper";
import { GeometryData } from "./types/geometry.types";
import { AdminDashboardView } from "./admin";
import { UserProvider } from "./context/UserContext";
import type { UnifiedTask } from "./admin/types/admin.types";

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

const ProjectManagementIndexInner: React.FC = () => {
    const [activeView, setActiveView] = useState<ViewType>("admin-dashboard" as ViewType);
    const [taskContext, setTaskContext] = useState<TaskContext | null>(null);
    const [geometryData, setGeometryData] = useState<GeometryData | null>(null);
    const [geometryLoaded, setGeometryLoaded] = useState(false);
    const [isLoadingGeometry, setIsLoadingGeometry] = useState(false);

    const handleNavigateToTool = (view: ViewType, context?: TaskContext) => {
        setActiveView(view);
        if (context) {
            setTaskContext(context);
        }
    };

    const handleLoadGeometry = async () => {
        if (isLoadingGeometry) return;

        setIsLoadingGeometry(true);
        try {
            const result = await window.electron.openFileDialog({
                properties: ["openFile"],
                filters: [{ name: "STEP Files", extensions: ["step", "stp", "x_t"] }],
                title: "Select Geometry File for Demo",
                buttonLabel: "Load Geometry",
            });

            if (!result.canceled && result.filePaths.length > 0) {
                const fullPath = result.filePaths[0];
                console.log("Loading geometry file:", fullPath);

                // Convert STEP to VTP using the oneOffVisualize API
                const vtpResult = await window.projectAPI.geometry.oneOffVisualize(
                    fullPath
                );

                if (vtpResult.error) {
                    alert(`Error loading geometry: ${vtpResult.error}`);
                    return;
                }

                // Store the geometry data
                setGeometryData({
                    bodiesFile: vtpResult.bodiesFile,
                    facesFile: vtpResult.facesFile,
                    edgesFile: vtpResult.edgesFile,
                    fileName: fullPath.split(/[\\/]/).pop(),
                });
                setGeometryLoaded(true);

                console.log(
                    "Geometry loaded successfully:",
                    fullPath.split(/[\\/]/).pop()
                );
            }
        } catch (error) {
            console.error("Error loading geometry:", error);
            alert(`Failed to load geometry: ${error.message || "Unknown error"}`);
        } finally {
            setIsLoadingGeometry(false);
        }
    };

    const handleFileUploadComplete = (taskId: string, fileNames: string[]) => {
        console.log(`[ProjectManagementIndex] File upload completed for task ${taskId}`);
        setActiveView("home");
        setTaskContext(null);
    };

    const handleLabelingComplete = (taskId: string, labels: string[]) => {
        console.log(`[ProjectManagementIndex] Labeling completed for task ${taskId}`);
        setActiveView("home");
        setTaskContext(null);
    };

    const handleCancel = () => {
        setActiveView("home");
        setTaskContext(null);
    };

    // Admin handlers
    const handleAdminTaskClick = (task: UnifiedTask) => {
        console.log('[ProjectManagementIndex] Admin clicked task:', task);
        // TODO: Navigate to task detail view or open edit modal
        alert(`Task: ${task.title}\nStage: ${task.stage}\nAssigned to: ${task.assignedTo}`);
    };

    const renderView = () => {
        switch (activeView) {
            case "home":
                return (
                    <HomeView
                        onNavigateToTool={handleNavigateToTool}
                        onLoadGeometry={handleLoadGeometry}
                        geometryLoaded={geometryLoaded}
                    />
                );

            case "reports":
                return <ViewPlaceholder>Reports & Submissions View</ViewPlaceholder>;

            case "notifications":
                return <ViewPlaceholder>Notifications View</ViewPlaceholder>;

            case "admin-dashboard":
                return (
                    <AdminDashboardView
                        onTaskClick={handleAdminTaskClick}
                    />
                );

            case "geometry-labeler":
                return taskContext ? (
                    <GeoLabelManagerWrapper
                        taskContext={taskContext}
                        geometryData={geometryData}
                        onSubmitLabels={handleLabelingComplete}
                        onCancel={handleCancel}
                    />
                ) : (
                    <ViewPlaceholder>No task context available</ViewPlaceholder>
                );

            case "geometry-uploader":
                return taskContext ? (
                    <SimpleFileUploader
                        taskContext={taskContext}
                        onSubmit={handleFileUploadComplete}
                        onCancel={handleCancel}
                    />
                ) : (
                    <ViewPlaceholder>No task context available</ViewPlaceholder>
                );

            case "geometry-library":
                return <ViewPlaceholder>Geometry Library (Coming Soon)</ViewPlaceholder>;

            default:
                return <ViewPlaceholder>View Not Found</ViewPlaceholder>;
        }
    };

    return (
        <LayoutContainer>
            <SideMenu activeView={activeView} onViewChange={setActiveView} />
            <MainContent>{renderView()}</MainContent>
        </LayoutContainer>
    );
};

// Wrap with UserProvider
export const ProjectManagementIndex: React.FC = () => {
    return (
        <UserProvider>
            <ProjectManagementIndexInner />
        </UserProvider>
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