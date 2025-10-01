import { useState, useEffect } from "react";
import styled from "styled-components";
import {
  MessageSquare,
  Box,
  Home,
  Grid,
  Pin,
  Folder,
  Settings,
  FileText,
} from "lucide-react";
import { MenuHeader } from "./MenuHeader";
import { MenuSection } from "./MenuSection";
import { Equation } from "./Equation";
import ThemeToggleButton from "../../../reusable-components/ThemeToggleButton";
import { useLocation } from "react-router-dom";
import { NavigationMenuItem } from "./NavigationMenuItem";

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
  const effectiveCollapsed = true;

  // Add this useEffect to handle responsive collapse
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1000) {
        setCollapse(true);
      } else {
        setCollapse(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Purely UI data — no handlers, no logs, no state
  const mainMenuItems = [
    {
      id: "pinned",
      icon: <Pin />,
      text: "Equations",
      isActive: false,
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

  const destinationItems = [
    {
      id: "dashboard",
      icon: <Home size={18} />,
      text: "Dashboard",
      destination: "/projectDashboard",
    },
    {
      id: "tool-selection",
      icon: <Grid size={18} />,
      text: "Tool Selection",
      destination: "/tools",
    },
    {
      id: "documentation",
      icon: <FileText size={18} />,
      text: "Documentation",
      destination: "/docs",
    },
    {
      id: "settings",
      icon: <Settings size={18} />,
      text: "Settings",
      destination: "/settings",
    },
  ];

  // Get current location for active state
  const location = useLocation();

  // Then in your return statement, add this new section after the VIEWS section:

  return (
    <>
      {isCollapsed && !isHovered && (
        <HoverTrigger onMouseEnter={() => setIsHovered(true)} />
      )}
      <SidebarContainer
        $collapsed={effectiveCollapsed}
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
          <NavigationSection>
            <SectionHeader $isCollapsed={effectiveCollapsed} $isHidden ={false}>VIEWS</SectionHeader>

            <NavigationMenuItem
              icon={<MessageSquare />}
              text="Chat"
              isActive={true}
              isCollapsed={effectiveCollapsed}
              onClick={() => {}}
            />

            <NavigationMenuItem
              icon={<Box />}
              text="Geometry"
              isActive={false}
              isCollapsed={effectiveCollapsed}
              disabled={true}
              tooltip={"No geometry available for this version"}
              onClick={() => {}}
            />
          </NavigationSection>

          <MenuSection
            title="TOOLS"
            items={mainMenuItems}
            isCollapsedForLayout={effectiveCollapsed}
            allowSubmenus={!effectiveCollapsed}
          />

          {!effectiveCollapsed && (
            <ToggleButtonContainer>
              <ThemeToggleButton />
            </ToggleButtonContainer>
          )}
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
  height: 100vh;
  min-width: 80px;
  min-width: ${(props) => (props.$collapsed ? "80px" : "250px")};
  background-color: var(--bg-secondary);
  overflow-y: auto;
  overflow-x: hidden;
  transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  border-right: 1px solid var(--border-bg);


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
  flex: 1;
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

const NavigationSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-bg, #e5e7eb);
  gap: 8px;
`;

const SectionHeader = styled.div<{
  $isCollapsed?: boolean;
  $isHidden?: boolean;
}>`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 16px 0 8px 12px;
  margin: ${props => props.$isCollapsed ? "16px 0 8px 18px" : "16px 0 8px 12px"};;

  animation: ${(props) => {
    if (!props.$isHidden) {
      return "none";
    }

    if (props.$isCollapsed) {
      return "fadeOut 0.3s ease forwards";
    }
    return "fadeIn 0.3s ease forwards";
  }};

  transition: all 0.2s ease;


  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;

const ToggleButtonContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: flex-end;
  margin-top: auto;
  margin-bottom: 16px;
`;
