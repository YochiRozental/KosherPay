import { Box, Chip, Typography } from "@mui/material";

import DataTable from "./DataTable";
import { colors } from "../../theme/designTokens";

import type { Transaction } from "../../types";

interface TransactionTableProps {
  rows: Transaction[];
  getActionType: (actionType: string) => { label: string; color: string };
  onRowClick?: (tx: Transaction) => void;
  sortColumn?: keyof Transaction | null;
  sortDirection?: "asc" | "desc" | null;
  onSort?: (column: keyof Transaction, nextDirection: "asc" | "desc") => void;
}

const badgeStyles: Record<string, { bg: string; fg: string; dot: string }> = {
  primary: { bg: colors.accentSoft, fg: colors.primary, dot: colors.primary },
  success: { bg: "rgba(22, 163, 74, 0.12)", fg: "#15803D", dot: colors.success },
  error: { bg: "rgba(220, 38, 38, 0.10)", fg: colors.dangerText, dot: colors.danger },
  warning: { bg: "rgba(245, 158, 11, 0.14)", fg: "#92400E", dot: colors.warning },
  info: { bg: "rgba(130, 152, 181, 0.16)", fg: colors.textSecondary, dot: colors.muted },
};

const formatAmount = (raw: string) => {
  const n = parseFloat(String(raw).replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(n)) return `${raw} ₪`;
  return Math.abs(n).toLocaleString("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 2,
  });
};

export default function TransactionTable({
  rows,
  getActionType,
  onRowClick,
  sortColumn,
  sortDirection,
  onSort,
}: TransactionTableProps) {

  const columns = [
    {
      key: "transaction_date" as keyof Transaction,
      label: "תאריך",
      align: "right" as const,
      render: (v: any) => {
        const date = new Date(v);
        if (isNaN(date.getTime())) return String(v ?? "—");
        return (
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>
              {date.toLocaleDateString("he-IL", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </Typography>
            <Typography sx={{ fontSize: 12, color: colors.muted }}>
              {date.toLocaleTimeString("he-IL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          </Box>
        );
      },
    },
    {
      key: "action_type" as keyof Transaction,
      label: "סוג פעולה",
      align: "center" as const,
      render: (v: any) => {
        const { label, color } = getActionType(v);
        const style = badgeStyles[color] ?? badgeStyles.info;
        return (
          <Chip
            label={label}
            size="small"
            icon={
              <Box
                component="span"
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  bgcolor: style.dot,
                  mr: 0.5,
                }}
              />
            }
            sx={{
              bgcolor: style.bg,
              color: style.fg,
              fontWeight: 600,
              fontSize: 12.5,
              borderRadius: "8px",
              px: 0.5,
              "& .MuiChip-icon": { color: "inherit" },
            }}
          />
        );
      },
    },
    {
      key: "counterparty" as keyof Transaction,
      label: "נמען",
      align: "right" as const,
      render: (v: any) =>
        v ? (
          <Box
            component="span"
            sx={{
              display: "inline-block",
              maxWidth: 160,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              verticalAlign: "middle",
              fontWeight: 600,
              color: colors.textPrimary,
              unicodeBidi: "plaintext",
            }}
            title={String(v)}
          >
            {v}
          </Box>
        ) : (
          <span style={{ color: colors.muted }}>—</span>
        ),
    },
    {
      key: "description" as keyof Transaction,
      label: "תיאור",
      align: "right" as const,
      render: (v: any) =>
        v ? (
          <span
            title={String(v)}
            style={{
              display: "inline-block",
              maxWidth: 240,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              verticalAlign: "middle",
              color: colors.textSecondary,
            }}
          >
            {v}
          </span>
        ) : (
          <span style={{ color: colors.muted }}>—</span>
        ),
    },
    {
      key: "amount" as keyof Transaction,
      label: "סכום",
      align: "left" as const,
      render: (v: any, row: Transaction) => {
        const t = String(row.action_type ?? "").toLowerCase();

        const isCredit = t === "deposit";

        const isDebit = t === "withdraw" || t === "transfer";

        const amountColor = isCredit
          ? "#15803D"
          : isDebit
            ? colors.dangerText
            : colors.textPrimary;
        const prefix = isCredit ? "+" : isDebit ? "-" : "";

        return (
          <Box
            component="span"
            sx={{
              direction: "ltr",
              display: "inline-block",
              color: amountColor,
              fontWeight: 700,
              fontSize: 14.5,
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            }}
          >
            {prefix}
            {formatAmount(v)}
          </Box>
        );
      },
    }
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      sortable
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      onSort={onSort}
      emptyMessage="אין תנועות להצגה"
      onRowClick={onRowClick}
    />
  );
}
