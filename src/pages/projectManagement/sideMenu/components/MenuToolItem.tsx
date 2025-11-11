import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { MenuItem } from "./sharedComponents";
import { useTheme } from "../../../../utilities/ThemeContext";

interface MenuToolItemProps {
    item: MenuItem;
    $isCollapsed: boolean;
    onClick: () => void;
}

export default function MenuToolItem({ item, $isCollapsed, onClick }: MenuToolItemProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const menuItemRef = useRef<HTMLButtonElement>(null);

    const TOOLTIP_DELAY = 500;
    const { theme } = useTheme();

    const handleMouseEnter = () => {
        // Calculate position when hovering
        if (menuItemRef.current) {
            const rect = menuItemRef.current.getBoundingClientRect();
            setTooltipPosition({
                top: rect.top + rect.height / 2,
                left: rect.right + 12,
            });
        }

        // Clear any existing timer
        if (tooltipTimer.current) {
            clearTimeout(tooltipTimer.current);
        }

        // Set timer to show tooltip after delay
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
        if (!item.disabled && onClick) {
            onClick();
        }
    };

    return (
        <>
            <MenuItemButton
                ref={menuItemRef}
                $isActive={item.isActive}
                $isCollapsed={$isCollapsed}
                $disabled={item.disabled}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                aria-disabled={item.disabled}
                role="button"
                tabIndex={item.disabled ? -1 : 0}
            >
                <ActiveIndicator $isActive={item.isActive} $disabled={item.disabled} />
                <ContentWrapper $isCollapsed={$isCollapsed}>
                    <IconWrapper $isActive={item.isActive} $disabled={item.disabled}>
                        {item.icon}
                    </IconWrapper>
                    <MenuItemTitle $isCollapsed={$isCollapsed} $isActive={item.isActive}>
                        {item.title}
                    </MenuItemTitle>
                </ContentWrapper>
            </MenuItemButton>

            {/* Tooltip for collapsed state or disabled state */}
            {showTooltip && ($isCollapsed || item.disabled) && (
                <Tooltip
                    $top={tooltipPosition.top}
                    $left={tooltipPosition.left}
                    $theme={theme}
                >
                    {item.disabled && item.tooltip ? item.tooltip : item.title}
                </Tooltip>
            )}
        </>
    );
}

// ======================
// 🔹 Styled Components
// ======================

const MenuItemButton = styled.button<{
    $isActive?: boolean;
    $isCollapsed?: boolean;
    $disabled?: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  border: none;
  background: ${({ theme, $isActive, $disabled }) => {
    if ($disabled) return "transparent";
    if ($isActive) return theme.colors.backgroundTertiary;
    return "transparent";
}};
  color: ${({ theme, $isActive, $disabled }) => {
    if ($disabled) return theme.colors.textMuted;
    if ($isActive) return theme.colors.textPrimary;
    return theme.colors.textMuted;
}};
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.typography.size.md};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  font-family: ${({ theme }) => theme.typography.family.base};
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[4]}`};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  transition: all ${({ theme }) => theme.animation.duration.fast}
    ${({ theme }) => theme.animation.easing.standard};

  &:hover {
    background-color: ${({ theme, $disabled, $isActive }) => {
    if ($disabled) return "transparent";
    return theme.colors.hoverBackground;
}};
    color: ${({ theme, $disabled }) => {
    if ($disabled) return theme.colors.textMuted;
    return theme.colors.textPrimary;
}};
    transform: ${({ $disabled }) => ($disabled ? "none" : "translateX(2px)")};
  }

  &:active {
    transform: ${({ $disabled }) => ($disabled ? "none" : "scale(0.98)")};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.brandPrimary};
    outline-offset: 2px;
  }

  ${({ $isCollapsed, theme }) =>
    $isCollapsed &&
    `
    justify-content: center;
    padding: ${theme.spacing[3]};
  `}
`;

const ActiveIndicator = styled.div<{ $isActive?: boolean; $disabled?: boolean }>`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 0 ${({ theme }) => theme.radius.sm} ${({ theme }) => theme.radius.sm} 0;
  background-color: ${({ theme, $isActive, $disabled }) => {
    if ($disabled) return "transparent";
    return $isActive ? theme.colors.brandPrimary : "transparent";
}};
  transition: background-color ${({ theme }) => theme.animation.duration.fast}
    ${({ theme }) => theme.animation.easing.standard};
`;

const ContentWrapper = styled.div<{ $isCollapsed?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $isCollapsed }) => ($isCollapsed ? "center" : "flex-start")};
  gap: ${({ theme }) => theme.spacing[3]};
  width: 100%;
`;

const IconWrapper = styled.div<{ $isActive?: boolean; $disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 18px;
  height: 18px;

  svg {
    width: 18px;
    height: 18px;
    color: ${({ theme, $isActive, $disabled }) => {
    if ($disabled) return theme.colors.textMuted;
    if ($isActive) return theme.colors.textPrimary;
    return "currentColor";
}};
    transition: color ${({ theme }) => theme.animation.duration.fast}
      ${({ theme }) => theme.animation.easing.standard};
  }
`;

const MenuItemTitle = styled.span<{ $isCollapsed?: boolean; $isActive?: boolean }>`
  opacity: ${({ $isCollapsed }) => ($isCollapsed ? 0 : 1)};
  width: ${({ $isCollapsed }) => ($isCollapsed ? "0" : "auto")};
  overflow: hidden;
  white-space: nowrap;
  font-weight: ${({ theme, $isActive }) =>
    $isActive ? theme.typography.weight.semiBold : theme.typography.weight.medium};
  transition: opacity ${({ theme }) => theme.animation.duration.fast}
    ${({ theme }) => theme.animation.easing.standard};
`;

const Tooltip = styled.div<{ $top: number; $left: number; $theme: "light" | "dark" }>`
  position: fixed;
  top: ${({ $top }) => $top}px;
  left: ${({ $left }) => $left}px;
  transform: translateY(-50%);
  background: ${({ theme }) => theme.colors.brandPrimary};
  color: ${({ theme }) => theme.colors.textInverted};
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  white-space: nowrap;
  pointer-events: none;
  z-index: 99999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  animation: fadeIn ${({ theme }) => theme.animation.duration.medium} 
    ${({ theme }) => theme.animation.easing.entrance};

  /* Arrow pointing to the menu item */
  &::before {
    content: "";
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 5px solid transparent;
    border-right-color: ${({ theme }) => theme.colors.brandPrimary};
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