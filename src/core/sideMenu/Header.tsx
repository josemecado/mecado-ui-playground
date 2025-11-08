import React from "react";
import styled from "styled-components";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import Logo from "../../assets/vulcan-logo-white.svg";
import LogoBlack from "../../assets/vulcan-logo-black.svg";
import { useTheme } from "../../utilities/ThemeContext";

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
    <HeaderContainer isCollapsed={isCollapsed}>
      <LogoContainer>
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

// ======================
// 🔹 Styled Components
// ======================

const HeaderContainer = styled.div<{ isCollapsed?: boolean }>`
  display: flex;
  flex-direction: column;
  transition: padding 0.2s ease;
  padding: ${({ theme, isCollapsed }) =>
    isCollapsed
      ? `${theme.components.sidebar.collapsedPaddingY} ${theme.components.sidebar.collapsedPaddingX}`
      : `${theme.components.sidebar.paddingY} ${theme.components.sidebar.paddingX}`};
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.components.sidebar.gap};
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.components.sidebar.gap};
`;

const LogoIcon = styled.div`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    height: 2rem;
    width: 2rem;
    flex-shrink: 0;
  }
`;

const ToggleButton = styled.button<{ isCollapsed?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;

  background: ${({ theme }) => theme.colors.backgroundTertiary};
  color: ${({ theme }) => theme.colors.textMuted};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.padding.sm};

  transition: all ${({ theme }) => theme.animation.duration.fast}
    ${({ theme }) => theme.animation.easing.standard};
  transform: ${({ isCollapsed }) =>
    isCollapsed ? "rotate(180deg)" : "rotate(0deg)"};

  &:hover {
    background: ${({ theme }) => theme.colors.hoverBackground};
  }

  &:active {
    transform: ${({ isCollapsed }) =>
      isCollapsed ? "rotate(180deg) scale(0.95)" : "rotate(0deg) scale(0.95)"};
  }

  svg {
    height: 18px;
    width: 18px;
    flex-shrink: 0;
  }
`;

const Title = styled.h1<{ isCollapsed?: boolean }>`
  font-size: ${({ theme }) => theme.components.sidebar.titleFontSize};
  font-weight: ${({ theme }) => theme.components.sidebar.fontWeight};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
  opacity: ${({ isCollapsed }) => (isCollapsed ? 0 : 1)};
  width: ${({ isCollapsed }) => (isCollapsed ? 0 : "auto")};
  overflow: hidden;
  transition: opacity 0.3s ease, width 0.3s ease;
  white-space: nowrap;
`;
