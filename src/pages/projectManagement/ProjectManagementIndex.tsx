import React, { useState } from "react";
import styled from "styled-components";
import SideMenu from "./sideMenu/SideMenu";
import HomeView from "./home/HomeView";
import { ViewType } from "./sideMenu/components/sharedComponents";
import { TaskContext } from "./home/types/types";
import { SimpleLabelCreator } from "./simpleLabelCreator/SimpleLabelCreator";
import { SimpleFileUploader } from "./simpleFileUploader/SimpleFileUploader";
import { GeoLabelManagerWrapper } from "./geoLabelWrapper/Geolabelmanagerwrapper";
import { updateTaskStatus } from "./home/utils/mockTasks";
import { GeometryData } from "./types/geometry.types";

export const ProjectManagementIndex: React.FC = () => {
    const [activeView, setActiveView] = useState<ViewType>("home");
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

            case "geometry-labeler":
                return taskContext ? (
                    <GeoLabelManagerWrapper
                        taskContext={taskContext}
                        geometryData={geometryData}
                        onSubmitLabels={handleLabelSubmit}
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
                // <SimpleGeometryBrowser onGeometrySelect={() => {}} />; for vulcan-desktop
                return <ViewPlaceholder>No task context available</ViewPlaceholder>;

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