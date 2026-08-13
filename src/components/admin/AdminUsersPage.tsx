import { useEffect, useMemo, useState } from "react";

import {
    AccountBalanceWalletOutlined,
    AdminPanelSettingsRounded,
    BlockRounded,
    CheckRounded,
    CloseRounded,
    ErrorOutline,
    GroupsRounded,
    LockOpenRounded,
    PersonOutlineRounded,
    SearchRounded,
} from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    ButtonBase,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    Paper,
    Skeleton,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import * as api from "../../api/adminApi";
import { colors, focusRing, radius, shadows } from "../../theme/designTokens";
import SummaryCard, { summaryGridSx } from "../dashboard/SummaryCard";
import PageHeader from "../layout/PageHeader";
import DataTable, { type Column } from "../tables/DataTable";

import type { ApiResponse } from "../../types";

type UserStatus = "pending_approval" | "active" | "rejected" | "blocked";

interface UserRow {
    id: string;
    phone: string;
    idNum: string;
    balance: number;
    role: "admin" | "user";
    name: string;
    status: UserStatus;
}

type RoleFilter = "all" | "admin" | "user";

const normalizeStatus = (raw: unknown): UserStatus => {
    const s = String(raw ?? "").toLowerCase();
    if (s === "pending_approval" || s === "pending") return "pending_approval";
    if (s === "rejected") return "rejected";
    if (s === "blocked") return "blocked";
    return "active";
};

const actionButtonSx = {
    px: 2,
    whiteSpace: "nowrap",
    "& .MuiButton-startIcon": { ml: 1, mr: -0.5 },
} as const;

const formatILS = (n: number) =>
    n.toLocaleString("he-IL", {
        style: "currency",
        currency: "ILS",
        minimumFractionDigits: 2,
    });

const pillSx = (active: boolean) => ({
    borderRadius: "9999px",
    px: 2.25,
    minHeight: 38,
    fontFamily: "inherit",
    fontSize: 13.5,
    fontWeight: active ? 700 : 500,
    display: "inline-flex",
    alignItems: "center",
    gap: 1,
    color: active ? "#FFFFFF" : colors.primary,
    bgcolor: active ? colors.primary : colors.surface,
    border: `1.5px solid ${active ? colors.primary : "rgba(23, 60, 108, 0.28)"}`,
    transition:
        "background-color 200ms ease, color 200ms ease, border-color 200ms ease, box-shadow 200ms ease",
    "&:hover": active
        ? { bgcolor: colors.primaryHover, borderColor: colors.primaryHover }
        : { bgcolor: colors.accentSoft, borderColor: colors.primary },
    "&.Mui-focusVisible": { boxShadow: focusRing },
});

const ROLE_META: Record<UserRow["role"], { label: string; text: string; dot: string; bg: string }> = {
    admin: {
        label: "מנהל",
        text: "#8A6D1D",
        dot: colors.gold,
        bg: "rgba(198, 167, 92, 0.18)",
    },
    user: {
        label: "משתמש",
        text: colors.textSecondary,
        dot: colors.muted,
        bg: colors.accentSoft,
    },
};

function RoleBadge({ role }: { role: UserRow["role"] }) {
    const meta = ROLE_META[role] ?? ROLE_META.user;
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
                sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: meta.dot, flexShrink: 0 }}
            />
            {meta.label}
        </Box>
    );
}

