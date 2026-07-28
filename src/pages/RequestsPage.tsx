import { Payment, VerifiedUserOutlined } from "@mui/icons-material";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";

import PaymentRequestsList from "../components/dashboard/PaymentRequests";
import {
  colors,
  headerGradient,
  radius,
  shadows,
} from "../theme/designTokens";

import type { UserMe } from "../types/index";

export default function RequestsPage({ user }: { user: UserMe; onLogout: () => void }) {
  return (
    <Box sx={{ direction: "rtl", maxWidth: 1140, mx: "auto", py: { xs: 0.5, sm: 1 } }}>
      <Paper
        elevation={0}
        component="header"
        sx={{
          borderRadius: radius.card,
          background: headerGradient,
          border: `1px solid ${colors.border}`,
          boxShadow: shadows.md,
          p: { xs: 3, sm: 4 },
          mb: 3,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          sx={{ gap: 2.5 }}
        >
          <Stack direction="row" alignItems="center" sx={{ gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                flexShrink: 0,
                borderRadius: "14px",
                bgcolor: "rgba(255, 255, 255, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Payment sx={{ color: colors.gold, fontSize: 26 }} />
            </Box>
            <Box>
              <Typography
                component="h1"
                sx={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  lineHeight: 1.3,
                }}
              >
                בקשות תשלום שקיבלתי
              </Typography>
              <Typography sx={{ fontSize: 14, color: "rgba(248, 250, 252, 0.72)" }}>
                אישור או דחייה של בקשות שממתינות לך — הכל במקום אחד
              </Typography>
            </Box>
          </Stack>

          <Chip
            icon={<VerifiedUserOutlined sx={{ fontSize: 16 }} />}
            label="חיבור מאובטח"
            size="small"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.14)",
              color: "#FFFFFF",
              fontWeight: 600,
              pr: 1,
              "& .MuiChip-icon": { color: colors.gold, mr: "2px", ml: "-6px" },
            }}
          />
        </Stack>
      </Paper>

      <PaymentRequestsList user={user} />
    </Box>
  );
}
