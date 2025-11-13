// src/theme/theme.d.ts
import "styled-components";
import { tokens } from "./tokens";

// Type that represents either light or dark colors
type ThemeColors = typeof tokens.colors.light | typeof tokens.colors.dark;

declare module "styled-components" {
  export interface DefaultTheme {
    mode: "light" | "dark";
    colors: ThemeColors;
    widths: typeof tokens.widths;
    heights: typeof tokens.heights;
    spacing: typeof tokens.spacing;
    padding: typeof tokens.padding;
    paddingX: typeof tokens.paddingX;
    paddingY: typeof tokens.paddingY;
    radius: typeof tokens.radius;
    typography: typeof tokens.typography;
    components: typeof tokens.components;
    animation: typeof tokens.animation;
    primitives: typeof tokens.primitives;
  }
}
