import { Chip } from "@mui/material";
import DataTable from "./DataTable";
import { formatDateTime } from "../filters/utils/dateUtils";
import type { Transaction } from "../../types";

interface TransactionTableProps {
  rows: Transaction[];
  getActionType: (actionType: string) => { label: string; color: string };
  onRowClick?: (tx: Transaction) => void;
  sortColumn?: keyof Transaction | null;
  sortDirection?: "asc" | "desc" | null;
  onSort?: (column: keyof Transaction, nextDirection: "asc" | "desc") => void;
}

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
      render: (v: any) => formatDateTime(v),
    },
    {
      key: "action_type" as keyof Transaction,
      label: "סוג פעולה",
      render: (v: any) => {
        const { label, color } = getActionType(v);
        return <Chip label={label} color={color as any} size="small" variant="outlined" />;
      },
    },
    {
      key: "description" as keyof Transaction,
      label: "תיאור",
      render: (v: any) => (
        <span style={{ display: "inline-block", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
          {v}
        </span>
      ),
    },
    {
      key: "amount" as keyof Transaction,
      label: "סכום",
      render: (v: any, row: Transaction) => {
        const { color } = getActionType(row.action_type);
        const isCredit = color === "primary" || color === "warning";
        const amountColor = isCredit ? 'green' : 'red';
        const prefix = isCredit ? "+" : "-";
        return (
          <span style={{ color: amountColor, fontWeight: "bold", direction: "ltr" }}>
            {prefix} {v} ₪
          </span>
        );
      },
    },
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
