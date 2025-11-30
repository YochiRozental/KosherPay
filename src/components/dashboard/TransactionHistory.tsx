import { Box, CircularProgress, Typography } from "@mui/material";
import FilterBar from "../filters/FilterBar";
import { useTransactionFilter } from "../filters/useTransactionFilter";
import TransactionTable from "../tables/TransactionTable";
import type { User } from "../../types";

export default function TransactionHistory({ user }: { user: User }) {
  const {
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
    <Box sx={{ direction: "rtl" }}>
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
