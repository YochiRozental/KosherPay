import type { SxProps, Theme } from "@mui/material/styles";

export const colors = {
  primary: "#173C6C",
  primaryHover: "#102B4F",
  accent: "#173C6C",
  accentSoft: "rgba(23, 60, 108, 0.08)",
  gold: "#C6A75C",
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#DC2626",
  dangerText: "#B91C1C",
  background: "#FFFFFF",
  surface: "#FFFFFF",
  inputBg: "#FFFFFF",
  border: "#173C6C",
  textPrimary: "#0F2440",
  textSecondary: "#40597E",
  muted: "#8298B5",
};

export const radius = {
  button: "12px",
  input: "12px",
  card: "20px",
  dialog: "24px",
};

export const shadows = {
  sm: "0 1px 2px rgba(15, 23, 42, 0.06)",
  md: "0 4px 12px rgba(15, 23, 42, 0.10)",
  lg: "0 12px 32px rgba(15, 23, 42, 0.16)",
};

export const focusRing = "0 0 0 4px rgba(23, 60, 108, 0.16)";

export const pageBackground = "#FFFFFF";

export const headerGradient =
  "linear-gradient(135deg, #173C6C 0%, #102B4F 100%)";

export const cardSx: SxProps<Theme> = {
  bgcolor: colors.surface,
  borderRadius: radius.card,
  border: `1px solid ${colors.border}`,
  boxShadow: shadows.md,
};

export const textFieldSx: SxProps<Theme> = {
  "& .MuiOutlinedInput-root": {
    borderRadius: radius.input,
    backgroundColor: colors.inputBg,
    color: colors.textPrimary,
    transition: "box-shadow 200ms ease, background-color 200ms ease",
    "& fieldset": {
      borderColor: colors.border,
      transition: "border-color 200ms ease",
    },
    "&:hover:not(.Mui-disabled) fieldset": { borderColor: colors.primaryHover },
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
  },
  "& .MuiOutlinedInput-input.Mui-disabled": {
    WebkitTextFillColor: colors.textSecondary,
  },
  "& input:-webkit-autofill": {
    WebkitBoxShadow: `0 0 0 100px ${colors.inputBg} inset`,
    WebkitTextFillColor: colors.textPrimary,
    caretColor: colors.textPrimary,
    borderRadius: radius.input,
  },
  "& .MuiInputLabel-root": {
    color: colors.textSecondary,
    "&.Mui-focused": { color: colors.primary },
    "&.Mui-error": { color: colors.dangerText },
    "&.Mui-disabled": { color: colors.muted },
  },
  "& .MuiFormHelperText-root": {
    fontSize: 12,
    mx: 0.5,
    color: colors.muted,
    "&.Mui-error": { color: colors.dangerText },
  },
};

const buttonBaseSx = {
  borderRadius: radius.button,
  textTransform: "none" as const,
  fontSize: 16,
  fontWeight: 600,
  minHeight: 48,
  px: 3,
  transition: "background-color 200ms ease, box-shadow 200ms ease, border-color 200ms ease",
  "&.Mui-focusVisible": { boxShadow: focusRing },
};

export const primaryButtonSx: SxProps<Theme> = {
  ...buttonBaseSx,
  bgcolor: colors.primary,
  color: "#FFFFFF",
  boxShadow: shadows.sm,
  "&:hover": { bgcolor: colors.primaryHover, boxShadow: shadows.md },
  "&:active": { bgcolor: colors.primaryHover },
  "&.Mui-disabled": { bgcolor: "#B9C7DB", color: "#FFFFFF" },
};

export const accentButtonSx: SxProps<Theme> = primaryButtonSx;

export const outlinedButtonSx: SxProps<Theme> = {
  ...buttonBaseSx,
  color: colors.primary,
  bgcolor: "transparent",
  border: `1px solid ${colors.border}`,
  "&:hover": {
    bgcolor: colors.accentSoft,
    borderColor: colors.primaryHover,
  },
};

export const ghostButtonSx: SxProps<Theme> = {
  ...buttonBaseSx,
  color: colors.textSecondary,
  "&:hover": { bgcolor: colors.accentSoft, color: colors.primary },
};
