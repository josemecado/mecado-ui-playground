// src/utilities/ThemeContext.tsx
import React, {createContext, useContext, useState, useEffect} from "react";
import {ThemeProvider as StyledThemeProvider} from "styled-components";
import {tokens} from "../theme/tokens";
import {GlobalStyle} from "../theme/GlobalStyle";
import {GlobalFonts} from "../theme/GlobalFonts";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                           children,
                                                                       }) => {
    const [theme, setTheme] = useState<Theme>("dark");

    useEffect(() => {
        const saved = localStorage.getItem("theme") as Theme | null;
        if (saved) setTheme(saved);
    }, []);

    useEffect(() => {
        document.body.classList.remove("theme-light", "theme-dark");
        document.body.classList.add(`theme-${theme}`);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () =>
        setTheme((prev) => (prev === "light" ? "dark" : "light"));

    const currentTheme = {
        mode: theme,
        colors: tokens.colors[theme], // ✅ This now references alias tokens
        widths: tokens.widths,
        heights: tokens.heights,
        spacing: tokens.spacing,
        padding: tokens.padding,
        paddingX: tokens.paddingX,
        paddingY: tokens.paddingY,
        radius: tokens.radius,
        typography: tokens.typography,
        components: tokens.components,
        animation: tokens.animation,
        primitives: tokens.primitives, // ✅ Optional: expose primitives if needed
    };

    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            <StyledThemeProvider theme={currentTheme}>
                <GlobalFonts/>

                <GlobalStyle/>
                {children}
            </StyledThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
    return ctx;
};
