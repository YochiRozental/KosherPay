import React, { useMemo, useState } from "react";

import { InboxOutlined } from "@mui/icons-material";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Box,
  Typography,
} from "@mui/material";

import { colors, radius, shadows } from "../../theme/designTokens";
import SortableTableCell from "../filters/SortableTableCell";

// --- Types & Interfaces ---

type Align = "left" | "center" | "right";

interface DataColumn<T> {
  key: keyof T;
  label: string;
  align?: Align;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface VirtualColumn<T> {
  key?: string;
  label: string;
  align?: Align;
  render: (value: undefined, row: T) => React.ReactNode;
}

export type Column<T> = DataColumn<T> | VirtualColumn<T>;

export interface DataTableProps<T extends Record<string, any>> {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  sortable?: boolean;
  sortColumn?: keyof T | null;
  sortDirection?: "asc" | "desc" | null;
  onSort?: (column: keyof T, nextDirection: "asc" | "desc") => void;
  initialSort?: { column?: keyof T; direction?: "asc" | "desc" };
}

// --- Helpers ---

function isDataColumn<T>(col: Column<T>): col is DataColumn<T> {
  return typeof col.key !== "undefined" && !!(col as DataColumn<T>).key;
}

// --- Main Component ---

export default function DataTable<T extends Record<string, any>>({
  columns,
  rows,
  emptyMessage = "אין נתונים להצגה",
  onRowClick,
  sortable = false,
  sortColumn,
  sortDirection,
  onSort,
  initialSort,
}: DataTableProps<T>) {
  // 1. Hooks (חייבים להיות תמיד בראש הפונקציה)
  const [internalSortColumn, setInternalSortColumn] = useState<keyof T | null>(
    initialSort?.column ?? null,
  );
  const [internalSortDirection, setInternalSortDirection] = useState<
    "asc" | "desc"
  >(initialSort?.direction ?? "asc");

  // קביעת המצב הפעיל (Controlled vs Uncontrolled)
  const activeSortColumn =
    sortColumn !== undefined ? (sortColumn ?? null) : internalSortColumn;
  const activeSortDirection =
    sortDirection !== undefined
      ? (sortDirection ?? null)
      : internalSortDirection;

  // לוגיקת המיון
  const displayedRows = useMemo(() => {
    if (!activeSortColumn || !rows.length) return rows;

    return [...rows].sort((a, b) => {
      const aValue = a[activeSortColumn];
      const bValue = b[activeSortColumn];

      const toStr = (v: any) =>
        v === null || v === undefined ? "" : String(v);

      const tryParseNumber = (v: any) => {
        if (v === null || v === undefined) return NaN;
        const cleaned = String(v)
          .replace(/[^0-9+\-.,eE]/g, "")
          .replace(/,/g, ".");
        const n = parseFloat(cleaned);
        return Number.isFinite(n) ? n : NaN;
      };

      // מיון מספרי
      const aNum = tryParseNumber(aValue);
      const bNum = tryParseNumber(bValue);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return activeSortDirection === "asc" ? aNum - bNum : bNum - aNum;
      }

      // מיון תאריכים
      const aTime = new Date(toStr(aValue)).getTime();
      const bTime = new Date(toStr(bValue)).getTime();
      if (!isNaN(aTime) && !isNaN(bTime)) {
        return activeSortDirection === "asc" ? aTime - bTime : bTime - aTime;
      }

      // מיון טקסטואלי (עברית/אנגלית)
      const astr = toStr(aValue).trim();
      const bstr = toStr(bValue).trim();
      const cmp = astr.localeCompare(bstr, "he-IL", {
        numeric: true,
        sensitivity: "base",
      });
      return activeSortDirection === "asc" ? cmp : -cmp;
    });
  }, [rows, activeSortColumn, activeSortDirection]);

  // 2. פונקציות עזר לטיפול באירועים
  const handleSortRequest = (
    column: keyof T,
    nextDirection?: "asc" | "desc",
  ) => {
    const isSame = activeSortColumn === column;
    const computedNext =
      nextDirection ??
      (isSame ? (activeSortDirection === "asc" ? "desc" : "asc") : "asc");

    if (onSort) {
      onSort(column, computedNext);
    } else {
      setInternalSortColumn(column);
      setInternalSortDirection(computedNext);
    }
  };

  // 3. תנאי יציאה מוקדמת (חייב לבוא אחרי ה-Hooks)
  if (!rows.length) {
    return (
      <Box
        sx={{
          py: 6,
          px: 3,
          textAlign: "center",
          backgroundColor: colors.surface,
          borderRadius: radius.card,
          border: "1px dashed rgba(23, 60, 108, 0.35)",
        }}
      >
        <InboxOutlined sx={{ fontSize: 44, color: colors.muted, mb: 1 }} />
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>
          {emptyMessage}
        </Typography>
        <Typography sx={{ fontSize: 13.5, color: colors.textSecondary, mt: 0.5 }}>
          נתונים חדשים יופיעו כאן ברגע שיהיו זמינים
        </Typography>
      </Box>
    );
  }

  const Wrapper = Paper as React.ElementType;

  return (
    <Wrapper
      elevation={0}
      sx={{
        overflow: "hidden",
        direction: "rtl",
        borderRadius: radius.card,
        boxShadow: shadows.md,
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.surface,
      }}
    >
      <Box sx={{ overflowX: "auto" }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow
            sx={{
              "& th": {
                backgroundColor: "#F0F4F9",
                color: colors.primary,
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "0.02em",
                py: 1.75,
                borderBottom: "1px solid rgba(23, 60, 108, 0.14)",
              },
            }}
          >
            {columns.map((col, i) => {
              const keyStr = col.key ? String(col.key) : `col-${i}`;

              if (
                isDataColumn<T>(col) &&
                (sortable || sortColumn !== undefined || onSort)
              ) {
                return (
                  <SortableTableCell
                    key={keyStr}
                    columnKey={String(col.key)}
                    currentSortColumn={
                      activeSortColumn ? String(activeSortColumn) : ""
                    }
                    currentSortDirection={activeSortDirection ?? "asc"}
                    handleSort={(_colKey, nextDir) =>
                      handleSortRequest(col.key, nextDir)
                    }
                    label={col.label}
                    align={col.align || "center"}
                  />
                );
              }

              return (
                <TableCell key={keyStr} align={col.align || "center"}>
                  {col.label}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>

        <TableBody>
          {displayedRows.map((row, i) => (
            <TableRow
              key={i}
              sx={{
                transition: "background-color 150ms ease",
                "& td": {
                  py: 1.75,
                  fontSize: 14.5,
                  color: colors.textPrimary,
                  borderBottom: "1px solid rgba(23, 60, 108, 0.10)",
                },
                "&:last-of-type td": { borderBottom: "none" },
                "&:hover": {
                  backgroundColor: colors.accentSoft,
                  cursor: onRowClick ? "pointer" : "default",
                },
              }}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col, j) => {
                if (isDataColumn(col)) {
                  const value = row[col.key];
                  const content =
                    col.render?.(value, row) ??
                    (typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value ?? ""));

                  return (
                    <TableCell
                      key={String(col.key)}
                      align={col.align || "center"}
                    >
                      {content}
                    </TableCell>
                  );
                }

                return (
                  <TableCell key={`virtual-${j}`} align={col.align || "center"}>
                    {col.render(undefined, row)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </Box>
    </Wrapper>
  );
}
