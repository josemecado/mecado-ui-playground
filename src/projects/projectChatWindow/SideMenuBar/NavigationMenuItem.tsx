import React, { useState } from "react";
import styled from "styled-components";

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

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <NavItemWrapper>
      <NavItem
        $isActive={isActive}
        $isCollapsed={isCollapsed}
        $disabled={disabled}
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-disabled={disabled}
        role="button"
        tabIndex={disabled ? -1 : 0}
      >
        <IconContainer $isActive={isActive} $disabled={disabled}>
          {icon}
        </IconContainer>
        
        {!isCollapsed && (
          <NavItemText $disabled={disabled}>
            {text}
          </NavItemText>
        )}
      </NavItem>

      {/* Tooltip for collapsed state or disabled state */}
      {showTooltip && (isCollapsed || (disabled && tooltip)) && (
        <Tooltip $collapsed={isCollapsed}>
          {disabled && tooltip ? tooltip : text}
        </Tooltip>
      )}
    </NavItemWrapper>
  );
};

// Styled Components
const NavItemWrapper = styled.div`
  position: relative;
  margin-bottom: 4px;
`;

const NavItem = styled.button<{
  $isActive?: boolean;
  $isCollapsed?: boolean;
  $disabled?: boolean;
}>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 6px;
  border: none;
  border-radius: 8px;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  position: relative;
  
  /* Background and colors */
  background: ${props => {
    if (props.$disabled) return 'transparent';
    if (props.$isActive) return 'var(--primary-alternate, #6366f1)';
    return 'transparent';
  }};
  
  color: ${props => {
    if (props.$disabled) return 'var(--text-muted, #9ca3af)';
    if (props.$isActive) return 'var(--text-inverted, white)';
    return 'var(--text-primary, #1f2937)';
  }};
  
  opacity: ${props => props.$disabled ? 0.5 : 1};

  /* Hover effects */
  &:hover {
    background: ${props => {
      if (props.$disabled) return 'var(--bg-tertiary)';
      if (props.$isActive) return 'var(--primary-alternate, #6366f1)';
      return 'var(--hover-bg, rgba(0, 0, 0, 0.05))';
    }};
    
    transform: ${props => props.$disabled ? 'none' : 'translateX(2px)'};
  }

  /* Focus styles for accessibility */
  &:focus-visible {
    outline: 2px solid var(--primary-action, #6366f1);
    outline-offset: 2px;
  }

  /* Active indicator bar */
  ${props => props.$isActive && !props.$disabled && `
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 20px;
      background: var(--text-muted, white);
      border-radius: 0 2px 2px 0;
    }
  `}
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
    width: 20px;
    height: 20px;
    color: ${props => {
      if (props.$disabled) return 'var(--text-muted, #9ca3af)';
      if (props.$isActive) return 'var(--text-inverted, white)';
      return 'var(--text-muted, #6b7280)';
    }};
    transition: color 0.2s ease;
  }
`;

const NavItemText = styled.span<{ $disabled?: boolean }>`
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  text-align: left;
`;

const Tooltip = styled.div<{ $collapsed?: boolean }>`
  position: absolute;
  left: ${props => props.$collapsed ? 'calc(100% + 12px)' : 'calc(100% + 8px)'};
  top: 50%;
  transform: translateY(-50%);
  background: var(--bg-tooltip, #1f2937);
  color: var(--text-tooltip, white);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.2s ease;

  /* Arrow pointing to the menu item */
  &::before {
    content: '';
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 5px solid transparent;
    border-right-color: var(--bg-tooltip, #1f2937);
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