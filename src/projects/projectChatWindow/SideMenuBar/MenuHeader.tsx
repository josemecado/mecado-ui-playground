import React from "react";
import styled from "styled-components";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import Logo from "../../../assets/mecado-logo.svg";
import LogoBlack from "../../../assets/mecado-logo-black.svg";

import { useTheme } from "../../../utilities/ThemeContext";

interface MenuHeaderProps {
  title: string;
  isCollapsed?: boolean;
  isFullyCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const MenuHeader: React.FC<MenuHeaderProps> = ({
  title,
  isCollapsed = false,
  isFullyCollapsed = false,
  onToggleCollapse,
}) => {
  const { theme } = useTheme();
  const currentLogo = theme === "light" ? LogoBlack : Logo;

  return (
    <HeaderContainer>
      <LogoContainer isCollapsed={isCollapsed}>
        <LogoSection>
          <LogoIcon>
            <img src={currentLogo} alt="Mecado Logo" />
          </LogoIcon>
          <Title isCollapsed={isCollapsed}>{title}</Title>
        </LogoSection>

        {!isCollapsed && (
          <ToggleButton
            isCollapsed={isCollapsed}
            onClick={onToggleCollapse}
            type="button"
          >
            {isFullyCollapsed ? <PanelLeft /> : <PanelLeftClose />}
          </ToggleButton>
        )}
      </LogoContainer>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 24px;
`;

// Logo and title container
const LogoContainer = styled.div<{ isCollapsed?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between; // Changed to space-between to push toggle button to the right
`;

// Left section containing logo and title
const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Logo icon container - no longer clickable
const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    height: 40px;
    width: 40px;
    flex-shrink: 0;
  }
`;

// Toggle button for collapse/expand
const ToggleButton = styled.button<{ isCollapsed?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.3s ease;
  transform: ${(props) =>
    props.isCollapsed ? "rotate(180deg)" : "rotate(0deg)"};
  padding: 4px;
  border: none;
  border-radius: 6px;
  background: var(--bg-tertiary);

  &:active {
    transform: ${(props) =>
      props.isCollapsed
        ? "rotate(180deg) scale(0.95)"
        : "rotate(0deg) scale(0.95)"};
  }

  svg {
    height: 18px;
    width: 18px;
    flex-shrink: 0;
  }
`;

// Title text
const Title = styled.h1<{ isCollapsed?: boolean }>`
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  opacity: ${(props) => (props.isCollapsed ? 0 : 1)};
  width: ${(props) => (props.isCollapsed ? 0 : "auto")};
  overflow: hidden;
  transition: opacity 0.3s ease, width 0.3s ease;
  white-space: nowrap;
`;
