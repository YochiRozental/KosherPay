import { TableCell, TableSortLabel } from "@mui/material";

interface SortableTableCellProps<T extends string = string> {
  columnKey: T;
  currentSortColumn: T;
  currentSortDirection: "asc" | "desc";
  handleSort: (column: T, nextDirection?: "asc" | "desc") => void;
  label: string;
}

const SortableTableCell = <T extends string>({
  columnKey,
  currentSortColumn,
  currentSortDirection,
  handleSort,
  label,
}: SortableTableCellProps<T>) => {
  const isActive = currentSortColumn === columnKey;
  return (
    <TableCell
      align="center"
      onClick={() => {
          const next = isActive ? (currentSortDirection === "asc" ? "desc" : "asc") : "asc";
          handleSort(columnKey, next);
        }}
      sortDirection={isActive ? currentSortDirection : false}
      sx={{ cursor: "pointer", "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" } }}
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
