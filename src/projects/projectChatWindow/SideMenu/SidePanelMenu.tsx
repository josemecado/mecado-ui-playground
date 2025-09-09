import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Box,
  GitFork,
  Paperclip,
  FileText,
  Pin,
  ChevronLeft,
  Eye,
} from "lucide-react";
import { Equation } from "../../../reusable-components/models/vulcanModels";
import styled from "styled-components";

export interface FileItem {
  name: string;
  path: string;
}

interface SideMenuProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  // ProjectFileList props
  projectId: string;
  projectVersions: string[];
  projectVersion: number;
  uploadedFilesRefreshKey: number;
  generatedDocsRefreshKey: number;
  // PinnedEquations props
  pinnedHandCalcs: Equation[];
  // View switching props
  currentView?: "chat" | "geometry" | "nodes";
  onViewChange?: (view: "chat" | "geometry" | "nodes") => void;
}

type TabType = "views" | "files" | "docs" | "equations";

export const SidePanelMenu: React.FC<SideMenuProps> = ({
  onToggleCollapse,
  projectId,
  projectVersions,
  projectVersion,
  uploadedFilesRefreshKey,
  generatedDocsRefreshKey,
  pinnedHandCalcs,
  currentView = "chat",
  onViewChange,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("views");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<FileItem[]>([]);
  const [readyToVisualize, setReadyToVisualize] = useState<boolean>(false);

  // Check geometry visualization readiness
  useEffect(() => {
    const loadViz = () => {
      setReadyToVisualize(false);
    };

    loadViz();
  }, [projectId, projectVersion]);

  // Load uploaded files
  useEffect(() => {
    const loadUploadedFiles = () => {
      setUploadedFiles([]);
    };

    loadUploadedFiles();
  }, [projectId, projectVersion, uploadedFilesRefreshKey]);

  // Load generated documentation
  useEffect(() => {
    const loadGeneratedFiles = () => {
      setGeneratedFiles([]);
    };

    loadGeneratedFiles();
  }, [projectId, projectVersion, generatedDocsRefreshKey]);

  const handleOpenFile = async (path: string) => {
    console.error("Failed to open file:");
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    onToggleCollapse?.();
  };

  const tabs = [
    { id: "views" as TabType, icon: <Eye />, label: "Views" },
    {
      id: "files" as TabType,
      icon: <Paperclip />,
      label: "Files",
      badge: uploadedFiles.length,
    },
    {
      id: "docs" as TabType,
      icon: <FileText />,
      label: "Docs",
      badge: generatedFiles.length,
    },
    {
      id: "equations" as TabType,
      icon: <Pin />,
      label: "Pinned",
      badge: pinnedHandCalcs.length,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "views":
        return (
          <ContentSection>
            <SectionTitle>VIEWS</SectionTitle>
            <ViewItem
              $isActive={currentView === "chat"}
              onClick={() => onViewChange?.("chat")}
            >
              <ViewIcon>
                <MessageSquare />
              </ViewIcon>
              <ViewText>Chat</ViewText>
            </ViewItem>
            <ViewItem
              $isActive={currentView === "geometry"}
              $isDisabled={!readyToVisualize}
              onClick={() => readyToVisualize && onViewChange?.("geometry")}
              title={
                !readyToVisualize
                  ? "No geometry available for this version"
                  : undefined
              }
            >
              <ViewIcon>
                <Box />
              </ViewIcon>
              <ViewText>Geometry</ViewText>
            </ViewItem>
            <ViewItem
              $isActive={currentView === "nodes"}
              onClick={() => onViewChange?.("nodes")}
            >
              <ViewIcon>
                <GitFork />
              </ViewIcon>
              <ViewText>Versions</ViewText>
            </ViewItem>
          </ContentSection>
        );

      case "files":
        return (
          <ContentSection>
            <SectionTitle>FILES</SectionTitle>
            <ItemList>
              {uploadedFiles.length > 0 ? (
                uploadedFiles.map((file, index) => (
                  <FileItem
                    key={`uploaded-${index}`}
                    onClick={() => handleOpenFile(file.path)}
                  >
                    <FileIcon>
                      <Paperclip />
                    </FileIcon>
                    <FileName>{file.name}</FileName>
                  </FileItem>
                ))
              ) : (
                <EmptyState>No files uploaded</EmptyState>
              )}
            </ItemList>
          </ContentSection>
        );

      case "docs":
        return (
          <ContentSection>
            <SectionTitle>DOCUMENTATION</SectionTitle>
            <ItemList>
              {generatedFiles.length > 0 ? (
                generatedFiles.map((file, index) => (
                  <FileItem
                    key={`generated-${index}`}
                    onClick={() => handleOpenFile(file.path)}
                  >
                    <FileIcon>
                      <FileText />
                    </FileIcon>
                    <FileName>{file.name}</FileName>
                  </FileItem>
                ))
              ) : (
                <EmptyState>No documentation generated</EmptyState>
              )}
            </ItemList>
          </ContentSection>
        );

      case "equations":
        return (
          <ContentSection>
            <SectionTitle>PINNED EQUATIONS</SectionTitle>
            <EmptyState>No pinned equations</EmptyState>
          </ContentSection>
        );

      default:
        return null;
    }
  };

  return (
    <Container $isCollapsed={isCollapsed}>
      <MainPanel>
        {/* Left Icon Panel */}
        <IconPanel>
          <IconPanelHeader>
            <CollapseButton onClick={handleToggleCollapse}>
              <ChevronLeft />
            </CollapseButton>
          </IconPanelHeader>

          <TabList>
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                $isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
              >
                <TabIcon>{tab.icon}</TabIcon>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <TabBadge>{tab.badge}</TabBadge>
                )}
              </TabButton>
            ))}
          </TabList>
        </IconPanel>

        {/* Right Content Panel */}
        {!isCollapsed && <ContentPanel>{renderContent()}</ContentPanel>}
      </MainPanel>
    </Container>
  );
};

