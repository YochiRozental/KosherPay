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

// Field and button styling now lives in the MUI theme (src/theme/theme.ts):
// use <TextField> as-is, <Button variant="contained" | "outlined" | "text" size="large">.
