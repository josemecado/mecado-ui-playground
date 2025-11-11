// src/theme/GlobalStyle.ts
import { createGlobalStyle } from "styled-components";
import { tokens } from "./tokens";

export const GlobalStyle = createGlobalStyle`
    /* ======================================================================== */
    /* 1. CSS VARIABLE & THEME SETUP                                            */
    /* ======================================================================== */
    :root {
        font-size: 16px; /* 👈 establishes 1rem = 16px */
        
        /* Generate CSS variables from light theme alias tokens */
        ${Object.entries(tokens.colors.light)
    .map(([key, val]) => `--${key}: ${val};`)
    .join("\n    ")}
    }

    /* Responsive Font Sizing */
    @media (max-width: 768px) {
        :root { font-size: 15px; }
    }

    @media (max-width: 480px) {
        :root { font-size: 14px; }
    }

    /* Dark theme overrides */
    body.theme-dark {
        ${Object.entries(tokens.colors.dark)
    .map(([key, val]) => `--${key}: ${val};`)
    .join("\n    ")}
    }
    
    /* ======================================================================== */
    /* 2. MODERN CSS RESET & NORMALIZATION                                      */
    /* ======================================================================== */

    /* 2.1. Standardize Box Sizing */
    *,
    *::before,
    *::after {
        box-sizing: border-box; /* Makes padding and border included in the element's total width and height */
    }

    /* 2.2. Remove default margin and padding */
    body,
    h1, h2, h3, h4, h5, h6,
    p, blockquote, figure,
    ul, ol, dd {
        margin: 0;
        padding: 0;
    }
    
    /* 2.3. Base Body/Page Styles */
    body {
        /* Styled-components Theme for background-color */
        background-color: ${({ theme }) => theme.colors.backgroundPrimary};
        
        /* CSS Variable for foreground color */
        color: ${({ theme }) => theme.colors.textPrimary}; 
        
        /* Typography from tokens */
        font-family: ${tokens.typography.family.base};
        font-size: ${tokens.typography.size.md}; /* Sets base font size for the <body> to 1rem (16px) */
        line-height: 1.5; /* Default line height */
        
        /* Accessibility */
        -webkit-font-smoothing: antialiased;
        min-height: 100vh; /* Ensures body takes full height of viewport */
    }
    
    input, button, textarea, select {
        font: inherit; /* Inherit font styles for consistent look */
    }

    /* 2.5. Remove list styles from lists where applied */
    ul, ol {
        list-style: none;
    }
    
    /* 2.6. Reset Anchor element behavior */
    a {
        text-decoration: none;
        color: inherit; /* Inherit color unless explicitly styled */
    }

    /* 2.7. Prevent text overflow on block elements */
    p, h1, h2, h3, h4, h5, h6 {
        overflow-wrap: break-word;
    }
    
    /* 2.8. Remove default button styles */
    button {
        background: none;
        border: none;
        cursor: pointer;
    }
`;