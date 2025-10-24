// src/theme/tokens.ts

// ============================================================================
// 🎨 PRIMITIVE TOKENS (Foundation)
// ============================================================================
const primitives = {
  colors: {
    // Background (Light/Dark)
    background000: "#0d1012", // Background primary (Dark)
    background1000: "#f5f5f5", // Background primary (Light)

    // Primary (CTA/Brand)
    primary000: "#2f3e4c", // Action (Light)
    primary1000: "#b3c2d0", // Actopm (Dark)

    // Secondary (CTA/Brand)
    secondary000: "#6e7f8c", // Action (Dark)
    secondary1000: "#738491", // Action (Light)

    // Accent Colors
    accent000: "#36424e", // Accent (Dark)
    accent1000: "#b1bdc9", // Accent (Light)

    // Grays (organized from darkest to lightest)
    gray000: "#000000", // Black
    gray050: "#0b0e16", // Very dark gray (darkBorderBg)
    gray075: "#1a1d21", // Dark gray (darkTextInverted)
    gray100: "#191919", // Dark gray (darkShadowBackground)
    gray200: "#262626", // Dark gray (darkBgSecondary)
    gray300: "#2f3033", // Medium-dark gray (darkBgTertiary)
    gray400: "#3d3f45", // Medium gray (darkHoverBg)
    gray500: "#738491", // Mid gray (accents)
    gray600: "#b1bec9", // Light-medium gray (darkTextMuted)
    gray700: "#e5e7eb", // Light gray (lightBorderBg)
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

  spacing: {
    0: "0rem",
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px
    3: "0.75rem", // 12px
    4: "1rem", // 16px
    6: "1.5rem", // 24px
    8: "2rem", // 32px
    10: "2.5rem", // 40px
    12: "3rem", // 48px
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
    lg: "1.25rem",
    xl: "1.5rem",
  },

  fontWeight: {
    regular: 400,
    medium: 500,
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
    backgroundPrimary: primitives.colors.background1000, // --theme-lightBgPrimary: #edf0f2
    backgroundSecondary: primitives.colors.gray1000, // --theme-lightBgSecondary: #fff
    backgroundTertiary: primitives.colors.gray800, // --theme-lightBgTertiary: #ecf0f3
    backgroundShadow: primitives.colors.gray950, // --theme-lightShadowBackground: #f4f4f6

    // Text (--text-*)
    textPrimary: primitives.colors.gray000, // --theme-lightTextPrimary: #000
    textSecondary: primitives.colors.gray500, // --theme-lightTextMuted: #738491
    textInverted: primitives.colors.gray875, // --theme-lightTextInverted: #eef0f1

    // Borders (--border-*)
    borderDefault: primitives.colors.gray700, // --theme-lightBorderBg: #e5e7eb
    borderSubtle: primitives.colors.gray500, // --border-outline: #738491
    borderSoft: primitives.colors.gray500, // --border-soft: #738491

    // Brand/Primary Actions (--primary-*)
    primaryBrand: primitives.colors.primary000, // --theme-lightPrimaryAction: #2f3e4c
    secondaryBrand: primitives.colors.secondary1000, // --theme-lightPrimaryAlternate: #2f3e4c

    // Accents (--accent-*)
    accentPrimary: primitives.colors.accent1000, // --theme-lightAccentPrimary: #738491

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
    backgroundSecondary: primitives.colors.gray200, // --theme-darkBgSecondary: #262626
    backgroundTertiary: primitives.colors.gray300, // --theme-darkBgTertiary: #2f3033
    backgroundShadow: primitives.colors.gray100, // --theme-darkShadowBackground: #191919

    // Text (--text-*)
    textPrimary: primitives.colors.gray1000, // --theme-darkTextPrimary: #fff
    textSecondary: primitives.colors.gray600, // --theme-darkTextMuted: #b1bec9
    textInverted: primitives.colors.gray075, // --theme-darkTextInverted: #1a1d21

    // Borders (--border-*)
    borderDefault: primitives.colors.gray050, // --theme-darkBorderBg: #0b0e16
    borderSubtle: primitives.colors.gray600, // --border-outline: #b1bec9
    borderSoft: primitives.colors.gray500, // --border-soft: #738491

    // Brand/Primary Actions (--primary-*)
    primaryBrand: primitives.colors.primary1000, // --theme-darkPrimaryAction: #2f3e4c
    secondaryBrand: primitives.colors.secondary000, // --theme-darkPrimaryAlternate: #ffffff

    // Accents (--accent-*)
    accentPrimary: primitives.colors.accent000, // --theme-darkAccentPrimary: #738491

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
  button: {
    paddingX: primitives.spacing[4],
    paddingY: primitives.spacing[2],
    gap: primitives.spacing[2],
    radius: primitives.radius.md,
    height: "2.5rem",
    heightLarge: "3rem",
    fontSize: primitives.fontSize.md,
    fontWeight: primitives.fontWeight.medium,
  },

  card: {
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
  spacing: primitives.spacing,
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
