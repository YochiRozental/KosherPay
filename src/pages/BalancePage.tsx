import { useEffect, useState } from "react";

import {
    AccountBalanceWallet,
    ErrorOutline,
    ReceiptLongOutlined,
    RefreshRounded,
    TrendingDownRounded,
    TrendingUpRounded,
    VerifiedUserOutlined,
} from "@mui/icons-material";
import {
    Box,
    Chip,
    IconButton,
    Paper,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";
import dayjs from "dayjs";

import * as api from "../api/paymentsApi";
import SummaryCard, { summaryGridSx } from "../components/dashboard/SummaryCard";
import PageHeader from "../components/layout/PageHeader";
import {
    colors,
    headerGradient,
    radius,
    shadows,
} from "../theme/designTokens";

import type { UserMe } from "../types";

const formatILS = (n: number) =>
    n.toLocaleString("he-IL", {
        style: "currency",
        currency: "ILS",
        minimumFractionDigits: 2,
    });

const parseAmount = (raw: unknown) => {
    const n = parseFloat(String(raw ?? "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? Math.abs(n) : 0;
};

const classifyFlow = (actionType: unknown): "credit" | "debit" | "other" => {
    const t = String(actionType ?? "").toLowerCase();
    if (t.includes("deposit") || t.includes("received")) return "credit";
    if (t.includes("withdraw") || t.includes("transfer") || t.includes("payment"))
        return "debit";
    return "other";
};

interface MonthlyInsights {
    income: number;
    expenses: number;
    count: number;
}

export default function BalancePage({ user }: { user: UserMe; onLogout: () => void }) {
    const [balance, setBalance] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const [insights, setInsights] = useState<MonthlyInsights | null>(null);
    const [insightsLoading, setInsightsLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const loadBalance = async () => {
            setIsLoading(true);
            setError(null);
            setBalance(null);
            try {
                const res = await api.getBalance();
                setBalance(Number(res.balance) || 0);
                setLastUpdated(new Date());
            } catch (err) {
                console.error("שגיאה בטעינת יתרה:", err);
                setError("אירעה שגיאה בטעינת היתרה.");
            } finally {
                setIsLoading(false);
            }
        };
        loadBalance();
    }, [user.phone, user.id, refreshKey]);

    useEffect(() => {
        let active = true;
        setInsightsLoading(true);
        api
            .getHistory()
            .then((res) => {
                if (!active) return;
                const rows = Array.isArray((res as any).history)
                    ? (res as any).history
                    : [];
                const monthStart = dayjs().startOf("month");
                let income = 0;
                let expenses = 0;
                let count = 0;
                rows.forEach((tx: any) => {
                    const date = dayjs(
                        tx?.transaction_date ?? tx?.created_at ?? tx?.date ?? tx?.timestamp
                    );
                    if (!date.isValid() || date.isBefore(monthStart)) return;
                    count += 1;
                    const amount = parseAmount(tx?.amount ?? tx?.sum ?? tx?.value);
                    const flow = classifyFlow(
                        tx?.action_type ?? tx?.type ?? tx?.action ?? tx?.tx_type
                    );
                    if (flow === "credit") income += amount;
                    else if (flow === "debit") expenses += amount;
                });
                setInsights({ income, expenses, count });
            })
            .catch(() => {
                if (active) setInsights(null);
            })
            .finally(() => {
                if (active) setInsightsLoading(false);
            });
        return () => {
            active = false;
        };
    }, [user.phone, user.id, refreshKey]);

    return (
        <Box sx={{ direction: "rtl", maxWidth: 1140, mx: "auto", py: { xs: 0.5, sm: 1 } }}>
            <PageHeader
                icon={<AccountBalanceWallet sx={{ color: colors.gold, fontSize: 26 }} />}
                title="יתרה נוכחית"
                subtitle="תמונת מצב פיננסית מלאה ומעודכנת של החשבון שלך"
            />

            {isLoading && (
                <>
                    <Skeleton
                        variant="rounded"
                        height={168}
                        sx={{ borderRadius: radius.card, mb: 3 }}
                    />
                    <Box sx={summaryGridSx}>
                        {[0, 1, 2, 3].map((i) => (
                            <Skeleton
                                key={i}
                                variant="rounded"
                                height={116}
                                sx={{ borderRadius: radius.card }}
                            />
                        ))}
                    </Box>
                </>
            )}

            {!isLoading && error && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        textAlign: "center",
                        borderRadius: radius.card,
                        border: "1px solid rgba(220, 38, 38, 0.35)",
                        bgcolor: "rgba(220, 38, 38, 0.04)",
                    }}
                >
                    <ErrorOutline sx={{ fontSize: 40, color: colors.danger, mb: 1 }} />
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: colors.dangerText }}>
                        {error}
                    </Typography>
                    <Typography sx={{ fontSize: 13.5, color: colors.textSecondary, mt: 0.5 }}>
                        נסו לרענן את הדף או לחזור מאוחר יותר
                    </Typography>
                </Paper>
            )}

            {!isLoading && !error && balance !== null && (
                <>
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: radius.card,
                            background: headerGradient,
                            border: `1px solid ${colors.border}`,
                            boxShadow: shadows.md,
                            p: { xs: 3, sm: 4 },
                            mb: 3,
                            transition: "box-shadow 200ms ease",
                            "&:hover": { boxShadow: shadows.lg },
                        }}
                    >
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", sm: "center" }}
                            sx={{ gap: 3 }}
                        >
                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        letterSpacing: "0.02em",
                                        color: "rgba(248, 250, 252, 0.72)",
                                    }}
                                >
                                    היתרה הזמינה שלך
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: { xs: 36, sm: 44 },
                                        fontWeight: 800,
                                        lineHeight: 1.25,
                                        color: "#FFFFFF",
                                        fontVariantNumeric: "tabular-nums",
                                    }}
                                >
                                    {formatILS(balance)}
                                </Typography>
                                <Typography
                                    sx={{ fontSize: 13, color: "rgba(248, 250, 252, 0.6)", mt: 0.5 }}
                                >
                                    {lastUpdated
                                        ? `עודכן לאחרונה ב-${lastUpdated.toLocaleDateString("he-IL", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                        })} בשעה ${lastUpdated.toLocaleTimeString("he-IL", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}`
                                        : "מעודכן לרגע זה"}
                                </Typography>
                            </Box>

                            <Stack
                                alignItems={{ xs: "flex-start", sm: "flex-end" }}
                                sx={{ gap: 1.5 }}
                            >
                                <Stack direction="row" alignItems="center" sx={{ gap: 1 }}>
                                    <IconButton
                                        aria-label="רענון היתרה"
                                        onClick={() => setRefreshKey((k) => k + 1)}
                                        sx={{
                                            color: "#FFFFFF",
                                            bgcolor: "rgba(255, 255, 255, 0.12)",
                                            borderRadius: "12px",
                                            transition: "background-color 200ms ease",
                                            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.22)" },
                                            "&.Mui-focusVisible": {
                                                boxShadow: "0 0 0 4px rgba(255, 255, 255, 0.25)",
                                            },
                                        }}
                                    >
                                        <RefreshRounded sx={{ fontSize: 22 }} />
                                    </IconButton>
                                    <Box
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: "16px",
                                            bgcolor: "rgba(255, 255, 255, 0.12)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <AccountBalanceWallet sx={{ color: colors.gold, fontSize: 30 }} />
                                    </Box>
                                </Stack>
                                <Chip
                                    icon={<VerifiedUserOutlined sx={{ fontSize: 16 }} />}
                                    label="חשבון פעיל"
                                    size="small"
                                    sx={{
                                        bgcolor: "rgba(255, 255, 255, 0.14)",
                                        color: "#FFFFFF",
                                        fontWeight: 600,
                                        pr: 1,
                                        "& .MuiChip-icon": {
                                            color: colors.gold,
                                            mr: "2px",
                                            ml: "-6px",
                                        },
                                    }}
                                />
                            </Stack>
                        </Stack>
                    </Paper>

                    <Box sx={summaryGridSx}>
                        <SummaryCard
                            label="הכנסות החודש"
                            value={insights ? formatILS(insights.income) : "—"}
                            caption={insights ? "מתחילת החודש הנוכחי" : "לא זמין כעת"}
                            loading={insightsLoading}
                            icon={<TrendingUpRounded sx={{ color: "#15803D", fontSize: 22 }} />}
                            iconBg="rgba(22, 163, 74, 0.12)"
                        />
                        <SummaryCard
                            label="הוצאות החודש"
                            value={insights ? formatILS(insights.expenses) : "—"}
                            caption={insights ? "מתחילת החודש הנוכחי" : "לא זמין כעת"}
                            loading={insightsLoading}
                            icon={<TrendingDownRounded sx={{ color: colors.dangerText, fontSize: 22 }} />}
                            iconBg="rgba(220, 38, 38, 0.10)"
                        />
                        <SummaryCard
                            label="תנועות החודש"
                            value={insights ? insights.count.toLocaleString("he-IL") : "—"}
                            caption={insights ? "מתחילת החודש הנוכחי" : "לא זמין כעת"}
                            loading={insightsLoading}
                            icon={<ReceiptLongOutlined sx={{ color: colors.primary, fontSize: 22 }} />}
                            iconBg={colors.accentSoft}
                        />
                        <SummaryCard
                            label="סטטוס החשבון"
                            value="פעיל"
                            caption="החשבון מאומת ותקין"
                            icon={<VerifiedUserOutlined sx={{ color: colors.primary, fontSize: 22 }} />}
                            iconBg={colors.accentSoft}
                        />
                    </Box>
                </>
            )}
        </Box>
    );
}
