import styled from "styled-components";

export const BaseButton = styled.button<{
  $variant?: "primary" | "secondary" | "pill" | "destructive";
  $config?: "standard" | "large";
}>`
  /* Layout & Box Model */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${(p) => p.theme.components.button.gap};
  height: ${(p) =>
    p.$config === "large" ? "3rem" : p.theme.components.button.height};
  padding: 0 ${(p) => p.theme.components.button.paddingX};
  border-radius: ${(p) =>
    p.$variant === "pill"
      ? p.theme.radius.pill
      : p.theme.components.button.radius};
  border: 1px solid
    ${(p) => {
      switch (p.$variant) {
        case "primary":
        case "pill":
          return p.theme.colors.borderSoft;
        case "destructive":
          return p.theme.colors.statusError;
        default:
          return p.theme.colors.borderDefault;
      }
    }};

  /* Typography */
  font-size: ${(p) => p.theme.typography.size.md};
  font-weight: ${(p) => p.theme.typography.weight.medium};
  font-family: ${(p) => p.theme.typography.family.base};
  color: ${(p) => {
    switch (p.$variant) {
      case "primary":
      case "pill":
        return p.theme.colors.textInverted;
      case "destructive":
        return p.theme.colors.textPrimary;
      default:
        return p.theme.colors.textPrimary;
    }
  }};

  /* Background */
  background: ${(p) => {
    switch (p.$variant) {
      case "primary":
      case "pill":
        return p.theme.colors.primaryAlternate;
      case "destructive":
        return p.theme.colors.statusError;
      default:
        return p.theme.colors.backgroundTertiary;
    }
  }};

  /* Motion & Interaction */
  cursor: pointer;
  transition: all ${(p) => p.theme.animation.duration.fast};
    ${(p) => p.theme.animation.easing.standard};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    background: ${(p) => {
      switch (p.$variant) {
        case "primary":
        case "pill":
          return p.theme.colors.hoverSecondary;
        case "destructive":
          return p.theme.colors.statusError;
        default:
          return p.theme.colors.hoverBackground;
      }
    }};
    opacity: 0.9;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
    background: ${(p) => p.theme.colors.backgroundTertiary};
    color: ${(p) => p.theme.colors.textSecondary};
    border-color: ${(p) => p.theme.colors.borderSubtle};
  }
`;