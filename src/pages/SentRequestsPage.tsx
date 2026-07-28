import { Send } from "@mui/icons-material";
import { Box } from "@mui/material";

import SentPaymentRequests from "../components/dashboard/SentPaymentRequests";
import PageHeader from "../components/layout/PageHeader";
import { colors } from "../theme/designTokens";

import type { UserMe } from "../types";

interface SentRequestsPageProps {
  user: UserMe;
  onLogout: () => void;
}

export default function SentRequestsPage({ user }: SentRequestsPageProps) {
  return (
    <Box sx={{ direction: "rtl", maxWidth: 1140, mx: "auto", py: { xs: 0.5, sm: 1 } }}>
      <PageHeader
        icon={<Send sx={{ color: colors.gold, fontSize: 26 }} />}
        title="בקשות תשלום ששלחתי"
        subtitle="מעקב שוטף אחר הסטטוס של כל בקשה ששלחת"
      />

      <SentPaymentRequests user={user} />
    </Box>
  );
}
