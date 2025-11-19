import React, {useRef} from "react";
import styled from "styled-components";
import {MenuItem} from "../NavigationTypes";

interface MenuViewItemProps {
    item: MenuItem;
    $isCollapsed: boolean;
    onClick: () => void;
}

export function MenuViewItem({item, $isCollapsed, onClick}: MenuViewItemProps) {
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
            {!$isCollapsed && (
                <ActiveIndicator $isActive={item.isActive} $disabled={item.disabled}/>
            )}

            <ContentWrapper $isActive={item.isActive} $disabled={item.disabled} $isCollapsed={$isCollapsed}>
                <IconWrapper $isActive={item.isActive} $disabled={item.disabled}>
                    {item.icon}
                </IconWrapper>
                {!$isCollapsed && (
                    <MenuItemTitle $isActive={item.isActive} $isCollapsed={$isCollapsed}>
                        {item.title}
                    </MenuItemTitle>
                )}
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
        return $isActive ? theme.primitives.colors.primary1000 : "transparent";
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
    margin: 0 ${({theme}) => theme.components.sidebar.paddingX};
    border-radius: ${({theme}) => theme.primitives.radius.md};

    background: ${({theme, $isActive, $disabled}) => {
        if ($disabled) return "transparent";
        if ($isActive) return theme.primitives.colors.background450;
        return "transparent";
    }};
    color: ${({theme, $isActive, $disabled}) => {
        if ($disabled) return theme.primitives.colors.accent400;
        if ($isActive) return theme.primitives.colors.background1000;
        return theme.primitives.colors.accent400;
    }};

    &:hover {
        background: ${({theme, $isActive, $disabled}) => {
            if ($disabled) return "transparent";
            if ($isActive) return theme.primitives.colors.background450;
            return theme.primitives.colors.background400;
        }};
        cursor: ${({$disabled}) => ($disabled ? "not-allowed" : "pointer")};
        color: ${(p) => (p.theme.primitives.colors.text1000)};
    }
    
    transition: all ${(p) => p.theme.animation.duration.fast};
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
    }
`;

const MenuItemTitle = styled.span<{ $isActive?: boolean; $isCollapsed?: boolean }>`
    overflow: hidden;
    white-space: nowrap;
    font-size: ${({theme}) => theme.components.sidebar.textFontSize};
    font-weight: ${({theme, $isActive}) =>
            $isActive ? theme.typography.weight.medium : theme.typography.weight.regular};
    opacity: ${({$isCollapsed}) => ($isCollapsed ? 0 : 1)};
    width: ${({$isCollapsed}) => ($isCollapsed ? "0" : "auto")};
    transition: opacity ${({theme}) => theme.animation.duration.fast} ${({theme}) => theme.animation.easing.standard},
    width ${({theme}) => theme.animation.duration.fast} ${({theme}) => theme.animation.easing.standard};
`;