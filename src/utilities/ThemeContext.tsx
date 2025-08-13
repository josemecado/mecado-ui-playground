// ThemeContext.tsx (Updated)
import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";

// themes.ts or a similar file
export const lightTheme = {
  mode: "light",
  colors: {
    bgPrimary: "#eef0f1",
    bgSecondary: "#fff",
    bgTertiary: "#e3e5e9",
    primaryAction: "#42526f",
    primaryAlternate: "#191e24",
    accentPrimary: "#7f8c97",
    accentNeutral: "#b1bec9",
    hoverBg: "#efefef",
    textPrimary: "#000",
    textInverted: "#eef0f1",
    textMuted: "#6b7280",
    borderBg: "#e5e7eb",
    error: "#ef4444",
  },
};

export const darkTheme = {
  mode: "dark",
  colors: {
    bgPrimary: "#191919",
    bgSecondary: "#202020",
    bgTertiary: "#252525",
    primaryAction: "#5b7aa6",
    primaryAlternate: "#7f7f7f",
    accentPrimary: "#94a3b8",
    accentNeutral: "#7f7f7f",
    hoverBg: "#2c2c2c",
    textPrimary: "#f1f5f9",
    textInverted: "#1a1d21",
    textMuted: "#94a3b8",
    borderBg: "#374151",
    error: "#f87171",
  },
};

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved) setTheme(saved);
  }, []); // This useEffect hook is the one you need to add back.

  useEffect(() => {
    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const currentTheme = theme === "light" ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
           {" "}
      <StyledThemeProvider theme={currentTheme}>{children}</StyledThemeProvider>
         {" "}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
