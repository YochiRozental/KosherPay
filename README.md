# KosherPay

## Table sorting

This project uses a single reusable `DataTable` component located at `src/components/tables/DataTable.tsx`.

New sorting behavior (professional, accessible & flexible):

- Columns that are plain data columns (have a `key`) can become clickable sorting headers.
- Sorting supports both controlled and uncontrolled modes:
	- Controlled: pass `sortColumn`, `sortDirection` and `onSort` from parent (e.g. central hook) and the table will use those values.
	- Uncontrolled: pass `sortable` and optionally an `initialSort` ({ column, direction }) and the table manages its own sort state.
- Clicking a header follows this behavior: first click → ascending (low → high), second click → descending (high → low), third → ascending etc.

Example usage (controlled — used for transactions):

```tsx
const { sortedAndFiltered, sortColumn, sortDirection, handleSort } = useTransactionFilter(...);

<TransactionTable
	rows={sortedAndFiltered}
	getActionType={...}
	sortColumn={sortColumn}
	sortDirection={sortDirection}
	// NOTE: DataTable will call onSort(column, nextDirection) — the hook accepts that signature
	onSort={handleSort}
/
```

Example usage (uncontrolled — local table):

```tsx
<DataTable columns={columns} rows={data} sortable initialSort={{ column: 'date', direction: 'desc' }} />
```

The `SortableTableCell` component is in `src/components/filters/SortableTableCell.tsx` and is used internally by `DataTable` to render the header UI (based on MUI's `TableSortLabel`).