export default SidePanelMenu;

// Styled Components
const Container = styled.div<{ $isCollapsed: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${(props) => (props.$isCollapsed ? "80px" : "320px")};
  min-width: ${(props) => (props.$isCollapsed ? "80px" : "320px")};
  background-color: var(--bg-secondary);
  transition: width 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  overflow: hidden;
`;

const MainPanel = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const IconPanel = styled.div`
  width: 80px;
  min-width: 80px;
  background-color: var(--bg-primary);
  border-right: 1px solid var(--border-bg);
  display: flex;
  flex-direction: column;
`;

const IconPanelHeader = styled.div`
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid var(--border-bg);
`;

const CollapseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;

  svg {
    width: 20px;
    height: 20px;
    color: var(--text-muted);
    transition: transform 0.3s ease;
  }

  &:hover {
    background: var(--hover-bg);
    svg {
      color: var(--text-primary);
    }
  }
`;

const TabList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px;
  gap: 4px;
`;

const TabButton = styled.button<{ $isActive: boolean }>`
  position: relative;
  width: 64px;
  height: 64px;
  border: none;
  background: ${(props) =>
    props.$isActive ? "var(--primary-alternate)" : "transparent"};
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) =>
      props.$isActive ? "var(--primary-alternate)" : "var(--hover-bg)"};
  }

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: ${(props) => (props.$isActive ? "32px" : "0")};
    background: var(--accent-primary);
    border-radius: 0 3px 3px 0;
    transition: height 0.2s ease;
  }
`;

const TabIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 24px;
    height: 24px;
    color: var(--text-primary);
  }
`;

const TabBadge = styled.span`
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--error);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ContentPanel = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-bg);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--text-muted);
  }
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const SectionTitle = styled.h3`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
`;

const ViewItem = styled.button<{ $isActive?: boolean; $isDisabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: none;
  background: ${(props) =>
    props.$isActive ? "var(--primary-alternate)" : "transparent"};
  border-radius: 8px;
  cursor: ${(props) => (props.$isDisabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.$isDisabled ? 0.5 : 1)};
  transition: all 0.2s ease;
  margin-bottom: 4px;

  &:hover {
    background: ${(props) =>
      props.$isDisabled
        ? "transparent"
        : props.$isActive
        ? "var(--primary-alternate)"
        : "var(--hover-bg)"};
  }
`;

const ViewIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
    color: var(--text-primary);
  }
`;

const ViewText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FileItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background: var(--hover-bg);
  }
`;

const FileIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 16px;
    height: 16px;
    color: var(--text-muted);
  }
`;

const FileName = styled.span`
  font-size: 14px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EmptyState = styled.div`
  padding: 24px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  font-style: italic;
`;
