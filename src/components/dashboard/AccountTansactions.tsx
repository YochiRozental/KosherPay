import { useState } from "react";
import type { ReactNode } from "react";

import {
    AccountBalanceOutlined,
    PaymentsOutlined,
    RequestQuoteOutlined,
    SwapHorizRounded,
} from "@mui/icons-material";
import {
    Box,
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Paper,
    Typography
} from "@mui/material";

import { colors, radius, shadows } from "../../theme/designTokens";

import type { UserMe } from "../../types";

const formatILS = (raw: string) => {
    const n = +raw;
    if (!Number.isFinite(n)) return raw;
    return n.toLocaleString("he-IL", {
        style: "currency",
        currency: "ILS",
        minimumFractionDigits: 2,
    });
};

interface ActionCardProps {
    title: string;
    caption: string;
    icon: ReactNode;
    iconBg: string;
    children: ReactNode;
}

function ActionCard({ title, caption, icon, iconBg, children }: ActionCardProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                borderRadius: radius.card,
                border: `1px solid ${colors.border}`,
                boxShadow: shadows.sm,
                bgcolor: colors.surface,
                transition: "box-shadow 200ms ease, transform 200ms ease",
                "&:hover": { boxShadow: shadows.md, transform: "translateY(-2px)" },
            }}
        >
            <Stack direction="row" alignItems="center" sx={{ gap: 1.5, mb: 2.5 }}>
                <Box
                    sx={{
                        width: 44,
                        height: 44,
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
                <Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>
                        {title}
                    </Typography>
                    <Typography sx={{ fontSize: 12.5, color: colors.textSecondary }}>
                        {caption}
                    </Typography>
                </Box>
            </Stack>
            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                {children}
            </Box>
        </Paper>
    );
}

interface ActionsSectionProps {
    user: UserMe;
    onApiCall: (apiFunc: () => Promise<any>) => Promise<void>;
    isLoading: boolean;
}

