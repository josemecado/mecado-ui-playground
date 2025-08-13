import React from "react";
import { useTheme } from "../utilities/ThemeContext";
import styled from "styled-components";
import { Sun, MoonIcon } from "lucide-react";

const Wrapper = styled.div<{ $compact: boolean }>`
  display: inline-flex;
  gap: 8px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.textMuted};
  overflow: hidden;
  padding: ${(props) => (props.$compact ? "4px" : "8px")};
  max-height: ${(props) => (props.$compact ? "30px" : "30px")};
  width: ${(props) => (props.$compact ? "fit-content" : "auto")};
`;

const Option = styled.button<{ active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  padding: 6px 10px;
  background-color: ${({ active, theme }) =>
    active ? theme.colors.primaryAction : theme.colors.bgTertiary};
  color: ${({ active, theme }) => (active ? "#fff" : theme.colors.textMuted)};
  font-weight: ${({ active }) => (active ? 500 : 400)};
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  &:hover {
    background-color: ${({ active, theme }) =>
      active ? theme.colors.primaryAction : theme.colors.primaryAlternate};
  }

  &:focus {
    outline: none;
  }
`;

const CompactButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  background-color: ${({ theme }) => theme.colors.bgTertiary};
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
  border: none;

  &:hover {
    background-color: ${({ theme }) => theme.colors.hoverBg};
  }

  &:focus {
    outline: none;
  }
`;

interface ThemeToggleButtonProps {
  compact?: boolean;
}

const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
  compact = false,
}) => {
  const { theme, toggleTheme } = useTheme();

  const handleSelect = (selected: "light" | "dark") => {
    if (theme !== selected) toggleTheme();
  };

  if (compact) {
    return (
      <Wrapper $compact={compact}>
        <CompactButton
          onClick={toggleTheme}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <MoonIcon size={16} /> : <Sun size={16} />}
        </CompactButton>
      </Wrapper>
    );
  }

  return (
    <Wrapper $compact={compact}>
      <Option active={theme === "light"} onClick={() => handleSelect("light")}>
        <Sun size={16} />
        Light
      </Option>
      <Option active={theme === "dark"} onClick={() => handleSelect("dark")}>
        <MoonIcon size={16} />
        Dark
      </Option>
    </Wrapper>
  );
};

export default ThemeToggleButton;
