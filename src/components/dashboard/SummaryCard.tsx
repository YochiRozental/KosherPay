import type { ReactNode } from "react";

import { Box, Paper, Skeleton, Stack, Typography } from "@mui/material";

import { colors, headerGradient, radius, shadows } from "../../theme/designTokens";


export const summaryGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, 1fr)",
    lg: "repeat(4, 1fr)",
  },
  gap: 2,
  mb: 3,
};

interface SummaryCardProps {
  label: string;
  value: string;
  caption: string;
  icon: ReactNode;
  iconBg: string;
  featured?: boolean;
  loading?: boolean;
}

export default function SummaryCard({
  label,
  value,
  caption,
  icon,
  iconBg,
  featured,
  loading,
}: SummaryCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: radius.card,
        border: `1px solid ${colors.border}`,
        boxShadow: shadows.sm,
        ...(featured ? { background: headerGradient } : { bgcolor: colors.surface }),
        transition: "box-shadow 200ms ease, transform 200ms ease",
        "&:hover": { boxShadow: shadows.md, transform: "translateY(-2px)" },
      }}
    >
      <Stack direction="row" justifyContent="space-between" sx={{ gap: 1.5 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 12.5,
              fontWeight: 600,
              letterSpacing: "0.02em",
              color: featured ? "rgba(248, 250, 252, 0.72)" : colors.textSecondary,
            }}
          >
            {label}
          </Typography>
          {loading ? (
            <Skeleton width={110} height={38} />
          ) : (
            <Typography
              sx={{
                fontSize: { xs: 24, lg: 26 },
                fontWeight: 800,
                lineHeight: 1.35,
                fontVariantNumeric: "tabular-nums",
                color: featured ? "#FFFFFF" : colors.textPrimary,
                whiteSpace: "nowrap",
              }}
            >
              {value}
            </Typography>
          )}
          <Typography
            sx={{
              fontSize: 12,
              color: featured ? "rgba(248, 250, 252, 0.6)" : colors.muted,
            }}
          >
            {caption}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 42,
            height: 42,
            flexShrink: 0,
            borderRadius: "12px",
            bgcolor: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}
