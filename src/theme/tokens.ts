// src/theme/tokens.ts

// ============================================================================
// 🎨 PRIMITIVE TOKENS (Foundation)
// ============================================================================
const primitives = {
    colors: {
        // Background (Light/Dark)
        background000: "#0d1012", // Background primary (Dark)
        background200: "#262626", // Background secondary (Dark)
        background400: "#2F3033", // Background tertiary (Dark)
        background450: "#3D3F45",
        background550: "#bbbdc3",
        background600: "#f5f5f5", // Background primary (Light)
        background800: "#ECF0F3", // Background tertiary (Light)
        background1000: "#fff", // Background secondary (Light)

        // Primary (CTA/Brand)
        primary000: "#2f3e4c", // Action (Light)
        primary1000: "#b3c2d0", // Action (Dark)

        // Secondary (CTA/Brand)
        secondary000: "#ced3d7", // Secondary Action (Dark)
        secondary1000: "#282d31", // Secondary Action (Light)

        // Accent Colors
        accent000: "#1B2227", // Tertiary Accent (Dark)
        accent200: "#36424e", // Secondary Accent (Dark)
        accent400: "#6e7f8c", // Primary Accent (Dark)
        accent600: "#738491", // Primary Accent (Light)
        accent800: "#b1bdc9", // Secondary Accent (Light)
        accent1000: "#D8DFE4", // Tertiary Accent (Light)

        // Text Colors
        text000: "#251B14", // Primary (Light)
        text300: "#97979D", // Muted (Dark)
        text700: "#738491", // Muted (Light)
        text1000: "#EAE9F0", // Primary (Dark)

        // Grays (organized from darkest to lightest)
        gray000: "#000000", // Black
        gray050: "#97979D", // Very dark gray (darkBorderBg)
        gray075: "#1a1d21", // Dark gray (darkTextInverted)
        gray100: "#191919", // Dark gray (darkShadowBackground)
        gray200: "#1E2124", // Dark gray (darkBgSecondary)
        gray300: "#2f3033", // Medium-dark gray (darkBgTertiary)
        gray400: "#3d3f45", // Medium gray (darkHoverBg)
        gray500: "#B1BEC9", // Mid gray (accents)
        gray600: "#b1bec9", // Light-medium gray (darkTextMuted)
        gray700: "#738491", // Light gray (lightBorderBg)
        gray800: "#ecf0f3", // Very light gray (lightBgTertiary)
        gray850: "#eeeeee", // Very light gray (lightHoverBg)
        gray875: "#eef0f1", // Almost white (lightTextInverted)
        gray900: "#edf0f2", // Very light gray (lightBgPrimary)
        gray950: "#f4f4f6", // Almost white (lightShadowBackground)
        gray1000: "#ffffff", // White

        // Status
        red500: "#ef4444", // Error
        green500: "#22c55e", // Success
        amber500: "#f59e0b", // Warning/Caution
        gray600Disabled: "#6b7280", // Disabled state
    },

    widths: {
        // Side Menu
        sideMenu: "250px",
        collapsedSideMenu: "80px",
        mediumCard: "250px",
    },

    heights: {
        mediumCard: "200px",
    },

    spacing: {
        0: "0rem",
        0.5: "0.125rem", // 2px
        1: "0.25rem", // 4px
        2: "0.5rem", // 8px
        3: "0.75rem", // 12px
        4: "1rem", // 16px
        6: "1.5rem", // 24px
        8: "2rem", // 32px
        10: "2.5rem", // 40px
        12: "3rem", // 48px
    },

    padding: {
        xsm: "0.5rem",
        sm: "0.75rem",
        md: "1rem",
        lg: "1.25rem",
        xl: "1.5rem",
    },

    radius: {
        none: "0",
        sm: "0.25rem",
        md: "0.5rem",
        lg: "1rem",
        pill: "9999px",
    },

    fontSize: {
        sm: "0.875rem",
        md: "1rem",
        lg: "1.1rem",
        xl: "1.25rem",
        xxl: "1.5rem",
    },

    fontWeight: {
        regular: 400,
        medium: 500,
        semiBold: 600,
        bold: 700,
    },

    fontFamily: {
        base: "'Inter', sans-serif",
        mono: "'Fira Code', monospace",
    },
} as const;