const STATUS_META: Record<UserStatus, { label: string; text: string; dot: string; bg: string }> = {
    pending_approval: {
        label: "ממתין לאישור",
        text: "#B45309",
        dot: colors.warning,
        bg: "rgba(245, 158, 11, 0.12)",
    },
    active: {
        label: "מחובר",
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
    blocked: {
        label: "חסום",
        text: "#991B1B",
        dot: "#991B1B",
        bg: "rgba(153, 27, 27, 0.14)",
    },
};

function StatusBadge({ status }: { status: UserStatus }) {
    const meta = STATUS_META[status] ?? STATUS_META.active;
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
                sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: meta.dot, flexShrink: 0 }}
            />
            {meta.label}
        </Box>
    );
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
    const [search, setSearch] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [confirmApproveUser, setConfirmApproveUser] = useState<UserRow | null>(null);
    const [confirmBlockUser, setConfirmBlockUser] = useState<UserRow | null>(null);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({ open: false, message: "", severity: "success" });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError("");

                const res: ApiResponse = await api.getAllUsers();

                const list = (res as any).users;
                if (res.success && Array.isArray(list)) {
                    const normalized: UserRow[] = list.map((u: any) => ({
                        id: String(u.id ?? u.user_id ?? ""),
                        phone: u.phone_number ?? u.phone ?? "",
                        idNum: u.id_number ?? u.idNum ?? "",
                        balance: Number(u.balance ?? 0),
                        role: u.role === "admin" ? "admin" : "user",
                        name: u.name ?? "",
                        status: normalizeStatus(u.status),
                    }));
                    setUsers(normalized);
                } else {
                    setError(res.message || "שגיאה בטעינת המשתמשים.");
                }
            } catch (err) {
                console.error("שגיאה בטעינת המשתמשים:", err);
                setError("שגיאה בטעינת המשתמשים.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const updateUserStatus = (id: string, status: UserStatus) => {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
    };

    const handleApproveConfirmed = async () => {
        const target = confirmApproveUser;
        if (!target) return;
        setConfirmApproveUser(null);
        setActionLoadingId(target.id);
        try {
            const res = await api.approveUser(target.id);
            if (res.success) {
                updateUserStatus(target.id, "active");
                setSnackbar({ open: true, message: "המשתמש אושר בהצלחה", severity: "success" });
            } else {
                setSnackbar({
                    open: true,
                    message: res.message || "שגיאה באישור המשתמש",
                    severity: "error",
                });
            }
        } catch (err) {
            console.error("שגיאה באישור משתמש:", err);
            setSnackbar({ open: true, message: "שגיאת תקשורת עם השרת.", severity: "error" });
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleReject = async (row: UserRow) => {
        setActionLoadingId(row.id);
        try {
            const res = await api.rejectUser(row.id);
            if (res.success) {
                updateUserStatus(row.id, "rejected");
                setSnackbar({ open: true, message: "המשתמש נדחה", severity: "success" });
            } else {
                setSnackbar({
                    open: true,
                    message: res.message || "שגיאה בדחיית המשתמש",
                    severity: "error",
                });
            }
        } catch (err) {
            console.error("שגיאה בדחיית משתמש:", err);
            setSnackbar({ open: true, message: "שגיאת תקשורת עם השרת.", severity: "error" });
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleBlockConfirmed = async () => {
        const target = confirmBlockUser;
        if (!target) return;
        setConfirmBlockUser(null);
        setActionLoadingId(target.id);
        try {
            const res = await api.blockUser(target.id);
            if (res.success) {
                updateUserStatus(target.id, "blocked");
                setSnackbar({ open: true, message: "המשתמש נחסם בהצלחה", severity: "success" });
            } else {
                setSnackbar({
                    open: true,
                    message: res.message || "שגיאה בחסימת המשתמש",
                    severity: "error",
                });
            }
        } catch (err) {
            console.error("שגיאה בחסימת משתמש:", err);
            setSnackbar({ open: true, message: "שגיאת תקשורת עם השרת.", severity: "error" });
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleUnblock = async (row: UserRow) => {
        setActionLoadingId(row.id);
        try {
            const res = await api.unblockUser(row.id);
            if (res.success) {
                updateUserStatus(row.id, "active");
                setSnackbar({ open: true, message: "החסימה בוטלה בהצלחה", severity: "success" });
            } else {
                setSnackbar({
                    open: true,
                    message: res.message || "שגיאה בביטול החסימה",
                    severity: "error",
                });
            }
        } catch (err) {
            console.error("שגיאה בביטול חסימת משתמש:", err);
            setSnackbar({ open: true, message: "שגיאת תקשורת עם השרת.", severity: "error" });
        } finally {
            setActionLoadingId(null);
        }
    };

    const stats = useMemo(() => {
        const admins = users.filter((u) => u.role === "admin").length;
        const totalBalance = users.reduce(
            (sum, u) => sum + (Number.isFinite(u.balance) ? u.balance : 0),
            0
        );
        return { total: users.length, admins, regular: users.length - admins, totalBalance };
    }, [users]);

    const filteredUsers = useMemo(() => {
        const term = search.trim().toLowerCase();
        return users.filter((u) => {
            if (roleFilter !== "all" && u.role !== roleFilter) return false;
            if (!term) return true;
            return (
                u.name.toLowerCase().includes(term) ||
                u.phone.toLowerCase().includes(term) ||
                u.idNum.toLowerCase().includes(term)
            );
        });
    }, [users, roleFilter, search]);

    const columns: Column<UserRow>[] = useMemo(
        () => [
            {
                key: "name",
                label: "שם",
                render: (_value: any, row: UserRow) => (
                    <Stack direction="row" alignItems="center" justifyContent="center" sx={{ gap: 1.25 }}>
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
                            {row.name.trim().charAt(0) || "—"}
                        </Box>
                        <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
                            {row.name || "—"}
                        </Typography>
                    </Stack>
                ),
            },
            {
                key: "phone",
                label: "טלפון",
                render: (value: any) => (
                    <Typography
                        sx={{
                            fontSize: 14,
                            color: colors.textPrimary,
                            direction: "ltr",
                            fontVariantNumeric: "tabular-nums",
                        }}
                    >
                        {String(value ?? "—")}
                    </Typography>
                ),
            },
            {
                key: "idNum",
                label: "תעודת זהות",
                render: (value: any) => (
                    <Typography
                        sx={{
                            fontSize: 14,
                            color: colors.textSecondary,
                            direction: "ltr",
                            fontVariantNumeric: "tabular-nums",
                        }}
                    >
                        {String(value ?? "—")}
                    </Typography>
                ),
            },
            {
                key: "balance",
                label: "יתרה",
                render: (value: any) => (
                    <Typography
                        sx={{
                            fontSize: 15,
                            fontWeight: 700,
                            fontVariantNumeric: "tabular-nums",
                            whiteSpace: "nowrap",
                            color: Number(value) > 0 ? colors.primary : colors.textSecondary,
                        }}
                    >
                        {formatILS(Number(value) || 0)}
                    </Typography>
                ),
            },
            {
                key: "role",
                label: "תפקיד",
                render: (value: any) => <RoleBadge role={value as UserRow["role"]} />,
            },
            {
                key: "status",
                label: "סטטוס",
                render: (value: any) => <StatusBadge status={value as UserStatus} />,
            },
            {
                label: "פעולות",
                render: (_value: any, row: UserRow) =>
                    row.status === "pending_approval" ? (
                        <Stack direction="row" justifyContent="center" sx={{ gap: 1 }}>
                            <Button
                                size="small"
                                variant="contained"
                                color="success"
                                disabled={actionLoadingId === row.id}
                                startIcon={
                                    actionLoadingId === row.id ? undefined : (
                                        <CheckRounded sx={{ fontSize: 18 }} />
                                    )
                                }
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmApproveUser(row);
                                }}
                                sx={{ ...actionButtonSx, color: "#FFFFFF" }}
                            >
                                {actionLoadingId === row.id ? (
                                    <CircularProgress size={16} sx={{ color: "#FFFFFF" }} />
                                ) : (
                                    "אישור"
                                )}
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                disabled={actionLoadingId === row.id}
                                startIcon={<CloseRounded sx={{ fontSize: 18 }} />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleReject(row);
                                }}
                                sx={actionButtonSx}
                            >
                                דחייה
                            </Button>
                        </Stack>
                    ) : row.status === "active" ? (
                        <Stack direction="row" justifyContent="center">
                            <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                disabled={actionLoadingId === row.id}
                                startIcon={
                                    actionLoadingId === row.id ? undefined : (
                                        <BlockRounded sx={{ fontSize: 18 }} />
                                    )
                                }
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmBlockUser(row);
                                }}
                                sx={actionButtonSx}
                            >
                                {actionLoadingId === row.id ? (
                                    <CircularProgress size={16} sx={{ color: colors.danger }} />
                                ) : (
                                    "חסימה"
                                )}
                            </Button>
                        </Stack>
                    ) : row.status === "blocked" ? (
                        <Stack direction="row" justifyContent="center">
                            <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                disabled={actionLoadingId === row.id}
                                startIcon={
                                    actionLoadingId === row.id ? undefined : (
                                        <LockOpenRounded sx={{ fontSize: 18 }} />
                                    )
                                }
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnblock(row);
                                }}
                                sx={actionButtonSx}
                            >
                                {actionLoadingId === row.id ? (
                                    <CircularProgress size={16} sx={{ color: "#15803D" }} />
                                ) : (
                                    "ביטול חסימה"
                                )}
                            </Button>
                        </Stack>
                    ) : (
                        <Typography sx={{ fontSize: 13, color: colors.muted }}>—</Typography>
                    ),
            },
        ],
        [actionLoadingId]
    );

    const roleFilters: { key: RoleFilter; label: string }[] = [
        { key: "all", label: `הכל (${stats.total})` },
        { key: "admin", label: `מנהלים (${stats.admins})` },
        { key: "user", label: `משתמשים (${stats.regular})` },
    ];

    return (
        <Box sx={{ direction: "rtl", maxWidth: 1140, mx: "auto", py: { xs: 0.5, sm: 1 } }}>
            <PageHeader
                icon={<GroupsRounded sx={{ color: colors.gold, fontSize: 26 }} />}
                title="ניהול משתמשים"
                subtitle="כלל המשתמשים הרשומים במערכת, פרטי חשבון ורמות הרשאה"
            />

            {loading && (
                <>
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
                    <Skeleton variant="rounded" height={76} sx={{ borderRadius: radius.card, mb: 3 }} />
                    <Skeleton variant="rounded" height={340} sx={{ borderRadius: radius.card }} />
                </>
            )}

            {!loading && error && (
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

            {!loading && !error && (
                <>
                    <Box sx={summaryGridSx}>
                        <SummaryCard
                            label="סך המשתמשים"
                            value={stats.total.toLocaleString("he-IL")}
                            caption="רשומים במערכת"
                            icon={<GroupsRounded sx={{ color: colors.primary, fontSize: 22 }} />}
                            iconBg={colors.accentSoft}
                        />
                        <SummaryCard
                            label="מנהלים"
                            value={stats.admins.toLocaleString("he-IL")}
                            caption="בעלי הרשאות ניהול"
                            icon={<AdminPanelSettingsRounded sx={{ color: "#8A6D1D", fontSize: 22 }} />}
                            iconBg="rgba(198, 167, 92, 0.18)"
                        />
                        <SummaryCard
                            label="משתמשים רגילים"
                            value={stats.regular.toLocaleString("he-IL")}
                            caption="חשבונות סטנדרטיים"
                            icon={<PersonOutlineRounded sx={{ color: colors.primary, fontSize: 22 }} />}
                            iconBg={colors.accentSoft}
                        />
                        <SummaryCard
                            label="סך כל היתרות"
                            value={formatILS(stats.totalBalance)}
                            caption="בכלל החשבונות"
                            icon={<AccountBalanceWalletOutlined sx={{ color: "#15803D", fontSize: 22 }} />}
                            iconBg="rgba(22, 163, 74, 0.12)"
                        />
                    </Box>

                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2, sm: 2.5 },
                            mb: 3,
                            bgcolor: colors.surface,
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.card,
                            boxShadow: shadows.sm,
                        }}
                    >
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            alignItems={{ xs: "stretch", sm: "center" }}
                            justifyContent="space-between"
                            sx={{ gap: 1.5 }}
                        >
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25 }}>
                                {roleFilters.map(({ key, label }) => {
                                    const isActive = roleFilter === key;
                                    return (
                                        <ButtonBase
                                            key={key}
                                            onClick={() => setRoleFilter(key)}
                                            aria-pressed={isActive}
                                            sx={pillSx(isActive)}
                                        >
                                            {label}
                                        </ButtonBase>
                                    );
                                })}
                            </Box>

                            <TextField
                                size="small"
                                placeholder="חיפוש לפי שם, טלפון או ת.ז"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                sx={{ width: { xs: "100%", sm: 280 } }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchRounded sx={{ fontSize: 19, color: colors.muted }} />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Stack>
                    </Paper>

                    <DataTable<UserRow>
                        columns={columns}
                        rows={filteredUsers}
                        emptyMessage={
                            search.trim() || roleFilter !== "all"
                                ? "לא נמצאו משתמשים התואמים לחיפוש"
                                : "אין משתמשים להצגה"
                        }
                        sortable
                        initialSort={{ column: "balance" as keyof UserRow, direction: "desc" }}
                    />
                </>
            )}

            <Dialog
                open={confirmApproveUser !== null}
                onClose={() => setConfirmApproveUser(null)}
                maxWidth="xs"
                fullWidth
                dir="rtl"
                aria-labelledby="confirm-approve-user-title"
            >
                <DialogTitle
                    id="confirm-approve-user-title"
                    sx={{ fontWeight: 700, color: colors.textPrimary, pb: 1 }}
                >
                    אישור משתמש
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: 14.5, color: colors.textSecondary, mb: 2 }}>
                        אנא אשרו את פרטי המשתמש לפני מתן גישה למערכת:
                    </Typography>
                    <Stack
                        sx={{ gap: 1, p: 2, borderRadius: radius.input, bgcolor: colors.accentSoft }}
                    >
                        <Stack direction="row" justifyContent="space-between">
                            <Typography sx={{ fontSize: 14, color: colors.textSecondary }}>
                                שם
                            </Typography>
                            <Typography
                                sx={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary }}
                            >
                                {confirmApproveUser?.name || "—"}
                            </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography sx={{ fontSize: 14, color: colors.textSecondary }}>
                                טלפון
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: 15,
                                    fontWeight: 700,
                                    color: colors.textPrimary,
                                    direction: "ltr",
                                }}
                            >
                                {confirmApproveUser?.phone || "—"}
                            </Typography>
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 1.5, gap: 1 }}>
                    <Button variant="outlined" onClick={() => setConfirmApproveUser(null)}>
                        ביטול
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleApproveConfirmed}
                        sx={{ color: "#FFFFFF" }}
                    >
                        אישור משתמש
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={confirmBlockUser !== null}
                onClose={() => setConfirmBlockUser(null)}
                maxWidth="xs"
                fullWidth
                dir="rtl"
                aria-labelledby="confirm-block-user-title"
            >
                <DialogTitle
                    id="confirm-block-user-title"
                    sx={{ fontWeight: 700, color: colors.textPrimary, pb: 1 }}
                >
                    חסימת משתמש
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: 14.5, color: colors.textSecondary, mb: 2 }}>
                        האם אתה בטוח שברצונך לחסום את המשתמש הבא? המשתמש לא יוכל להתחבר למערכת
                        עד שהחסימה תבוטל.
                    </Typography>
                    <Stack
                        sx={{
                            gap: 1,
                            p: 2,
                            borderRadius: radius.input,
                            bgcolor: "rgba(153, 27, 27, 0.08)",
                        }}
                    >
                        <Stack direction="row" justifyContent="space-between">
                            <Typography sx={{ fontSize: 14, color: colors.textSecondary }}>
                                שם
                            </Typography>
                            <Typography
                                sx={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary }}
                            >
                                {confirmBlockUser?.name || "—"}
                            </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography sx={{ fontSize: 14, color: colors.textSecondary }}>
                                טלפון
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: 15,
                                    fontWeight: 700,
                                    color: colors.textPrimary,
                                    direction: "ltr",
                                }}
                            >
                                {confirmBlockUser?.phone || "—"}
                            </Typography>
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 1.5, gap: 1 }}>
                    <Button variant="outlined" onClick={() => setConfirmBlockUser(null)}>
                        ביטול
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleBlockConfirmed}
                        sx={{ color: "#FFFFFF" }}
                    >
                        חסימת משתמש
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
