import React, { useRef } from "react";
import styled from "styled-components";
import {MenuItem} from "./sharedComponents";

interface MenuViewItemProps {
    item: MenuItem;
    $isCollapsed: boolean;
    onClick: () => void;
}

export default function MenuViewItem({item, $isCollapsed, onClick}: MenuViewItemProps) {
    const menuItemRef = useRef<HTMLButtonElement>(null);

    const handleClick = () => {
        if (!item.disabled && onClick) {
            onClick();
        }
    };

    return (
        <MenuItemContainer
            ref={menuItemRef}
            $isCollapsed={$isCollapsed}
            $disabled={item.disabled}
            onClick={handleClick}
            aria-disabled={item.disabled}
            role="button"
            tabIndex={item.disabled ? -1 : 0}
        >
            <ActiveIndicator $isActive={item.isActive} $disabled={item.disabled}/>
            <ContentWrapper $isActive={item.isActive} $disabled={item.disabled} $isCollapsed={$isCollapsed}>
                <IconWrapper $isActive={item.isActive} $disabled={item.disabled}>
                    {item.icon}
                </IconWrapper>
                <MenuItemTitle $isActive={item.isActive}>
                    {item.title}
                </MenuItemTitle>
            </ContentWrapper>
        </MenuItemContainer>
    );
}

// ======================
// 🔹 Styled Components
// ======================
const MenuItemContainer = styled.button<{
    $isCollapsed?: boolean;
    $disabled?: boolean;
}>`
    position: relative;
    display: flex;
    height: ${({theme}) => theme.primitives.heights.smallCell};
    width: 100%;
    padding: 0;
    opacity: ${({$disabled}) => ($disabled ? 0.5 : 1)};
    transition: all ${({theme}) => theme.animation.duration.fast} ${({theme}) => theme.animation.easing.standard};
`;

const ActiveIndicator = styled.div<{ $isActive?: boolean; $disabled?: boolean }>`
    display: flex;
    width: 3px;
    border-radius: 0 ${({theme}) => theme.radius.sm} ${({theme}) => theme.radius.sm} 0;
    background-color: ${({theme, $isActive, $disabled}) => {
    if ($disabled) return "transparent";
    return $isActive ? theme.colors.brandPrimary : "transparent";
}};
    transition: background-color ${({theme}) => theme.animation.duration.fast} ${({theme}) => theme.animation.easing.standard};
`;

const ContentWrapper = styled.div<{ $isActive?: boolean; $disabled?: boolean; $isCollapsed?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: ${({$isCollapsed}) => ($isCollapsed ? "center" : "flex-start")};
    gap: ${({theme}) => theme.spacing[2]};
    height: 100%;
    width: 100%;
    padding: ${({theme}) => `0 ${theme.spacing[2]}`};
    margin: 0 ${({ theme }) => theme.components.sidebar.paddingX};
    border-radius: ${({ theme }) => theme.primitives.radius.md};
    ;

    background: ${({theme, $isActive, $disabled}) => {
        if ($disabled) return "transparent";
        if ($isActive) return theme.colors.backgroundQuaternary;
        return "transparent";
    }};
    color: ${({theme, $isActive, $disabled}) => {
        if ($disabled) return theme.colors.accentPrimary;
        if ($isActive) return theme.primitives.colors.background1000;
        return theme.colors.accentPrimary;
    }};
    &:hover {
        background: ${({theme, $isActive, $disabled}) => {
            if ($disabled) return "transparent";
            if ($isActive) return theme.colors.backgroundQuaternary;
            return theme.colors.backgroundTertiary;
        }};
        cursor: ${({$disabled}) => ($disabled ? "not-allowed" : "pointer")};

    }
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
        transition: color ${({theme}) => theme.animation.duration.fast} ${({theme}) => theme.animation.easing.standard};
    }
`;

const MenuItemTitle = styled.span<{ $isActive?: boolean }>`
    overflow: hidden;
    white-space: nowrap;
    font-weight: ${({theme, $isActive}) =>
            $isActive ? theme.typography.weight.semiBold : theme.typography.weight.regular};
    color: ${(p) => (p.$isActive ? p.theme.colors.textPrimary : p.theme.colors.accentPrimary)};
    transition: opacity ${({theme}) => theme.animation.duration.fast} ${({theme}) => theme.animation.easing.standard};
`;