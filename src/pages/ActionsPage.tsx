import { useState } from "react";

import { SettingsSuggest } from "@mui/icons-material";
import { Box, Alert, Snackbar } from "@mui/material";

import ActionsSection from "../components/dashboard/AccountTansactions";
import PageHeader from "../components/layout/PageHeader";
import { colors, radius } from "../theme/designTokens";

import type { UserMe } from "../types";

export default function ActionsPage({ user }: { user: UserMe; onLogout: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" | "info" }>({
        open: false,
        message: "",
        severity: "info",
    });

    const handleApiCall = async (apiFunc: () => Promise<any>): Promise<void> => {
        setIsLoading(true);
        try {
            const res = await apiFunc();
            if (res && res.success) {
                try {
                    const { getBalance } = await import("../api/paymentsApi");
                    await getBalance();
                } catch { }

                setSnackbar({
                    open: true,
                    message: "הפעולה בוצעה בהצלחה! היתרה עודכנה.",
                    severity: "success",
                });

            } else {

                setSnackbar({ open: true, message: res?.message || "שגיאה בביצוע הפעולה.", severity: "error" });
            }
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: "שגיאת רשת. נסה שוב מאוחר יותר.", severity: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box sx={{ direction: "rtl", maxWidth: 1140, mx: "auto", py: { xs: 0.5, sm: 1 } }}>
            <PageHeader
                icon={<SettingsSuggest sx={{ color: colors.gold, fontSize: 26 }} />}
                title="פעולות בחשבון"
                subtitle="הפקדה, משיכה, העברה ובקשות תשלום — הכל במקום אחד מאובטח"
            />

            <ActionsSection
                user={user}
                onApiCall={handleApiCall}
                isLoading={isLoading}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%', borderRadius: radius.button, fontWeight: 600 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
