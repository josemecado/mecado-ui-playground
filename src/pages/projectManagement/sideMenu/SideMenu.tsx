import React, {useState, useEffect, useRef} from "react";
import styled from "styled-components";
import {Home, FileText, Bell, Tag, Library} from "lucide-react";

import {MenuHeader} from "./MenuHeader";
import ThemeToggleButton from "../../../reusable-components/ThemeToggleButton";
import MenuViewItem from "./components/MenuViewItem";
import MenuToolItem from "./components/MenuToolItem";
import {MenuItem, ViewType} from "./components/sharedComponents";

interface SideMenuProps {
    activeView: ViewType;
    onViewChange: (view: ViewType) => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({activeView, onViewChange}) => {
    const [isCollapsed, setCollapse] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const effectiveCollapsed = isCollapsed && !isHovered;

    const HOVER_OPEN_DELAY = 200;
    const HOVER_CLOSE_DELAY = 100;

    const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Auto-collapse on window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1000) {
                setCollapse(true);
            } else {
                setCollapse(false);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const clearTimers = () => {
        if (openTimer.current) {
            clearTimeout(openTimer.current);
            openTimer.current = null;
        }
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
    };

    const handleHoverStart = () => {
        if (!isCollapsed) return;
        if (closeTimer.current) clearTimeout(closeTimer.current);
        if (openTimer.current) return;
        openTimer.current = setTimeout(() => {
            setIsHovered(true);
            openTimer.current = null;
        }, HOVER_OPEN_DELAY);
    };

    const handleHoverEnd = () => {
        if (!isCollapsed) return;
        if (openTimer.current) {
            clearTimeout(openTimer.current);
            openTimer.current = null;
        }
        closeTimer.current = setTimeout(() => {
            setIsHovered(false);
            closeTimer.current = null;
        }, HOVER_CLOSE_DELAY);
    };

    useEffect(() => clearTimers, []);
    useEffect(() => {
        clearTimers();
        setIsHovered(false);
    }, [isCollapsed]);

    const coreMenuItems: MenuItem[] = [
        {
            id: "home",
            icon: <Home size={18}/>,
            title: "Home",
            isActive: activeView === "home",
        },
        {
            id: "reports",
            icon: <FileText size={18}/>,
            title: "Reports & Submissions",
            isActive: activeView === "reports",
        },
        {
            id: "notifications",
            icon: <Bell size={18}/>,
            title: "Notifications",
            isActive: activeView === "notifications",
        },
    ];

    const toolMenuItems: MenuItem[] = [
        {
            id: "geometry-labeler",
            icon: <Tag size={18}/>,
            title: "Geometry Labeler",
            isActive: activeView === "geometry-labeler",
        },
        {
            id: "geometry-library",
            icon: <Library size={18}/>,
            title: "Geometry Library",
            isActive: activeView === "geometry-library",
        },
    ];

    return (
        <SidebarContainer
            $collapsed={effectiveCollapsed}
            onMouseEnter={handleHoverStart}
            onMouseLeave={handleHoverEnd}
            onFocusCapture={() => setIsHovered(true)}
            onBlurCapture={handleHoverEnd}
        >
            <MenuHeader
                title="Vulcan"
                isCollapsed={effectiveCollapsed}
                isFullyCollapsed={isCollapsed}
                onToggleCollapse={() => {
                    clearTimers();
                    setIsHovered(false);
                    setCollapse(!isCollapsed);
                }}
            />

            <ContentContainer>
                {/* Core Navigation Section */}
                <MenuSection>
                    <SectionHeader $isCollapsed={effectiveCollapsed}>CORE</SectionHeader>
                    <MenuItemsContainer>
                        {coreMenuItems.map((item) => (
                            <MenuViewItem
                                key={item.id}
                                item={item}
                                $isCollapsed={effectiveCollapsed}
                                onClick={() => onViewChange(item.id)}
                            />
                        ))}
                    </MenuItemsContainer>
                </MenuSection>

                {/* Tools Section */}
                <MenuSection>
                    <SectionHeader $isCollapsed={effectiveCollapsed}>TOOLS</SectionHeader>
                    <MenuItemsContainer>
                        {toolMenuItems.map((item) => (
                            <MenuToolItem
                                key={item.id}
                                item={item}
                                $isCollapsed={effectiveCollapsed}
                                onClick={() => onViewChange(item.id)}
                            />
                        ))}
                    </MenuItemsContainer>
                </MenuSection>

                {/* Theme Toggle - Bottom aligned */}
                {!effectiveCollapsed && (
                    <ToggleButtonContainer>
                        <ThemeToggleButton/>
                    </ToggleButtonContainer>
                )}
            </ContentContainer>
        </SidebarContainer>
    );
};

export default SideMenu;

// ======================
// 🔹 Styled Components
// ======================

const SidebarContainer = styled.div<{ $collapsed?: boolean }>`
    display: flex;
    flex-direction: column;
    width: ${(p) => p.$collapsed ? p.theme.widths.collapsedSideMenu : p.theme.widths.sideMenu};
    min-width: ${(p) => p.theme.widths.collapsedSideMenu};
    background-color: ${({theme}) => theme.colors.backgroundSecondary};
    overflow-y: auto;
    overflow-x: hidden;
    transition: width ${({theme}) => theme.animation.duration.slow} ${({theme}) => theme.animation.easing.standard};

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: ${({theme}) => theme.colors.accentPrimary};
        border-radius: ${({theme}) => theme.radius.sm};
    }

    &::-webkit-scrollbar-thumb:hover {
        background: ${({theme}) => theme.colors.accentSecondary};
    }
`;

const ContentContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: ${({theme}) => theme.spacing[2]} 0;
`;

const MenuSection = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: ${({theme}) => theme.spacing[4]};
    padding-bottom: ${({theme}) => theme.spacing[2]};
    border-bottom: 1px solid ${({theme}) => theme.colors.borderDefault};

    &:last-of-type {
        border-bottom: none;
    }
`;

const SectionHeader = styled.div<{ $isCollapsed?: boolean }>`
    font-size: ${({theme}) => theme.typography.size.sm};
    font-weight: ${({theme}) => theme.typography.weight.semiBold};
    color: ${({theme}) => theme.colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: ${({theme, $isCollapsed}) =>
            $isCollapsed
                    ? `${theme.spacing[2]} ${theme.spacing[3]}`
                    : `${theme.spacing[2]} ${theme.spacing[4]}`};
    margin-bottom: ${({theme}) => theme.spacing[1]};
    opacity: ${({$isCollapsed}) => ($isCollapsed ? 0 : 1)};
    transition: opacity ${({theme}) => theme.animation.duration.fast} ${({theme}) => theme.animation.easing.standard};
    white-space: nowrap;
    overflow: hidden;
`;

const MenuItemsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing[1]};
    padding: 0 ${({theme}) => theme.spacing[2]};
`;

const ToggleButtonContainer = styled.div`
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: flex-end;
    margin-top: auto;
    padding: ${({theme}) => theme.spacing[4]} ${({theme}) => theme.spacing[2]};
`;