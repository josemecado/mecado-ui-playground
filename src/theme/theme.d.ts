// src/theme/theme.d.ts
import "styled-components";
import { tokens } from "./tokens";

declare module "styled-components" {
  export interface DefaultTheme {
    mode: "light" | "dark";
    colors: typeof tokens.colors.dark; // Alias tokens
    spacing: typeof tokens.spacing;
    radius: typeof tokens.radius;
    typography: typeof tokens.typography;
    components: typeof tokens.components;
    animation: typeof tokens.animation;
    primitives: typeof tokens.primitives; // Optional: if you want access to primitives
  }
}