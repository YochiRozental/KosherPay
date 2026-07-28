import { heIL } from "@mui/material/locale";
import { createTheme, lighten } from "@mui/material/styles";

import {
    colors,
    focusRing,
    pageBackground,
    radius,
    shadows,
} from "./designTokens";

const theme = createTheme(
    {
        direction: "rtl",
        typography: {
            fontFamily: `'Assistant', 'Arial', sans-serif`,
            button: { textTransform: "none", fontWeight: 600 },
            h4: { fontWeight: 700 },
            h5: { fontWeight: 700 },
            h6: { fontWeight: 600 },
        },
        palette: {
            primary: { main: colors.primary, dark: colors.primaryHover },
            secondary: { main: colors.danger },
            error: { main: colors.danger },
            success: { main: colors.success },
            warning: { main: colors.warning },
            text: { primary: colors.textPrimary, secondary: colors.textSecondary },
            divider: "rgba(23, 60, 108, 0.14)",
            background: { default: pageBackground, paper: colors.surface },
        },

        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: radius.button,
                        transition:
                            "background-color 200ms ease, box-shadow 200ms ease, border-color 200ms ease, color 200ms ease",
                        "&.Mui-focusVisible": { boxShadow: focusRing },
                    },
                    sizeLarge: {
                        minHeight: 48,
                        fontSize: 16,
                        paddingLeft: 24,
                        paddingRight: 24,
                    },
                    contained: ({ theme, ownerState }) => {
                        const isPaletteColor = ownerState.color !== 'inherit' && ownerState.color;

                        if (isPaletteColor && ownerState.disabled) {
                            const mainColor = theme.palette[isPaletteColor].main;

                            return {
                                backgroundColor: lighten(mainColor, 0.6),
                                color: `${mainColor} !important` as any,
                                "&:hover": {
                                    backgroundColor: lighten(mainColor, 0.6),
                                },
                            };
                        }
                        return {
                            boxShadow: shadows.sm,
                            "&:hover": { boxShadow: shadows.md },
                        };
                    },
                    outlinedPrimary: {
                        borderColor: colors.border,
                        "&:hover": {
                            backgroundColor: colors.accentSoft,
                            borderColor: colors.primaryHover,
                        },
                    },
                    textPrimary: {
                        "&:hover": { backgroundColor: colors.accentSoft },
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: radius.input,
                        backgroundColor: colors.inputBg,
                        color: colors.textPrimary,
                        transition: "box-shadow 200ms ease, background-color 200ms ease",
                        "& fieldset": {
                            borderColor: colors.border,
                            transition: "border-color 200ms ease",
                        },
                        "&:hover:not(.Mui-disabled) fieldset": {
                            borderColor: colors.primaryHover,
                        },
                        "&.Mui-focused": { boxShadow: focusRing },
                        "&.Mui-focused fieldset": {
                            borderColor: colors.primary,
                            borderWidth: "1.5px",
                        },
                        "&.Mui-error.Mui-focused": {
                            boxShadow: "0 0 0 4px rgba(220, 38, 38, 0.12)",
                        },
                        "&.Mui-error fieldset": { borderColor: colors.danger },
                        "&.Mui-disabled": { backgroundColor: "#F1F5F9" },
                        "&.Mui-disabled fieldset": { borderColor: colors.border },
                        "& input:-webkit-autofill": {
                            WebkitBoxShadow: `0 0 0 100px ${colors.inputBg} inset`,
                            WebkitTextFillColor: colors.textPrimary,
                            caretColor: colors.textPrimary,
                            borderRadius: radius.input,
                        },
                    },
                    input: {
                        "&.Mui-disabled": {
                            WebkitTextFillColor: colors.textSecondary,
                        },
                    },
                },
            },
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        color: colors.textSecondary,
                        "&.Mui-focused": { color: colors.primary },
                        "&.Mui-error": { color: colors.dangerText },
                        "&.Mui-disabled": { color: colors.muted },
                    },
                },
            },
            MuiFormHelperText: {
                styleOverrides: {
                    root: {
                        fontSize: 12,
                        marginLeft: 4,
                        marginRight: 4,
                        color: colors.muted,
                        "&.Mui-error": { color: colors.dangerText },
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    rounded: { borderRadius: radius.button },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: { borderRadius: radius.dialog },
                },
            },
            MuiTextField: {
                defaultProps: {
                    slotProps: {
                        htmlInput: {
                            step: 50,
                            dir: "ltr",
                            style: { textAlign: "right" },
                        },
                    },
                },
                styleOverrides: {
                    root: {
                        "& input[type=number]": {
                            direction: "ltr",
                            textAlign: "right",
                        },
                    },
                },
            },
        },
    },
    heIL
);

export default theme;
