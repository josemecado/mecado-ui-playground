// src/theme/GlobalStyle.ts
import { createGlobalStyle } from "styled-components";
import { tokens } from "./tokens";

export const GlobalStyle = createGlobalStyle`
  :root {
    font-size: 16px; /* 👈 establishes 1rem = 16px */

    /* Generate CSS variables from light theme alias tokens */
    ${Object.entries(tokens.colors.light)
      .map(([key, val]) => `--${key}: ${val};`)
      .join("\n    ")}
  }

  @media (max-width: 768px) {
    :root {
      font-size: 15px;
    }
  }

  @media (max-width: 480px) {
    :root {
      font-size: 14px;
    }
  }

  /* Dark theme overrides */
  body.theme-dark {
    ${Object.entries(tokens.colors.dark)
      .map(([key, val]) => `--${key}: ${val};`)
      .join("\n    ")}
  }

  body {
    background-color: var(--backgroundPrimary);
    color: var(--textPrimary);
    font-family: ${tokens.typography.family.base};
    margin: 0;
    -webkit-font-smoothing: antialiased;
  }
`;