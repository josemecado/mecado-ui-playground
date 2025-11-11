import React, { useState } from "react";
import styled from "styled-components";
import SideMenu from "./sideMenu/SideMenu";

type ViewType = "home" | "reports" | "notifications" | "geometry-labeler" | "geometry-library";

export const ProjectManagementIndex: React.FC = () => {
    const [activeView, setActiveView] = useState<ViewType>("home");

    const renderView = () => {
        switch (activeView) {
            case "home":
                return <ViewPlaceholder>Home Dashboard View</ViewPlaceholder>;
            case "reports":
                return <ViewPlaceholder>Reports & Submissions View</ViewPlaceholder>;
            case "notifications":
                return <ViewPlaceholder>Notifications View</ViewPlaceholder>;
            case "geometry-labeler":
                return <ViewPlaceholder>Geometry Labeler View</ViewPlaceholder>;
            case "geometry-library":
                return <ViewPlaceholder>Geometry Library View</ViewPlaceholder>;
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
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: ${({ theme }) => theme.typography.size.xl};
  color: ${({ theme }) => theme.colors.textMuted};
`;