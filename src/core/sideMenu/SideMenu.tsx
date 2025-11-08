import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Home, Settings } from "lucide-react";

import { MenuHeader } from "./Header";
import ThemeToggleButton from "../../reusable-components/ThemeToggleButton";

interface SideMenuProps {
  isCollapsed?: boolean; // Allows external control of collapse state
}

export const SideMenu: React.FC<SideMenuProps> = ({ isCollapsed: boolean }) => {
  // Collapse States
  const [isCollapsed, setCollapse] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const effectiveCollapsed = isCollapsed && !isHovered;

  const HOVER_OPEN_DELAY = 200;
  const HOVER_CLOSE_DELAY = 100;

  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use effect to dynamically collapse sidebar based on window width
  useEffect(() => {
    const handleResize = () => {
      // Anything less than 1000px width will collapse the sidebar

      if (window.innerWidth < 1000) {
        setCollapse(true);
      } else {
        setCollapse(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const clearTimers = () => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const handleHoverStart = () => {
    if (!isCollapsed) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (openTimer.current) return;
    openTimer.current = setTimeout(() => {
      setIsHovered(true);
      openTimer.current = null;
    }, HOVER_OPEN_DELAY);
  };

  const handleHoverEnd = () => {
    if (!isCollapsed) return;
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    closeTimer.current = setTimeout(() => {
      setIsHovered(false);
      closeTimer.current = null;
    }, HOVER_CLOSE_DELAY);
  };

  useEffect(() => clearTimers, []);
  useEffect(() => {
    clearTimers();
    setIsHovered(false);
  }, [isCollapsed]);

  const navigationMenuItems = [
    {
      id: "dashboard",
      icon: <Settings />,
      title: "Dashboard",
      destination: "/dashboard",
      isActive: false,
    },
  ];

  const toolMenuItems = [
    {
      id: "geometry-wizard",
      icon: <Home size={18} />,
      title: "Geometry Wizard",
      destination: "/geometry-wizard",
    },
  ];

  return (
    <SidebarContainer
      $collapsed={effectiveCollapsed}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      onFocusCapture={() => setIsHovered(true)}
      onBlurCapture={handleHoverEnd}
    >
      <MenuHeader
        title="Vulcan"
        isCollapsed={effectiveCollapsed}
        isFullyCollapsed={isCollapsed}
        onToggleCollapse={() => {
          clearTimers();
          setIsHovered(false);
          setCollapse(!isCollapsed);
        }}
      />
      <ContentContainer>
        {/* Navigation Section - Direct implementation */}
        <NavigationSection>
          <SectionHeader $isCollapsed={effectiveCollapsed} $isHidden={false}>
            VIEWS
          </SectionHeader>
        </NavigationSection>

        {!effectiveCollapsed && (
          <ToggleButtonContainer>
            <ThemeToggleButton />
          </ToggleButtonContainer>
        )}
      </ContentContainer>
    </SidebarContainer>
  );
};

export default SideMenu;

// Styled components
const SidebarContainer = styled.div<{ $collapsed?: boolean }>`
  display: flex;
  flex-direction: column;

  width: ${(p) =>
    p.$collapsed ? p.theme.widths.collapsedSideMenu : p.theme.widths.sideMenu};
  min-width: ${(p) => p.theme.widths.collapsedSideMenu};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};

  overflow-y: auto;
  overflow-x: hidden;
  transition: all 0.5s ${({ theme }) => theme.animation.easing.standard};

  &::-webkit-scrollbar {
    width: 6px;
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

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
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
  margin: ${(props) =>
    props.$isCollapsed ? "16px 0 8px 20px" : "16px 0 8px 12px"};

  animation: ${(props) => {
    return "none";
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
