// src/theme/GlobalFonts.ts
import { createGlobalStyle } from "styled-components";

/**
 * Registers local font files (WOFF2) for use across the app.
 * Paths are relative to this file: src/theme → src/assets/fonts
 */
export const GlobalFonts = createGlobalStyle`
    /* ================================
       Antarctica Condensed (Sans)
       Weights: 400 / 500 (Medium) / 600 (SemiBold)
       ================================ */
    @font-face {
        font-family: "Antarctica Condensed";
        src: url("../assets/fonts/Antarctica-Condensed.woff2") format("woff2");
        font-weight: 400;
        font-style: normal;
        font-display: swap;
    }

    @font-face {
        font-family: "Antarctica Condensed";
        src: url("../assets/fonts/Antarctica-CondensedMedium.woff2") format("woff2");
        font-weight: 500;
        font-style: normal;
        font-display: swap;
    }

    @font-face {
        font-family: "Antarctica Condensed";
        src: url("../assets/fonts/Antarctica-CondensedSemiBold.woff2") format("woff2");
        font-weight: 600;
        font-style: normal;
        font-display: swap;
    }

    /* ================================
       JHA Times Now (Serif)
       Weight: 300 (SemiLight) + Italic
       ================================ */
    @font-face {
        font-family: "JHA Times Now";
        src: url("../assets/fonts/JHA_Times_Now_SemiLight.woff2") format("woff2");
        font-weight: 300; /* SemiLight */
        font-style: normal;
        font-display: swap;
    }

    @font-face {
        font-family: "JHA Times Now";
        src: url("../assets/fonts/JHA_Times_Now_SemiLight_Italic.woff2") format("woff2");
        font-weight: 300; /* SemiLight */
        font-style: italic;
        font-display: swap;
    }
`;
