import { useState, useMemo } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    ButtonBase,
    Stack,
    Chip,
    Button,
    useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import DataTable from "./DataTable";
import type { RequestItem } from "../../types";
import type { Column } from "./DataTable";

interface PaymentRequestsPageProps {
    requests: RequestItem[];
    loading?: boolean;
    error?: string | null;
    showActions?: boolean;
    onApprove?: (id: number) => void;
    onReject?: (id: number) => void;
}

export default function PaymentRequestsPage({
    requests,
    loading = false,
    error = null,
    onApprove,
    onReject,
}: PaymentRequestsPageProps) {
    
    const theme = useTheme();
    const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

    const filteredRequests = useMemo(() => {
        return filter === "all" ? requests : requests.filter((r) => r.status === filter);
    }, [requests, filter]);

    const counts = useMemo(
        () => ({
            all: requests.length,
            pending: requests.filter((r) => r.status === "pending").length,
            approved: requests.filter((r) => r.status === "approved").length,
            rejected: requests.filter((r) => r.status === "rejected").length,
        }),
        [requests]
    );

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString("he-IL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const columns: Column<RequestItem>[] = useMemo(() => [
        {
            key: "status",
            label: "סטטוס",
            render: (value: string | number | undefined) => (
                <Chip
                    label={value === "pending" ? "ממתין" : value === "approved" ? "אושר" : "נדחה"}
                    color={value === "pending" ? "warning" : value === "approved" ? "success" : "error"}
                    variant="outlined"
                    size="small"
                />
            ),
        },
        {
            key: "date",
            label: "תאריך",
            render: (value: string | number | undefined) => formatDate(value as string),
        },
        { key: "name", label: "שם" },
        { key: "phone", label: "טלפון" },
        {
            key: "amount",
            label: "סכום",
            render: (value: string | number | undefined) => (
                <Typography fontWeight="bold" color="primary">₪ {value}</Typography>
            ),
        },
        ...((onApprove || onReject)
            ? [
                {
                    key: "actions",
                    label: "פעולות",
                    render: (_v: undefined, row: RequestItem) =>
                        row.status === "pending" ? (
                            <Stack direction="row" spacing={1} justifyContent="center">
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    onClick={(e) => { e.stopPropagation(); onApprove?.(row.id); }}
                                >
                                    אשר
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="error"
                                    onClick={(e) => { e.stopPropagation(); onReject?.(row.id); }}
                                >
                                    דחה
                                </Button>
                            </Stack>
                        ) : (
                            <Typography variant="body2" color="text.secondary">אין פעולות</Typography>
                        ),
                },
            ]
            : []),
    ], [onApprove, onReject]);

    if (loading)
        return (
            <Box display="flex" justifyContent="center" my={6}>
                <CircularProgress color="primary" />
            </Box>
        );

    if (error)
        return (
            <Typography color="error" textAlign="center" variant="h6" p={3}>
                {error}
            </Typography>
        );

    return (
        <Box sx={{ direction: "rtl", p: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 2,
                        p: 1.5,
                        background: theme.palette.grey[50],
                        border: `1px solid ${theme.palette.grey[200]}`,
                        borderRadius: "9999px",
                        maxWidth: 600,
                        mx: 'auto'
                    }}
                >
                    {[
                        { key: "all", label: `הצג הכל (${counts.all})`, color: theme.palette.primary.main },
                        { key: "pending", label: `ממתינים (${counts.pending})`, color: theme.palette.warning.main },
                        { key: "approved", label: `מאושרים (${counts.approved})`, color: theme.palette.success.main },
                        { key: "rejected", label: `נדחו (${counts.rejected})`, color: theme.palette.error.main },
                    ].map(({ key, label, color }) => (
                        <ButtonBase
                            key={key}
                            onClick={() => setFilter(key as any)}
                            component={motion.div}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            sx={{ borderRadius: "9999px", flexGrow: 1 }}
                        >
                            <Box
                                sx={{
                                    px: 1.5,
                                    py: 1,
                                    borderRadius: "9999px",
                                    border: `1.5px solid ${color}`,
                                    color: filter === key ? "white" : color,
                                    backgroundColor: filter === key ? color : "white",
                                    fontWeight: "bold",
                                    transition: "0.3s",
                                    fontSize: '0.85rem',
                                    width: '100%',
                                    textAlign: 'center'
                                }}
                            >
                                {label}
                            </Box>
                        </ButtonBase>
                    ))}
                </Box>
            </Box>

            <DataTable<RequestItem>
                columns={columns}
                rows={filteredRequests}
                sortable
                initialSort={{ column: 'date' as keyof RequestItem, direction: 'desc' }}
            />
        </Box>
    );
}