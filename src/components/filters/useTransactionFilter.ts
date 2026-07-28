import { useEffect, useMemo, useState } from "react";

import { filterAndSortTransactions } from "./utils/filterUtils";
import * as api from "../../api/paymentsApi";

import type { UserMe, Transaction, ApiResponse, DateFilter } from "../../types";
import type { Dayjs } from "dayjs";

export type SortDirection = "asc" | "desc";
export type SortColumn = keyof Transaction;

export function useTransactionFilter(user: UserMe) {
    const [history, setHistory] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [filter, setFilter] = useState<DateFilter>("all");
    const [customStartDate, setCustomStartDate] = useState<Dayjs | null>(null);
    const [customEndDate, setCustomEndDate] = useState<Dayjs | null>(null);

    const [sortColumn, setSortColumn] = useState<SortColumn>("transaction_date");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    const ACTION_RULES = [
        { keywords: ["deposit"], label: "הפקדה", color: "primary" },
        { keywords: ["withdraw"], label: "משיכה", color: "error" },
        { keywords: ["transfer"], label: "העברה", color: "success" },
        { keywords: ["received"], label: "קבלה", color: "warning" },
        { keywords: ["payment"], label: "תשלום", color: "error" },
    ];

    const getActionType = (action?: string | null) => {
        const normalized = String(action ?? "").toLowerCase();

        const match = ACTION_RULES.find((r) =>
            r.keywords.some((k) => normalized.includes(k))
        );

        return match || { label: "אחר", color: "info" };
    };

    const handleSort = (column: SortColumn, nextDirection?: SortDirection) => {
        if (nextDirection) {
            setSortColumn(column);
            setSortDirection(nextDirection);
            return;
        }

        setSortColumn((prevColumn) => {
            if (prevColumn !== column) {
                setSortDirection("asc");
                return column;
            }

            setSortDirection((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
            return prevColumn;
        });
    };

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            setError("");

            try {
                const res: ApiResponse = await api.getHistory();
                const full = res as any;

                if (!res.success || !Array.isArray(full.history)) {
                    setError(res.message || "שגיאה בטעינת היסטוריית פעולות");
                    return;
                }

                const normalized: Transaction[] = full.history
                    .filter((x: any) => x && typeof x === "object")
                    .map((t: any) => {
                        const action_type =
                            t.action_type ??
                            t.type ??
                            t.action ??
                            t.tx_type ??
                            "";

                        const rawDate =
                            t.transaction_date ??
                            t.created_at ??
                            t.date ??
                            t.timestamp ??
                            "";

                        const transaction_date =
                            typeof rawDate === "number"
                                ? new Date(rawDate > 1e12 ? rawDate : rawDate * 1000).toISOString()
                                : String(rawDate ?? "");

                        const amount = String(t.amount ?? t.sum ?? t.value ?? "0");

                        const description = String(t.description ?? t.details ?? t.note ?? "");

                        const counterparty = String(
                            t.counterparty ??
                            t.recipient_name ??
                            t.recipient_phone ??
                            t.recipient ??
                            t.target_name ??
                            t.target_phone ??
                            t.sender_name ??
                            t.sender_phone ??
                            t.other_party ??
                            ""
                        );

                        return { action_type, amount, description, transaction_date, counterparty };
                    });

                const sorted = normalized.sort(
                    (a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
                );

                setHistory(sorted);
            } catch (err) {
                console.error("שגיאה בטעינת היסטוריית פעולות:", err);
                setError("שגיאה בטעינת היסטוריית פעולות.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

    const sortedAndFiltered = useMemo(
        () =>
            filterAndSortTransactions(
                history,
                filter,
                customStartDate,
                customEndDate,
                sortColumn,
                sortDirection,
                getActionType
            ),
        [history, filter, customStartDate, customEndDate, sortColumn, sortDirection]
    );

    return {
        history,
        sortedAndFiltered,
        loading,
        error,
        filter,
        customStartDate,
        customEndDate,
        setFilter,
        setCustomStartDate,
        setCustomEndDate,
        sortColumn,
        sortDirection,
        handleSort,
        getActionType,
    };
}
