// src/theme/tokens.ts

// ============================================================================
// 🎨 PRIMITIVE TOKENS (Foundation)
// ============================================================================
const primitives = {
  colors: {
    // Grays
    gray000: '#000000',
    gray050: '#0f0e12',
    gray100: '#191919',
    gray200: '#262626',
    gray300: '#2f3033',
    gray400: '#3d3f45',
    gray500: '#738491',
    gray600: '#b1bec9',
    gray700: '#e5e7eb',
    gray800: '#ecf0f3',
    gray850: '#eeeeee',
    gray900: '#edf0f2',
    gray950: '#f4f4f6',
    gray1000: '#ffffff',
    
    // Blues
    blue400: '#2f3e4c',
    blue500: '#1c1b20',
    
    // Status
    red500: '#ef4444',
    green500: '#22c55e',
    amber500: '#f59e0b',
    gray600Disabled: '#6b7280',
    
    // Brand (if applicable)
    brand500: '#ff375f',
  },
  
  spacing: {
    0: '0rem',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
  },
  
  radius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    pill: '9999px',
  },
  
  fontSize: {
    sm: '0.875rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
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
// ============================================================================
const aliasTokens = {
  light: {
    // Backgrounds
    backgroundPrimary: primitives.colors.gray900,
    backgroundSecondary: primitives.colors.gray1000,
    backgroundTertiary: primitives.colors.gray800,
    backgroundShadow: primitives.colors.gray950,
    
    // Text
    textPrimary: primitives.colors.gray000,
    textSecondary: primitives.colors.gray500,
    textMuted: primitives.colors.gray500,
    textInverted: primitives.colors.gray800,
    
    // Borders
    borderDefault: primitives.colors.gray700,
    borderSubtle: primitives.colors.gray800,
    
    // Interactive
    interactivePrimary: primitives.colors.blue400,
    interactiveSecondary: primitives.colors.blue400,
    interactiveHover: primitives.colors.gray850,
    
    // Accents
    accentPrimary: primitives.colors.gray500,
    accentSecondary: primitives.colors.blue400,
    accentNeutral: primitives.colors.gray900,
    
    // Status
    statusError: primitives.colors.red500,
    statusSuccess: primitives.colors.green500,
    statusWarning: primitives.colors.amber500,
    statusDisabled: primitives.colors.gray600Disabled,
  },
  
  dark: {
    // Backgrounds
    backgroundPrimary: primitives.colors.gray000,
    backgroundSecondary: primitives.colors.gray200,
    backgroundTertiary: primitives.colors.gray300,
    backgroundShadow: primitives.colors.gray100,
    
    // Text
    textPrimary: primitives.colors.gray1000,
    textSecondary: primitives.colors.gray600,
    textMuted: primitives.colors.gray600,
    textInverted: primitives.colors.gray050,
    
    // Borders
    borderDefault: primitives.colors.gray050,
    borderSubtle: primitives.colors.gray300,
    
    // Interactive
    interactivePrimary: primitives.colors.blue400,
    interactiveSecondary: primitives.colors.gray1000,
    interactiveHover: primitives.colors.gray400,
    
    // Accents
    accentPrimary: primitives.colors.gray500,
    accentSecondary: primitives.colors.gray500,
    accentNeutral: primitives.colors.gray500,
    
    // Status
    statusError: primitives.colors.red500,
    statusSuccess: primitives.colors.green500,
    statusWarning: primitives.colors.amber500,
    statusDisabled: primitives.colors.gray600Disabled,
  },
} as const;

// ============================================================================
// 🧩 COMPONENT TOKENS
// ============================================================================
const componentTokens = {
  button: {
    // References alias tokens
    paddingX: primitives.spacing[4],
    paddingY: primitives.spacing[2],
    gap: primitives.spacing[2],
    radius: primitives.radius.md,
    height: '2.5rem',
    fontSize: primitives.fontSize.md,
    fontWeight: primitives.fontWeight.medium,
  },
  
  card: {
    padding: primitives.spacing[4],
    radius: primitives.radius.lg,
    gap: primitives.spacing[3],
  },
  
  input: {
    height: '2.5rem',
    paddingX: primitives.spacing[3],
    radius: primitives.radius.md,
    fontSize: primitives.fontSize.md,
  },
  
  // Add more component-specific tokens
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
      fast: '150ms',
      medium: '300ms',
      slow: '500ms',
    },
    easing: {
      standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      entrance: 'cubic-bezier(0, 0, 0.2, 1)',
      exit: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },
  layout: {
    sidebarWidth: '250px',
    headerHeight: '64px',
  },
} as const;