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
    text000: "#000000", // Primary (Light)
    text300: "#636369", // Muted (Dark)
    text700: "#97979D", // Muted (Light)
    text1000: "#ffffff", // Primary (Dark)

    // Grays (organized from darkest to lightest)
    gray000: "#000000", // Black
    gray050: "#0b0e16", // Very dark gray (darkBorderBg)
    gray075: "#1a1d21", // Dark gray (darkTextInverted)
    gray100: "#191919", // Dark gray (darkShadowBackground)
    gray200: "#1E2124", // Dark gray (darkBgSecondary)
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
    backgroundPrimary: primitives.colors.background1000,
    backgroundSecondary: primitives.colors.gray1000,
    backgroundTertiary: primitives.colors.gray800,
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
    backgroundSecondary: primitives.colors.gray200, // --theme-darkBgSecondary: #262626
    backgroundTertiary: primitives.colors.gray300, // --theme-darkBgTertiary: #2f3033
    backgroundShadow: primitives.colors.gray100, // --theme-darkShadowBackground: #191919

    // Text (--text-*)
    textPrimary: primitives.colors.text1000,
    textMuted: primitives.colors.text300,
    textInverted: primitives.colors.text000,

    // Borders (--border-*)
    borderDefault: primitives.colors.gray050, // --theme-darkBorderBg: #0b0e16
    borderSubtle: primitives.colors.gray600, // --border-outline: #b1bec9
    borderSoft: primitives.colors.gray500, // --border-soft: #738491

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
