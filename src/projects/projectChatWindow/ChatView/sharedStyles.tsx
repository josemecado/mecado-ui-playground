import styled from "styled-components";

// Base button for reusability - Capsule/pill themed
export const BaseButton = styled.button<{
  disabled?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border: 1px solid var(--text-muted);
  border-radius: 20px;
  background: var(--bg-secondary);
  box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-primary);

  &:hover:not(:disabled) {
    background-color: var(--hover-bg);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--bg-tertiary);
    color: var(--text-muted);
  }

  &[data-tooltip]:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #1f2937;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 1000;
  }
`;

// Button text styling
export const ButtonText = styled.span`
  font-size: 13px;
  font-weight: 500;
`;
