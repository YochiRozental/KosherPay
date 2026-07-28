import { useMemo, useState, type ReactNode } from "react";

import {
    CancelOutlined,
    CheckRounded,
    CloseRounded,
    ErrorOutline,
    InboxOutlined,
    ReceiptLongOutlined,
    ScheduleRounded,
    TaskAltRounded,
} from "@mui/icons-material";
import {
    Box,
    Button,
    ButtonBase,
    Paper,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";

import DataTable from "./DataTable";
import { colors, focusRing, radius, shadows } from "../../theme/designTokens";


import type { Column } from "./DataTable";
import type { RequestItem } from "../../types";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

// MUI's startIcon margins assume LTR; mirror them for the RTL layout so the
// icon sits beside the label with proper spacing.
const actionButtonSx = {
    px: 2,
    whiteSpace: "nowrap",
    "& .MuiButton-startIcon": { ml: 1, mr: -0.5 },
} as const;

interface PaymentRequestsTableProps {
    requests: RequestItem[];
    loading?: boolean;
    error?: string | null;
    showActions?: boolean;
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
    variant?: "incoming" | "sent";
}

// --- Formatting helpers ---

const formatILS = (raw: string | number | undefined) => {
    const n = parseFloat(String(raw ?? "").replace(/[^0-9.-]/g, ""));
    if (!Number.isFinite(n)) return "—";
    return n.toLocaleString("he-IL", {
        style: "currency",
        currency: "ILS",
        minimumFractionDigits: 2,
    });
};

const parseDate = (v: unknown) => {
    const s = String(v ?? "").trim();
    if (!s) return null;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
};

// --- Status badge ---

const STATUS_META: Record<
    RequestItem["status"],
    { label: string; text: string; dot: string; bg: string }
> = {
    pending: {
        label: "ממתין לאישור",
        text: "#B45309",
        dot: colors.warning,
        bg: "rgba(245, 158, 11, 0.12)",
    },
    approved: {
        label: "אושר",
        text: "#15803D",
        dot: colors.success,
        bg: "rgba(22, 163, 74, 0.12)",
    },
    rejected: {
        label: "נדחה",
        text: colors.dangerText,
        dot: colors.danger,
        bg: "rgba(220, 38, 38, 0.10)",
    },
};

function StatusBadge({ status }: { status: RequestItem["status"] }) {
    const meta = STATUS_META[status] ?? STATUS_META.pending;
    return (
        <Box
            component="span"
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                px: 1.5,
                py: 0.5,
                borderRadius: "9999px",
                bgcolor: meta.bg,
                color: meta.text,
                fontSize: 12.5,
                fontWeight: 700,
                whiteSpace: "nowrap",
            }}
        >
            <Box
                component="span"
                sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    bgcolor: meta.dot,
                    flexShrink: 0,
                }}
            />
            {meta.label}
        </Box>
    );
}

// --- Summary / filter cards ---

interface SummaryFilterCardProps {
    label: string;
    caption: string;
    value: number;
    icon: ReactNode;
    iconBg: string;
    accent: string;
    active: boolean;
    onClick: () => void;
}

function SummaryFilterCard({
    label,
    caption,
    value,
    icon,
    iconBg,
    accent,
    active,
    onClick,
}: SummaryFilterCardProps) {
    return (
        <ButtonBase
            onClick={onClick}
            aria-pressed={active}
            focusRipple
            sx={{
                borderRadius: radius.card,
                textAlign: "inherit",
                width: "100%",
                "&.Mui-focusVisible": { boxShadow: focusRing },
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: 2.5,
                    width: "100%",
                    borderRadius: radius.card,
                    border: `1px solid ${active ? accent : colors.border}`,
                    boxShadow: active ? shadows.md : shadows.sm,
                    bgcolor: active ? iconBg : colors.surface,
                    transition:
                        "box-shadow 200ms ease, transform 200ms ease, background-color 200ms ease, border-color 200ms ease",
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
                                color: colors.textSecondary,
                            }}
                        >
                            {label}
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: { xs: 24, lg: 26 },
                                fontWeight: 800,
                                lineHeight: 1.35,
                                fontVariantNumeric: "tabular-nums",
                                color: colors.textPrimary,
                            }}
                        >
                            {value.toLocaleString("he-IL")}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: colors.muted }}>
                            {caption}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            flexShrink: 0,
                            borderRadius: "12px",
                            bgcolor: active ? colors.surface : iconBg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {icon}
                    </Box>
                </Stack>
            </Paper>
        </ButtonBase>
    );
}

