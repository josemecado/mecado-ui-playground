import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useTheme } from "../../../utilities/ThemeContext";

interface NavigationMenuItemProps {
  icon: React.ReactNode;
  text: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  disabled?: boolean;
  tooltip?: string;
  onClick?: () => void;
}

export const NavigationMenuItem: React.FC<NavigationMenuItemProps> = ({
  icon,
  text,
  isActive = false,
  isCollapsed = false,
  disabled = false,
  tooltip,
  onClick,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navItemRef = useRef<HTMLButtonElement>(null);

  const TOOLTIP_DELAY = 1000; // 1 second delay

  const { theme } = useTheme();

  const handleMouseEnter = () => {
    // Calculate position when hovering
    if (navItemRef.current) {
      const rect = navItemRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 12,
      });
    }

    // Clear any existing timer
    if (tooltipTimer.current) {
      clearTimeout(tooltipTimer.current);
    }

    // Set timer to show tooltip after 1 second
    tooltipTimer.current = setTimeout(() => {
      setShowTooltip(true);
      tooltipTimer.current = null;
    }, TOOLTIP_DELAY);
  };

  const handleMouseLeave = () => {
    // Clear timer if it exists
    if (tooltipTimer.current) {
      clearTimeout(tooltipTimer.current);
      tooltipTimer.current = null;
    }
    // Hide tooltip immediately
    setShowTooltip(false);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimer.current) {
        clearTimeout(tooltipTimer.current);
      }
    };
  }, []);

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <NavItemWrapper $isActive={isActive} $disabled={disabled}>
      <NavItem
        ref={navItemRef}
        $isActive={isActive}
        $isCollapsed={isCollapsed}
        $disabled={disabled}
        $theme={theme}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-disabled={disabled}
        role="button"
        tabIndex={disabled ? -1 : 0}
      >
        <IconContainer $isActive={isActive} $disabled={disabled}>
          {icon}
        </IconContainer>

        {!isCollapsed && <NavItemText $isActive={isActive}>{text}</NavItemText>}
      </NavItem>

      {/* Tooltip for collapsed state or disabled state */}
      {showTooltip && (isCollapsed || (disabled && tooltip)) && (
        <Tooltip $top={tooltipPosition.top} $left={tooltipPosition.left}>
          {disabled && tooltip ? tooltip : text}
        </Tooltip>
      )}
    </NavItemWrapper>
  );
};

// Styled Components
const NavItemWrapper = styled.div<{
  $isActive?: boolean;
  $disabled?: boolean;
}>`
  position: relative;
  padding: 0 12px 0 12px;

  /* Active indicator bar */
  ${(props) =>
    props.$isActive &&
    !props.$disabled &&
    `
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 32px;
      background: var(--accent-primary, white);
      border-radius: 0 8px 8px 0;
    }
  `}
`;

const NavItem = styled.button<{
  $isActive?: boolean;
  $isCollapsed?: boolean;
  $disabled?: boolean;
  $theme: "light" | "dark";
}>`
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$isCollapsed ? "center" : "flex-start")};
  gap: 8px;
  padding: 8px;
  height: 32px;
  width: ${(props) => (props.$isCollapsed ? "none" : "100%")};
  margin-left: ${(props) => (props.$isCollapsed ? "8px" : "0")};
  border: none;
  border-radius: 8px;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  position: relative;

  /* Background and colors */
  background: ${(props) => {
    if (props.$disabled) return "transparent";
    if (props.$theme === "dark") return "var(--hover-bg)";
    if (props.$isActive) return "var(--primary-alternate)";
    return "transparent";
  }};

  color: ${(props) => {
    if (props.$disabled) return "var(--text-muted, #9ca3af)";
    if (props.$theme === "dark") return "var(--text-primary)";
    if (props.$isActive) return "var(--text-inverted, white)";
    return "var(--text-muted, #1f2937)";
  }};

  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};

  /* Hover effects */
  &:hover {
    background: var(--hover-bg);

    transform: ${(props) => (props.$disabled ? "none" : "translateX(2px)")};
  }

  /* Focus styles for accessibility */
  &:focus-visible {
    outline: 2px solid var(--primary-action, #6366f1);
    outline-offset: 2px;
  }
`;

const IconContainer = styled.div<{
  $isActive?: boolean;
  $disabled?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 18px;
    height: 18px;
    color: ${(props) => {
      if (props.$disabled) return "var(--text-muted, #9ca3af)";
      if (props.$isActive) return "white";
      return "var(--text-muted, #6b7280)";
    }};
    transition: color 0.2s ease;
  }
`;

const NavItemText = styled.span<{ $isActive?: boolean }>`
  font-size: 14px;
  font-weight: ${(props) => (props.$isActive ? "600" : "500")};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  text-align: left;
`;

const Tooltip = styled.div<{ $top: number; $left: number }>`
  position: fixed;
  top: ${(props) => props.$top}px;
  left: ${(props) => props.$left}px;
  transform: translateY(-50%);
  background: var(--primary-action);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 99999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  animation: fadeIn 0.2s ease;

  /* Arrow pointing to the menu item */
  &::before {
    content: "";
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 5px solid transparent;
    border-right-color: var(--primary-action);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-50%) translateX(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(-50%) translateX(0);
    }
  }
`;

export default NavigationMenuItem;
