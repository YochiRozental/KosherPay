import { useEffect, useMemo, useState } from "react";

import {
  AccountBalanceWalletOutlined,
  ErrorOutline,
  ReceiptLongOutlined,
  TrendingDownRounded,
  TrendingUpRounded,
} from "@mui/icons-material";
import { Box, Paper, Skeleton, Typography } from "@mui/material";
import dayjs from "dayjs";

import SummaryCard, { summaryGridSx } from "./SummaryCard";
import * as api from "../../api/paymentsApi";
import { colors, radius } from "../../theme/designTokens";
import FilterBar from "../filters/FilterBar";
import { useTransactionFilter } from "../filters/useTransactionFilter";
import TransactionTable from "../tables/TransactionTable";

import type { UserMe } from "../../types";

const formatILS = (n: number) =>
  n.toLocaleString("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 2,
  });

const parseAmount = (raw: string) => {
  const n = parseFloat(String(raw).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? Math.abs(n) : 0;
};

const classifyFlow = (actionType: string): "credit" | "debit" | "other" => {
  const t = String(actionType ?? "").toLowerCase();
  if (t.includes("deposit") || t.includes("received")) return "credit";
  if (t.includes("withdraw") || t.includes("transfer") || t.includes("payment"))
    return "debit";
  return "other";
};

export default function TransactionHistory({ user }: { user: UserMe }) {
  const {
    history,
    sortedAndFiltered,
    loading,
    error,
    filter,
    setFilter,
    customStartDate,
    customEndDate,
    setCustomStartDate,
    setCustomEndDate,
    getActionType,
    sortColumn,
    sortDirection,
    handleSort,
  } = useTransactionFilter(user);

  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setBalanceLoading(true);
    api
      .getBalance()
      .then((res) => {
        if (active) setBalance(Number((res as any).balance) || 0);
      })
      .catch(() => {
        if (active) setBalance(null);
      })
      .finally(() => {
        if (active) setBalanceLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user.phone, user.id]);

  const monthly = useMemo(() => {
    const monthStart = dayjs().startOf("month");
    let income = 0;
    let expenses = 0;
    history.forEach((tx) => {
      const date = dayjs(tx.transaction_date);
      if (!date.isValid() || date.isBefore(monthStart)) return;
      const amount = parseAmount(tx.amount);
      const flow = classifyFlow(tx.action_type);
      if (flow === "credit") income += amount;
      else if (flow === "debit") expenses += amount;
    });
    return { income, expenses };
  }, [history]);

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
        <Skeleton
          variant="rounded"
          height={104}
          sx={{ borderRadius: radius.card, mb: 3 }}
        />
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

  return (
    <Box sx={{ direction: "rtl" }}>
      <Box sx={summaryGridSx}>
        <SummaryCard
          featured
          label="יתרה נוכחית"
          value={balance === null ? "—" : formatILS(balance)}
          caption="מעודכן לרגע זה"
          loading={balanceLoading}
          icon={<AccountBalanceWalletOutlined sx={{ color: colors.gold, fontSize: 22 }} />}
          iconBg="rgba(255, 255, 255, 0.14)"
        />
        <SummaryCard
          label="הכנסות החודש"
          value={formatILS(monthly.income)}
          caption="מתחילת החודש הנוכחי"
          icon={<TrendingUpRounded sx={{ color: "#15803D", fontSize: 22 }} />}
          iconBg="rgba(22, 163, 74, 0.12)"
        />
        <SummaryCard
          label="הוצאות החודש"
          value={formatILS(monthly.expenses)}
          caption="מתחילת החודש הנוכחי"
          icon={<TrendingDownRounded sx={{ color: colors.dangerText, fontSize: 22 }} />}
          iconBg="rgba(220, 38, 38, 0.10)"
        />
        <SummaryCard
          label="תנועות בתקופה"
          value={sortedAndFiltered.length.toLocaleString("he-IL")}
          caption="לפי הסינון הנוכחי"
          icon={<ReceiptLongOutlined sx={{ color: colors.primary, fontSize: 22 }} />}
          iconBg={colors.accentSoft}
        />
      </Box>

      <FilterBar
        filter={filter}
        onFilterChange={setFilter}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onCustomDateChange={(start, end) => {
          setCustomStartDate(start);
          setCustomEndDate(end);
        }}
      />
      <TransactionTable
        rows={sortedAndFiltered}
        getActionType={getActionType}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
    </Box>
  );
}
