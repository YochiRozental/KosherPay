import { History as HistoryIcon } from "@mui/icons-material";
import { Box } from "@mui/material";

import TransactionHistory from "../components/dashboard/TransactionHistory";
import PageHeader from "../components/layout/PageHeader";
import { colors } from "../theme/designTokens";

import type { UserMe } from "../types/index";

export default function HistoryPage({ user }: { user: UserMe; onLogout: () => void }) {
  return (
    <Box sx={{ direction: "rtl", maxWidth: 1140, mx: "auto", py: { xs: 0.5, sm: 1 } }}>
      <PageHeader
        icon={<HistoryIcon sx={{ color: colors.gold, fontSize: 26 }} />}
        title="היסטוריית פעולות"
        subtitle="תיעוד מלא ושקוף של כל התנועות בחשבון שלך"
      />

      <TransactionHistory user={user} />
    </Box>
  );
}