const summaryGridSx = {
    display: "grid",
    gridTemplateColumns: {
        xs: "1fr",
        sm: "repeat(2, 1fr)",
        lg: "repeat(4, 1fr)",
    },
    gap: 2,
    mb: 3,
};

// --- Empty state ---

function EmptyState({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <Paper
            elevation={0}
            sx={{
                py: 7,
                px: 3,
                textAlign: "center",
                borderRadius: radius.card,
                border: "1px dashed rgba(23, 60, 108, 0.35)",
                bgcolor: colors.surface,
            }}
        >
            <Box
                sx={{
                    width: 64,
                    height: 64,
                    mx: "auto",
                    mb: 2,
                    borderRadius: "50%",
                    bgcolor: colors.accentSoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <InboxOutlined sx={{ fontSize: 30, color: colors.primary }} />
            </Box>
            <Typography sx={{ fontSize: 17, fontWeight: 700, color: colors.textPrimary }}>
                {title}
            </Typography>
            <Typography
                sx={{ fontSize: 13.5, color: colors.textSecondary, mt: 0.5, mb: action ? 2.5 : 0 }}
            >
                {description}
            </Typography>
            {action}
        </Paper>
    );
}

// --- Main component ---

export default function PaymentRequestsTable({
    requests,
    loading = false,
    error = null,
    onApprove,
    onReject,
    variant = "incoming",
}: PaymentRequestsTableProps) {
    const [filter, setFilter] = useState<StatusFilter>("all");

    const sortedRequests = useMemo(() => {
        const parseTime = (v: unknown) => parseDate(v)?.getTime() ?? 0;
        return [...(requests ?? [])]
            .map((r) => ({ ...r, name: r.name ?? "—", phone: r.phone ?? "—" }))
            .sort((a, b) => parseTime(b.created_at) - parseTime(a.created_at));
    }, [requests]);

    const filteredRequests = useMemo(
        () =>
            filter === "all"
                ? sortedRequests
                : sortedRequests.filter((r) => r.status === filter),
        [sortedRequests, filter]
    );

    const counts = useMemo(
        () => ({
            all: sortedRequests.length,
            pending: sortedRequests.filter((r) => r.status === "pending").length,
            approved: sortedRequests.filter((r) => r.status === "approved").length,
            rejected: sortedRequests.filter((r) => r.status === "rejected").length,
        }),
        [sortedRequests]
    );

    const isIncoming = variant === "incoming";

    const columns: Column<RequestItem>[] = useMemo(
        () => [
            {
                key: "status",
                label: "סטטוס",
                render: (value: string | undefined) => (
                    <StatusBadge status={value as RequestItem["status"]} />
                ),
            },
            {
                key: "name",
                label: isIncoming ? "מאת" : "אל",
                render: (_v: string | undefined, row: RequestItem) => (
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                        sx={{ gap: 1.25 }}
                    >
                        <Box
                            aria-hidden
                            sx={{
                                width: 36,
                                height: 36,
                                flexShrink: 0,
                                borderRadius: "50%",
                                bgcolor: colors.accentSoft,
                                color: colors.primary,
                                fontWeight: 700,
                                fontSize: 15,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {String(row.name ?? "—").trim().charAt(0) || "—"}
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                            <Typography sx={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.3 }}>
                                {row.name}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: 12.5,
                                    color: colors.textSecondary,
                                    direction: "ltr",
                                    fontVariantNumeric: "tabular-nums",
                                }}
                            >
                                {row.phone}
                            </Typography>
                        </Box>
                    </Stack>
                ),
            },
            {
                key: "amount",
                label: "סכום",
                render: (value: string | undefined) => (
                    <Typography
                        sx={{
                            fontSize: 15.5,
                            fontWeight: 700,
                            color: colors.primary,
                            fontVariantNumeric: "tabular-nums",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {formatILS(value as string)}
                    </Typography>
                ),
            },
            {
                key: "created_at",
                label: "תאריך",
                render: (value: string | undefined) => {
                    const d = parseDate(value);
                    if (!d)
                        return (
                            <Typography sx={{ fontSize: 14, color: colors.muted }}>—</Typography>
                        );
                    return (
                        <Box>
                            <Typography
                                sx={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: colors.textPrimary,
                                    fontVariantNumeric: "tabular-nums",
                                }}
                            >
                                {d.toLocaleDateString("he-IL", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                })}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: 12.5,
                                    color: colors.textSecondary,
                                    fontVariantNumeric: "tabular-nums",
                                }}
                            >
                                {d.toLocaleTimeString("he-IL", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </Typography>
                        </Box>
                    );
                },
            },
            ...(onApprove || onReject
                ? [
                    {
                        label: "פעולות",
                        render: (_v: undefined, row: RequestItem) =>
                            row.status === "pending" ? (
                                <Stack direction="row" justifyContent="center" sx={{ gap: 1 }}>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        color="success"
                                        startIcon={<CheckRounded sx={{ fontSize: 18 }} />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onApprove?.(row.id);
                                        }}
                                        sx={{ ...actionButtonSx, color: "#FFFFFF" }}
                                    >
                                        אישור
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="error"
                                        startIcon={<CloseRounded sx={{ fontSize: 18 }} />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onReject?.(row.id);
                                        }}
                                        sx={actionButtonSx}
                                    >
                                        דחייה
                                    </Button>
                                </Stack>
                            ) : (
                                <Typography sx={{ fontSize: 13, color: colors.muted }}>
                                    —
                                </Typography>
                            ),
                    },
                ]
                : []),
        ],
        [onApprove, onReject, isIncoming]
    );

    if (loading)
        return (
            <Box sx={{ direction: "rtl" }}>
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
                <Skeleton variant="rounded" height={340} sx={{ borderRadius: radius.card }} />
            </Box>
        );

    if (error)
        return (
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
        );

    const emptyCopy: Record<StatusFilter, { title: string; description: string }> = {
        all: isIncoming
            ? {
                title: "אין בקשות תשלום",
                description: "כשמישהו יבקש ממך תשלום, הבקשה תופיע כאן",
            }
            : {
                title: "עדיין לא שלחת בקשות תשלום",
                description: "בקשות שתשלח לאנשי קשר יופיעו כאן עם סטטוס מעודכן",
            },
        pending: {
            title: "אין בקשות ממתינות",
            description: isIncoming
                ? "כל הבקשות טופלו — אין בקשות שדורשות את תשומת ליבך"
                : "אין בקשות שממתינות כרגע לתשובת הנמען",
        },
        approved: {
            title: "אין בקשות שאושרו",
            description: "בקשות שיאושרו יופיעו כאן",
        },
        rejected: {
            title: "אין בקשות שנדחו",
            description: "בקשות שיידחו יופיעו כאן",
        },
    };

    return (
        <Box sx={{ direction: "rtl" }}>
            <Box sx={summaryGridSx} role="group" aria-label="סינון בקשות לפי סטטוס">
                <SummaryFilterCard
                    label="סך הבקשות"
                    caption={isIncoming ? "כל הבקשות שקיבלת" : "כל הבקשות ששלחת"}
                    value={counts.all}
                    active={filter === "all"}
                    onClick={() => setFilter("all")}
                    accent={colors.primary}
                    iconBg={colors.accentSoft}
                    icon={<ReceiptLongOutlined sx={{ color: colors.primary, fontSize: 22 }} />}
                />
                <SummaryFilterCard
                    label="ממתינות"
                    caption={isIncoming ? "דורשות את תשומת ליבך" : "ממתינות לתשובת הנמען"}
                    value={counts.pending}
                    active={filter === "pending"}
                    onClick={() => setFilter("pending")}
                    accent={colors.warning}
                    iconBg="rgba(245, 158, 11, 0.12)"
                    icon={<ScheduleRounded sx={{ color: "#B45309", fontSize: 22 }} />}
                />
                <SummaryFilterCard
                    label="אושרו"
                    caption="בקשות שהושלמו בהצלחה"
                    value={counts.approved}
                    active={filter === "approved"}
                    onClick={() => setFilter("approved")}
                    accent={colors.success}
                    iconBg="rgba(22, 163, 74, 0.12)"
                    icon={<TaskAltRounded sx={{ color: "#15803D", fontSize: 22 }} />}
                />
                <SummaryFilterCard
                    label="נדחו"
                    caption="בקשות שלא אושרו"
                    value={counts.rejected}
                    active={filter === "rejected"}
                    onClick={() => setFilter("rejected")}
                    accent={colors.danger}
                    iconBg="rgba(220, 38, 38, 0.10)"
                    icon={<CancelOutlined sx={{ color: colors.dangerText, fontSize: 22 }} />}
                />
            </Box>

            {filteredRequests.length === 0 ? (
                <EmptyState
                    title={emptyCopy[filter].title}
                    description={emptyCopy[filter].description}
                    action={
                        filter !== "all" && counts.all > 0 ? (
                            <Button variant="outlined" onClick={() => setFilter("all")}>
                                הצגת כל הבקשות
                            </Button>
                        ) : undefined
                    }
                />
            ) : (
                <DataTable<RequestItem> columns={columns} rows={filteredRequests} />
            )}
        </Box>
    );
}
