import { TableCell, TableSortLabel } from "@mui/material";

import { colors } from "../../theme/designTokens";

type Align = "left" | "center" | "right";

interface SortableTableCellProps<T extends string = string> {
  columnKey: T;
  currentSortColumn: T;
  currentSortDirection: "asc" | "desc";
  handleSort: (column: T, nextDirection?: "asc" | "desc") => void;
  label: string;
  align?: Align;
}

const SortableTableCell = <T extends string>({
  columnKey,
  currentSortColumn,
  currentSortDirection,
  handleSort,
  label,
  align = "center",
}: SortableTableCellProps<T>) => {
  const isActive = currentSortColumn === columnKey;

  return (
    <TableCell
      align={align}
      onClick={() => {
        const next = isActive
          ? currentSortDirection === "asc"
            ? "desc"
            : "asc"
          : "asc";
        handleSort(columnKey, next);
      }}
      sortDirection={isActive ? currentSortDirection : false}
      sx={{
        cursor: "pointer",
        transition: "background-color 150ms ease",
        "&:hover": { backgroundColor: "rgba(23, 60, 108, 0.06)" },
        "& .MuiTableSortLabel-root": {
          color: "inherit",
          "&:hover": { color: colors.primaryHover },
          "&.Mui-active": { color: colors.primary },
        },
        "& .MuiTableSortLabel-icon": {
          color: `${colors.gold} !important`,
        },
      }}
    >
      <TableSortLabel
        active={isActive}
        direction={isActive ? currentSortDirection : "asc"}
        hideSortIcon={!isActive}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );
};

export default SortableTableCell;
