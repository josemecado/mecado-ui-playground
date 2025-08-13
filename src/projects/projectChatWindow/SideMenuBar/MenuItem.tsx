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
    <BaseMenuItem
      $isActive={isActive}
      $isCollapsed={isCollapsed}
      $isNavigation={isNavigation}
      onClick={onClick}
    >
      <MenuItemContent>
        <IconContainer $isActive={isActive} $isCollapsed={isCollapsed}>
          {icon}
        </IconContainer>

        {!isCollapsed && <MenuItemText>{text}</MenuItemText>}
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
  );
};

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
  height: 32px;
  padding: 6px;
  border: none;
  background: ${(props) =>
    props.$isCollapsed
      ? "none"
      : props.$isActive
      ? "var(--primary-alternate)"
      : "none"};
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
  gap: 4px;
`;

// Menu item text
const MenuItemText = styled.span`
  font-size: 13px;
  font-weight: 500;
`;

// Icon container
const IconContainer = styled.div<{
  $isActive?: boolean;
  $isCollapsed?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  width: 32px;
  padding: ${(props) => (props.$isCollapsed ? "0 6px" : "0")};
  border-radius: 8px;

  background: ${(props) =>
    props.$isCollapsed && props.$isActive
      ? "var(--primary-alternate)"
      : "none"};
  svg {
    color: ${(props) =>
      props.$isActive ? "var(--text-inverted)" : "var(--text-muted)"};
    width: 18px;
    height: 18px;
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
