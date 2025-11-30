import { useEffect, useMemo, useState } from "react";
import type { User, Transaction, ApiResponse, DateFilter } from "../../types";
import type { Dayjs } from "dayjs";
import * as api from "../../api/userApi";
import { filterAndSortTransactions } from "./utils/filterUtils";

export type SortDirection = "asc" | "desc";
export type SortColumn = keyof Transaction;

export function useTransactionFilter(user: User) {
    const [history, setHistory] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // סינון
    const [filter, setFilter] = useState<DateFilter>("all");
    const [customStartDate, setCustomStartDate] = useState<Dayjs | null>(null);
    const [customEndDate, setCustomEndDate] = useState<Dayjs | null>(null);

    // מיון
    const [sortColumn, setSortColumn] = useState<SortColumn>("transaction_date");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    const ACTION_RULES = [
        { keywords: ["deposit"], label: "הפקדה", color: "primary" },
        { keywords: ["withdraw"], label: "משיכה", color: "error" },
        { keywords: ["transfer"], label: "העברה", color: "success" },
        { keywords: ["received"], label: "קבלה", color: "warning" },
        { keywords: ["payment"], label: "תשלום", color: "error" },
    ];

    const getActionType = (action: string) => {
        const normalized = action.toLowerCase();
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
                const res: ApiResponse = await api.getTransactionHistory(user);
                const full = res as any;
                if (res.success && Array.isArray(full.history)) {
                    const sorted = full.history
                        .filter((item: any) => typeof item === "object")
                        .sort(
                            (a: any, b: any) =>
                                new Date(b.transaction_date).getTime() -
                                new Date(a.transaction_date).getTime()
                        );
                    setHistory(sorted);
                } else {
                    setError(res.message || "שגיאה בטעינת היסטוריית פעולות");
                }
            } catch (err) {
                console.error("שגיאה בטעינת היסטוריית פעולות:", err);
                setError("שגיאה בטעינת היסטוריית פעולות.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user.phone, user.idNum, user.secret]);

    // סינון ומיון
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
