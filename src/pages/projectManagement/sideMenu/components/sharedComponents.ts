import React from "react";

// View types for navigation
export type ViewType =
    | "home"
    | "reports"
    | "notifications"
    | "geometry-labeler"
    | "geometry-library";

// Menu item interface with tooltip support
export interface MenuItem {
    id: ViewType;
    icon: React.ReactNode;
    title: string;
    isActive?: boolean;
    isCollapsed?: boolean;
    disabled?: boolean;
    tooltip?: string; // Custom tooltip text (shown when disabled or collapsed)
    onClick?: () => void;
}