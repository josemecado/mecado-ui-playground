import styled from "styled-components";

export const ActionButton = styled.button<{
  $variant?: "primary" | "secondary" | "pill" | "destructive";
  $config?: "standard" | "large";
}>`
  width: ${(props) => (props.$config === "large" ? "100px" : "auto")};
  height: 40px;
  padding: 8px;
  background: ${(props) => {
    switch (props.$variant) {
      case "primary":
      case "pill":
        return "var(--primary-alternate)";
      case "destructive":
        return "var(--error)";
      default:
        return "var(--bg-tertiary)";
    }
  }};
  color: ${(props) => {
    switch (props.$variant) {
      case "primary":
        return "var(--text-inverted)";
      case "pill":
        return "var(--text-inverted)";
      case "destructive":
        return "white";
      default:
        return "white";
    }
  }};
  border: 1px solid
    ${(props) => {
      switch (props.$variant) {
        case "primary":
          return "var(--primary-action)";
        case "destructive":
          return "var(--error)";
        default:
          return "var(--border-bg)";
      }
    }};
  border-radius: ${(props) => (props.$variant === "pill" ? "100px" : "8px")};
  font-size: ${(props) => (props.$config === "large" ? "15px" : "13px")};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 3px;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    opacity: 0.9;
  }

  &:hover:disabled {
    cursor: not-allowed;
    opacity: 0.7;

    transform: none;
  }
`;
