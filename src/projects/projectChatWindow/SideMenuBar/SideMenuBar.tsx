import { useState } from "react";
import styled from "styled-components";
import { Pin, Folder, Settings, FileText } from "lucide-react";
import { MenuHeader } from "./MenuHeader";
import { MenuSection } from "./MenuSection";
import { Equation } from "./Equation";
import ThemeToggleButton from "../../../reusable-components/ThemeToggleButton";

interface FileItem {
  name: string;
  path: string;
}

interface SideMenuProps {
  isCollapsed?: boolean;
  pinnedEquations?: Equation[];
  uploadedFiles?: FileItem[];
  generatedFiles?: FileItem[];
}

export const SideMenu: React.FC<SideMenuProps> = ({
  pinnedEquations = [],
  uploadedFiles = [],
  generatedFiles = [],
}) => {
  const [isCollapsed, setCollapse] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const effectiveCollapsed = isCollapsed && !isHovered;

  // ✅ Purely UI data — no handlers, no logs, no state
  const mainMenuItems = [
    {
      id: "pinned",
      icon: <Pin />,
      text: "Equations",
      isActive: true,
      hasSubItems: true,
      subItems:
        pinnedEquations.length > 0
          ? pinnedEquations.map((equation) => ({
              id: `pinned-eq-${equation.id}`,
              text: equation.description || `Equation: ${equation.latex}`,
            }))
          : [{ id: "no-pinned-equations", text: "No pinned equations" }],
    },
    {
      id: "files",
      icon: <FileText />,
      text: "Files",
      isActive: false,
      hasSubItems: true,
      subItems: [
        {
          id: "uploaded-files",
          text: `Uploaded Files (${uploadedFiles.length})`,
          isActive: false,
          hasSubItems: true,
          subItems:
            uploadedFiles.length > 0
              ? uploadedFiles.map((file, index) => ({
                  id: `uploaded-file-${index}`,
                  text: file.name,
                }))
              : [{ id: "no-uploaded-files", text: "No uploaded files" }],
        },
        {
          id: "generated-documentation",
          text: `Generated Docs (${generatedFiles.length})`,
          isActive: false,
          hasSubItems: true,
          subItems:
            generatedFiles.length > 0
              ? generatedFiles.map((file, index) => ({
                  id: `generated-file-${index}`,
                  text: file.name,
                }))
              : [{ id: "no-generated-files", text: "No generated files" }],
        },
      ],
    },
    {
      id: "projects",
      icon: <Folder />,
      text: "Projects",
      isActive: false,
      hasSubItems: true,
      subItems: [
        { id: "recent-projects", text: "Recent Projects" },
        { id: "project-templates", text: "Project Templates" },
        { id: "shared-projects", text: "Shared Projects" },
        { id: "archived-projects", text: "Archived Projects" },
      ],
    },
  ];

  const navigationMenuItems = [
    {
      id: "navigation",
      icon: <Settings />,
      text: "Views",
      isActive: false,
      isNavigation: true,
      hasSubItems: true,
      subItems: [
        { id: "general-preferences", text: "General Preferences" },
        { id: "solver-settings", text: "Solver Settings" },
        { id: "export-preferences", text: "Export Preferences" },
        { id: "account-settings", text: "Account & Billing" },
      ],
    },
  ];

  return (
    <>
      {isCollapsed && !isHovered && (
        <HoverTrigger onMouseEnter={() => setIsHovered(true)} />
      )}
      <SidebarContainer
        $collapsed={effectiveCollapsed} // <- replace isExpanded/isCollapsed with this
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocusCapture={() => setIsHovered(true)}
        onBlurCapture={() => setIsHovered(false)}
      >
        <MenuHeader
          title="Vulcan"
          isCollapsed={effectiveCollapsed}
          isFullyCollapsed={isCollapsed}
          onToggleCollapse={() => setCollapse(!isCollapsed)}
        />

        <ContentContainer>
          <MenuSection
            title="TOOLS"
            items={mainMenuItems}
            isCollapsedForLayout={effectiveCollapsed}
            allowSubmenus={!effectiveCollapsed}
          />

          <MenuSection
            title="VIEWS"
            items={navigationMenuItems}
            isCollapsedForLayout={effectiveCollapsed}
            allowSubmenus={!effectiveCollapsed}
          />

          {!effectiveCollapsed && <ThemeToggleButton />}
        </ContentContainer>
      </SidebarContainer>
    </>
  );
};

export default SideMenu;

// Main sidebar container
const SidebarContainer = styled.div<{ $collapsed?: boolean }>`
  display: flex;
  flex-direction: column;

  /* width expands temporarily on hover when collapsed */
  width: ${(p) => (p.$collapsed ? "80px" : "250px")};
  min-width: 80px;
  background-color: var(--bg-secondary);
  overflow-y: auto;
  overflow-x: hidden;
  transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 16px;
`;

const HoverTrigger = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100px; /* the “hot zone” */
  height: 100vh;
  z-index: 999;
  /* make it keyboard focusable for accessibility if you add tabIndex above */
  outline: none;
`;