// ============================================================================
// 🏷️ ALIAS/SEMANTIC TOKENS (Theme-aware)
// Mapped to match legacy CSS variables
// ============================================================================
const aliasTokens = {
    light: {
        // Backgrounds (--bg-*)
        backgroundPrimary: primitives.colors.background600,
        backgroundSecondary: primitives.colors.background1000,
        backgroundTertiary: primitives.colors.background800,
        backgroundQuaternary: primitives.colors.background550,
        backgroundShadow: primitives.colors.gray950,

        // Text (--text-*)
        textPrimary: primitives.colors.text000,
        textMuted: primitives.colors.text700,
        textInverted: primitives.colors.text1000,

        // Borders (--border-*)
        borderDefault: primitives.colors.gray700,
        borderSubtle: primitives.colors.gray500,
        borderSoft: primitives.colors.gray500,

        // Brand/Primary Actions (--primary-*)
        brandPrimary: primitives.colors.primary000,
        brandSecondary: primitives.colors.secondary1000, // --theme-lightPrimaryAlternate: #2f3e4c

        // Accents (--accent-*)
        accentPrimary: primitives.colors.accent600,
        accentSecondary: primitives.colors.accent800,
        accentTertiary: primitives.colors.accent1000,

        // Hover States (--hover-*)
        hoverBackground: primitives.colors.gray850, // --theme-lightHoverBg: #eeeeee
        hoverPrimary: primitives.colors.gray500, // --hover-primary (accent-primary)
        hoverSecondary: primitives.colors.gray100, // --hover-primary (accent-primary)

        // Status (--error, --success, --disabled, --caution)
        statusError: primitives.colors.red500, // --theme-lightError: #ef4444
        statusSuccess: primitives.colors.green500, // --theme-lightSuccess: #22c55e
        statusWarning: primitives.colors.amber500, // --theme-lightCaution: #f59e0b
        statusDisabled: primitives.colors.gray600Disabled, // --theme-lightDisabled: #6b7280
    },

    dark: {
        // Backgrounds (--bg-*)
        backgroundPrimary: primitives.colors.background000, // --theme-darkBgPrimary: #000000
        backgroundSecondary: primitives.colors.background200, // --theme-darkBgSecondary: #262626
        backgroundTertiary: primitives.colors.background400, // --theme-darkBgTertiary: #2f3033
        backgroundQuaternary: primitives.colors.background450,
        backgroundShadow: primitives.colors.gray100, // --theme-darkShadowBackground: #191919

        // Text (--text-*)
        textPrimary: primitives.colors.text1000,
        textMuted: primitives.colors.text300,
        textInverted: primitives.colors.text000,

        // Borders (--border-*)
        borderDefault: primitives.colors.gray600, // --theme-darkBorderBg: #0b0e16
        borderSubtle: primitives.colors.accent400, // --border-outline: #b1bec9
        borderSoft: primitives.colors.gray050, // --border-soft: #738491

        // Brand/Primary Actions (--primary-*)
        brandPrimary: primitives.colors.primary1000, // --theme-darkPrimaryAction: #2f3e4c
        brandSecondary: primitives.colors.secondary000, // --theme-darkPrimaryAlternate: #ffffff

        // Accents (--accent-*)
        accentPrimary: primitives.colors.accent400,
        accentSecondary: primitives.colors.accent200,
        accentTertiary: primitives.colors.accent000,

        // Hover States (--hover-*)
        hoverBackground: primitives.colors.gray400, // --theme-darkHoverBg: #3d3f45
        hoverPrimary: primitives.colors.gray500, // --hover-primary (accent-primary)
        hoverSecondary: primitives.colors.gray900, // --hover-primary (accent-primary)

        // Status (--error, --success, --disabled, --caution)
        statusError: primitives.colors.red500, // --theme-darkError: #ef4444
        statusSuccess: primitives.colors.green500, // --theme-darkSuccess: #22c55e
        statusWarning: primitives.colors.amber500, // --theme-darkCaution: #f59e0b
        statusDisabled: primitives.colors.gray600Disabled, // --theme-darkDisabled: #6b7280
    },
} as const;

// ============================================================================
// 🧩 COMPONENT TOKENS
// ============================================================================
const componentTokens = {
    sidebar: {
        // width: p
        paddingX: primitives.padding.xl,
        paddingY: primitives.padding.xl,
        collapsedPaddingX: primitives.padding.sm,
        collapsedPaddingY: primitives.padding.sm,

        gap: primitives.spacing[2],
        radius: primitives.radius.md,

        //Typography
        titleFontSize: primitives.fontSize.lg,
        textFontSize: primitives.fontSize.md,
        fontWeight: primitives.fontWeight.medium,
    },

    button: {
        paddingX: primitives.spacing[4],
        paddingY: primitives.spacing[3],
        paddingXLarge: primitives.spacing[4],
        paddingYLarge: primitives.spacing[4],
        gap: primitives.spacing[2],
        radius: primitives.radius.md,
        height: "2.5rem",
        heightLarge: "3rem",
        fontSize: primitives.fontSize.md,
        fontWeight: primitives.fontWeight.medium,
    },

    card: {
        width: primitives.widths.mediumCard,
        heightMedium: primitives.heights.mediumCard,
        padding: primitives.spacing[4],
        radius: primitives.radius.lg,
        gap: primitives.spacing[3],
    },

    input: {
        height: "2.5rem",
        paddingX: primitives.spacing[3],
        radius: primitives.radius.md,
        fontSize: primitives.fontSize.md,
    },
} as const;

// ============================================================================
// 📦 EXPORT UNIFIED TOKENS
// ============================================================================
export const tokens = {
    primitives,
    colors: aliasTokens,
    widths: primitives.widths,
    heights: primitives.heights,
    spacing: primitives.spacing,
    padding: primitives.padding,
    radius: primitives.radius,
    typography: {
        family: primitives.fontFamily,
        size: primitives.fontSize,
        weight: primitives.fontWeight,
    },
    components: componentTokens,
    animation: {
        duration: {
            fast: "150ms",
            medium: "300ms",
            slow: "500ms",
        },
        easing: {
            standard: "cubic-bezier(0.4, 0, 0.2, 1)",
            entrance: "cubic-bezier(0, 0, 0.2, 1)",
            exit: "cubic-bezier(0.4, 0, 1, 1)",
        },
    },
    layout: {
        sidebarWidth: "250px",
        headerHeight: "64px",
    },
} as const;