export default function ActionsSection({ onApiCall, isLoading }: ActionsSectionProps) {
    const [depositAmount, setDepositAmount] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [transferDetails, setTransferDetails] = useState({ recipient: "", amount: "" });
    const [paymentRequest, setPaymentRequest] = useState({ phone: "", amount: "" });
    const [confirmAction, setConfirmAction] = useState<"withdraw" | "transfer" | null>(null);

    const handleApiCall = (action: 'deposit' | 'withdraw' | 'transfer' | 'request') => {
        let amount: number;

        const apiPromise = import("../../api/paymentsApi").then(api => {
            switch (action) {
                case 'deposit':
                    amount = +depositAmount;
                    return () => api.depositFunds(amount);
                case 'withdraw':
                    amount = +withdrawAmount;
                    return () => api.withdrawFunds(amount);
                case 'transfer':
                    amount = +transferDetails.amount;
                    return () => api.transferFunds(transferDetails.recipient, amount);
                case 'request':
                    amount = +paymentRequest.amount;
                    return () => api.requestPayment(paymentRequest.phone, amount);
                default:
                    return () => Promise.reject(new Error("Unknown action"));
            }
        });

        onApiCall(async () => {
            const finalApiFunc = await apiPromise;
            const result = await finalApiFunc();

            switch (action) {
                case 'deposit':
                    setDepositAmount("");
                    break;
                case 'withdraw':
                    setWithdrawAmount("");
                    break;
                case 'transfer':
                    setTransferDetails({ recipient: "", amount: "" });
                    break;
                case 'request':
                    setPaymentRequest({ phone: "", amount: "" });
                    break;
            }

            return result;
        });
    };


    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: 3,
                direction: "rtl",
            }}
        >

            <ActionCard
                title="הפקדה"
                caption="הוספת כספים ליתרה הזמינה בחשבון"
                icon={<AccountBalanceOutlined sx={{ color: colors.primary, fontSize: 22 }} />}
                iconBg={colors.accentSoft}
            >
                <Stack spacing={2}>
                    <TextField
                        type="number"
                        label="סכום להפקדה"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        slotProps={{ input: { inputProps: { min: 0 } } }}
                    />
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => handleApiCall('deposit')}
                        disabled={!depositAmount || +depositAmount <= 0 || isLoading}
                    >
                        הפקד
                    </Button>
                </Stack>
            </ActionCard>

            <ActionCard
                title="משיכה"
                caption="משיכת כספים מהיתרה הזמינה"
                icon={<PaymentsOutlined sx={{ color: colors.dangerText, fontSize: 22 }} />}
                iconBg="rgba(220, 38, 38, 0.10)"
            >
                <Stack spacing={2}>
                    <TextField
                        type="number"
                        label="סכום למשיכה"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        slotProps={{ input: { inputProps: { min: 0 } } }}
                    />
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        onClick={() => setConfirmAction('withdraw')}
                        disabled={!withdrawAmount || +withdrawAmount <= 0 || isLoading}
                    >
                        משוך
                    </Button>
                </Stack>
            </ActionCard>

            <ActionCard
                title="העברה"
                caption="העברת כספים למשתמש אחר לפי מספר טלפון"
                icon={<SwapHorizRounded sx={{ color: "#15803D", fontSize: 22 }} />}
                iconBg="rgba(22, 163, 74, 0.12)"
            >
                <Stack spacing={2}>
                    <TextField
                        label="טלפון יעד"
                        value={transferDetails.recipient}
                        onChange={(e) => setTransferDetails({ ...transferDetails, recipient: e.target.value })}
                    />
                    <TextField
                        type="number"
                        label="סכום"
                        value={transferDetails.amount}
                        onChange={(e) => setTransferDetails({ ...transferDetails, amount: e.target.value })}
                        slotProps={{ input: { inputProps: { min: 0 } } }}
                    />
                    <Button
                        variant="contained"
                        color="success"
                        size="large"
                        onClick={() => setConfirmAction('transfer')}
                        disabled={!transferDetails.recipient || !transferDetails.amount || +transferDetails.amount <= 0 || isLoading}
                        sx={{ color: "#FFFFFF" }}
                    >
                        העבר
                    </Button>
                </Stack>
            </ActionCard>

            <ActionCard
                title="בקשת תשלום"
                caption="שליחת בקשת תשלום למשתמש אחר"
                icon={<RequestQuoteOutlined sx={{ color: "#B45309", fontSize: 22 }} />}
                iconBg="rgba(245, 158, 11, 0.12)"
            >
                <Stack spacing={2}>
                    <TextField
                        label="טלפון מבוקש"
                        value={paymentRequest.phone}
                        onChange={(e) => setPaymentRequest({ ...paymentRequest, phone: e.target.value })}
                    />
                    <TextField
                        type="number"
                        label="סכום"
                        value={paymentRequest.amount}
                        onChange={(e) => setPaymentRequest({ ...paymentRequest, amount: e.target.value })}
                        slotProps={{ input: { inputProps: { min: 0 } } }}
                    />
                    <Button
                        variant="contained"
                        color="warning"
                        size="large"
                        onClick={() => handleApiCall('request')}
                        disabled={!paymentRequest.phone || !paymentRequest.amount || +paymentRequest.amount <= 0 || isLoading}
                        sx={{ color: "#FFFFFF" }}
                    >
                        בקש תשלום
                    </Button>
                </Stack>
            </ActionCard>

            <Dialog
                open={confirmAction !== null}
                onClose={() => setConfirmAction(null)}
                maxWidth="xs"
                fullWidth
                dir="rtl"
                aria-labelledby="confirm-action-title"
            >
                <DialogTitle
                    id="confirm-action-title"
                    sx={{ fontWeight: 700, color: colors.textPrimary, pb: 1 }}
                >
                    {confirmAction === 'withdraw' ? 'אישור משיכה' : 'אישור העברה'}
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: 14.5, color: colors.textSecondary, mb: 2 }}>
                        {confirmAction === 'withdraw'
                            ? 'אנא אשרו את פרטי המשיכה לפני הביצוע:'
                            : 'אנא אשרו את פרטי ההעברה לפני הביצוע:'}
                    </Typography>
                    <Stack
                        sx={{
                            gap: 1,
                            p: 2,
                            borderRadius: radius.input,
                            bgcolor: colors.accentSoft,
                        }}
                    >
                        <Stack direction="row" justifyContent="space-between">
                            <Typography sx={{ fontSize: 14, color: colors.textSecondary }}>
                                סכום
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: 15,
                                    fontWeight: 700,
                                    color: colors.primary,
                                    fontVariantNumeric: "tabular-nums",
                                }}
                            >
                                {formatILS(
                                    confirmAction === 'withdraw'
                                        ? withdrawAmount
                                        : transferDetails.amount
                                )}
                            </Typography>
                        </Stack>
                        {confirmAction === 'transfer' && (
                            <Stack direction="row" justifyContent="space-between">
                                <Typography sx={{ fontSize: 14, color: colors.textSecondary }}>
                                    טלפון יעד
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: 15,
                                        fontWeight: 700,
                                        color: colors.textPrimary,
                                        direction: "ltr",
                                        fontVariantNumeric: "tabular-nums",
                                    }}
                                >
                                    {transferDetails.recipient}
                                </Typography>
                            </Stack>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 1.5, gap: 1 }}>
                    <Button variant="outlined" onClick={() => setConfirmAction(null)}>
                        ביטול
                    </Button>
                    <Button
                        variant="contained"
                        color={confirmAction === 'withdraw' ? 'secondary' : 'success'}
                        disabled={isLoading}
                        onClick={() => {
                            const action = confirmAction;
                            setConfirmAction(null);
                            if (action) handleApiCall(action);
                        }}
                        sx={confirmAction === 'transfer' ? { color: "#FFFFFF" } : undefined}
                    >
                        {confirmAction === 'withdraw' ? 'אישור משיכה' : 'אישור העברה'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
