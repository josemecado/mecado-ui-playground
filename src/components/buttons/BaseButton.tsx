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

    padding-left: ${({theme}) => theme.components.button.paddingX};
    padding-right: ${({theme}) => theme.components.button.paddingX};
    padding-top: ${({theme}) => theme.components.button.paddingY};
    padding-bottom: ${({theme}) => theme.components.button.paddingY};
    border-radius: ${(p) =>
            p.$variant === "pill"
                    ? p.theme.radius.pill
                    : p.theme.components.button.radius};
    border: 1px solid ${(p) => {
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
    font-size: ${({theme}) => theme.components.button.fontSize};
    font-weight: ${({theme}) => theme.components.button.fontWeight};
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
                return p.theme.colors.brandPrimary;
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
        color: ${(p) => p.theme.colors.textMuted};
        border-color: ${(p) => p.theme.colors.borderSubtle};
    }
`;
