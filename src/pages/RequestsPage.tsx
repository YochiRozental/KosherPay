import { Payment } from "@mui/icons-material";
import { Box } from "@mui/material";

import PaymentRequestsList from "../components/dashboard/PaymentRequests";
import PageHeader from "../components/layout/PageHeader";
import { colors } from "../theme/designTokens";

import type { UserMe } from "../types/index";

export default function RequestsPage({ user }: { user: UserMe; onLogout: () => void }) {
  return (
    <Box sx={{ direction: "rtl", maxWidth: 1140, mx: "auto", py: { xs: 0.5, sm: 1 } }}>
      <PageHeader
        icon={<Payment sx={{ color: colors.gold, fontSize: 26 }} />}
        title="בקשות תשלום שקיבלתי"
        subtitle="אישור או דחייה של בקשות שממתינות לך — הכל במקום אחד"
      />

      <PaymentRequestsList user={user} />
    </Box>
  );
}
