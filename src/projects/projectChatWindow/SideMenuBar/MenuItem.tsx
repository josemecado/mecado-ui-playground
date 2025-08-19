import React from "react";
import styled from "styled-components";
import { ChevronDown } from "lucide-react";

interface MenuItemProps {
  icon: React.ReactNode;
  text: string;
  isActive?: boolean;
  isNavigation?: boolean;
  hasSubItems?: boolean;
  isExpanded?: boolean;
  badge?: string | number;
  isCollapsed?: boolean;
  onClick?: () => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  text,
  isActive = false,
  isNavigation = false,
  hasSubItems = false,
  isExpanded = false,
  badge,
  isCollapsed = false,
  onClick,
}) => {
  return (
    <NavItemWrapper  $isActive={isActive}>
      <BaseMenuItem
        $isActive={isActive}
        $isCollapsed={isCollapsed}
        $isNavigation={isNavigation}
        onClick={onClick}
      >
        <MenuItemContent>
          <IconContainer $isActive={isActive}>
            {icon}
          </IconContainer>

          {!isCollapsed && <MenuItemText $isActive={isActive}>{text}</MenuItemText>}
        </MenuItemContent>

        {!isCollapsed && !isNavigation && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {badge && <NotificationBadge>{badge}</NotificationBadge>}

            {hasSubItems && (
              <ExpandChevron isExpanded={isExpanded}>
                <ChevronDown />
              </ExpandChevron>
            )}
          </div>
        )}
      </BaseMenuItem>
    </NavItemWrapper>
  );
};

const NavItemWrapper = styled.div<{
  $isActive?: boolean;
}>`
  position: relative;
  padding: 0 12px 0 12px;

  /* Active indicator bar */
  ${(props) =>
    props.$isActive &&
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

// Base menu item styles
const BaseMenuItem = styled.button<{
  $isActive?: boolean;
  $isCollapsed?: boolean;
  $isNavigation?: boolean;
}>`
  ${(props) => !props.$isCollapsed && "width: 100%;"}
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  height: 32px;
  width: ${(props) => (props.$isCollapsed ? "none" : "100%")};
  margin-left: ${(props) => (props.$isCollapsed ? "8px" : "0")};
  border: none;
  background: ${(props) =>
    props.$isActive ? "var(--primary-alternate)" : "none"};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;

  color: ${(props) =>
    props.$isActive ? "var(--text-inverted)" : "var(--text-primary)"};

  &:hover {
    background: ${(props) =>
      props.$isActive ? "var(--primary-alternate)" : "var(--hover-bg)"};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

// Menu item content (icon + text)
const MenuItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Menu item text
const MenuItemText = styled.span<{ $isActive?: boolean }>`
  font-size: 14px;
  font-weight: ${(props) => (props.$isActive ? "600" : "500")};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  text-align: left;
`;

const IconContainer = styled.div<{
  $isActive?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 18px;
    height: 18px;
    color: ${(props) => {
      if (props.$isActive) return "var(--text-primary, white)";
      return "var(--text-muted, #6b7280)";
    }};
    transition: color 0.2s ease;
  }
`;

// Expandable chevron
const ExpandChevron = styled.div<{ isExpanded?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  transform: ${(props) =>
    props.isExpanded ? "rotate(180deg)" : "rotate(0deg)"};
  transition: transform 0.3s ease;

  svg {
    width: 16px;
    height: 16px;
    color: var(--text-muted);
  }
`;

// Badge for notifications
const NotificationBadge = styled.span`
  background: var(--error);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
