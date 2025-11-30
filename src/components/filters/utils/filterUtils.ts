import dayjs, { Dayjs } from "dayjs";
import type { DateFilter } from "../../../types";

/**
 * פונקציה גנרית לסינון ומיון נתונים
 * @param data רשימת הנתונים הגולמית
 * @param filter סוג הסינון לפי תאריך
 * @param customStartDate תאריך התחלה (לטווח מותאם אישית)
 * @param customEndDate תאריך סיום (לטווח מותאם אישית)
 * @param sortColumn שם העמודה למיון
 * @param sortDirection כיוון המיון ("asc" / "desc")
 * @param getActionType פונקציה אופציונלית שמחזירה אובייקט עם צבע או תווית — לדוגמה עבור פעולות כספיות
 */

export function filterAndSortTransactions<T extends Record<string, any>>(
    data: T[],
    filter: DateFilter,
    customStartDate: Dayjs | null,
    customEndDate: Dayjs | null,
    sortColumn: keyof T,
    sortDirection: "asc" | "desc",
    getActionType?: (action: string) => { label: string; color: string }
): T[] {
    if (!Array.isArray(data)) return [];

    // סינון לפי תאריך
    let filtered = data;

    if (filter !== "all") {
        const now = dayjs();
        let start: Dayjs | null = null;
        let end: Dayjs | null = null;

        switch (filter) {
            case "today":
                start = now.startOf("day");
                end = now.endOf("day");
                break;
            case "week":
                start = now.startOf("week");
                end = now.endOf("week");
                break;
            case "month":
                start = now.startOf("month");
                end = now.endOf("month");
                break;
            case "custom":
                if (customStartDate && customEndDate) {
                    start = customStartDate.startOf("day");
                    end = customEndDate.endOf("day");
                }
                break;
        }

        if (start && end) {
            filtered = filtered.filter((item) => {
                const dateValue = item.transaction_date || item.date || item.createdAt;
                if (!dateValue) return false;
                const date = dayjs(dateValue);
                return date.isAfter(start) && date.isBefore(end);
            });
        }
    }

    // מיון לפי עמודה
    const sorted = [...filtered].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        // Normalization helpers
        const toStr = (v: any) => (v === null || v === undefined ? "" : String(v));
        const tryParseNumber = (v: any) => {
            if (v === null || v === undefined) return NaN;
            // strip currency symbols and whitespace
            const cleaned = String(v).replace(/[^0-9+\-.,eE]/g, '').replace(/,/g, '.');
            const n = parseFloat(cleaned);
            return Number.isFinite(n) ? n : NaN;
        };

        // numbers first (including numeric-strings like '100' or '100.50' or '₪100')
        const aNum = tryParseNumber(aValue);
        const bNum = tryParseNumber(bValue);
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
        }

        // try dates (only if parse yields a valid timestamp)
        const aTime = new Date(toStr(aValue)).getTime();
        const bTime = new Date(toStr(bValue)).getTime();
        if (!isNaN(aTime) && !isNaN(bTime)) {
            return sortDirection === "asc" ? aTime - bTime : bTime - aTime;
        }

        // fallback to locale-aware string comparison (numeric-sensitive)
        const astr = toStr(aValue).trim();
        const bstr = toStr(bValue).trim();
        // Use Hebrew locale (if present) and numeric-aware compare to handle descriptions with numbers
        const cmp = astr.localeCompare(bstr, "he-IL", { numeric: true, sensitivity: "base" });
        return sortDirection === "asc" ? cmp : -cmp;
    });

    // אפשרות לעיבוד נוסף (למשל צבעים לפעולות)
    if (getActionType) {
        return sorted.map((item) => {
            const action = (item as any).action_type;
            return action ? { ...item, actionMeta: getActionType(action) } : item;
        });
    }

    return sorted;
}
