import React, { useState } from "react";
import styled from "styled-components";
import { MenuItem } from "./MenuItem";

interface SubMenuItemData {
  id: string;
  text: string;
  isActive?: boolean;
}

interface MenuSectionProps {
  title?: string;
  items: {
    id: string;
    icon: React.ReactNode;
    text: string;
    isActive?: boolean;
    isNavigation?: boolean;
    hasSubItems?: boolean;
    badge?: string | number;
    subItems?: SubMenuItemData[];
  }[];
  isCollapsedForLayout?: boolean; // NEW
  allowSubmenus?: boolean; // NEW
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  title,
  items,
  isCollapsedForLayout = false,
  allowSubmenus = true,
}) => {
  // Add state to track which items are expanded
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  return (
    <MenuSectionContainer $isCollapsed={isCollapsedForLayout}>
      {title && (
        <SectionHeader isCollapsed={isCollapsedForLayout}>
          {title}
        </SectionHeader>
      )}

      {items.map((item) => (
        <div key={item.id}>
          <MenuItem
            icon={item.icon}
            text={item.text}
            isActive={item.isActive}
            isNavigation={item.isNavigation}
            hasSubItems={item.hasSubItems}
            isExpanded={expandedItems.has(item.id)}
            badge={item.badge}
            isCollapsed={isCollapsedForLayout} // use layout collapse for row look/width
            onClick={() => item.hasSubItems && toggleExpanded(item.id)}
          />

          {item.hasSubItems &&
            item.subItems &&
            allowSubmenus &&
            expandedItems.has(item.id) && ( // only render when THIS item is expanded
              <SubMenuContainer isExpanded itemCount={item.subItems.length}>
                {item.subItems.map((subItem) => (
                  <SubMenuItem key={subItem.id} isActive={subItem.isActive}>
                    <SubMenuItemText isActive={subItem.isActive}>
                      {subItem.text}
                    </SubMenuItemText>
                  </SubMenuItem>
                ))}
              </SubMenuContainer>
            )}
        </div>
      ))}
    </MenuSectionContainer>
  );
};

// Section containers
const MenuSectionContainer = styled.div<{ $isCollapsed: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
`;

// Section title area
const SectionHeader = styled.div<{ isCollapsed?: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 16px 0 8px 0;
`;

// Sub-menu container
const SubMenuContainer = styled.div<{
  isExpanded?: boolean;
  itemCount?: number;
}>`
  max-height: ${(props) =>
    props.isExpanded ? `${(props.itemCount || 0) * 48}px` : "0px"};
  overflow: hidden;
  transition: max-height 0.3s ease;
  margin-left: 28px;
  margin-top: 4px;
  position: relative;

  /* Vertical line connecting to sub-items */
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--border-bg);
    opacity: ${(props) => (props.isExpanded ? 1 : 0)};
    transition: opacity 0.3s ease;
  }
`;

// Sub-menu item
const SubMenuItem = styled.button<{ isActive?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  padding: 10px 10px 10px 0px;
  padding-left: 32px;
  border: none;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;
  position: relative;

  color: ${(props) =>
    props.isActive ? "var(--text-primary)" : "var(--text-muted)"};

  /* Horizontal line connecting to vertical line */
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    width: 15px;
    height: 2px;
    background: var(--border-bg);
    transform: translateY(-50%);
  }

  &:hover {
    &::before {
      background: var(--primary-action);
    }
    color: var(--primary-action);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

// Sub-menu item text
export const SubMenuItemText = styled.span<{ isActive?: boolean }>`
  font-size: 14px;
  font-weight: ${(props) => (props.isActive ? "600" : "400")};
`;
