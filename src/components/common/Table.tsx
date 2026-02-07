import { Table as MantineTable } from "@mantine/core";
import type { ReactNode } from "react";

/**
 * Custom Table component wrapping Mantine Table
 * Provides consistent styling and structure for data tables
 */

export interface Column<T> {
  /** Column header label */
  header: string;
  /** Data accessor key or render function */
  accessor: keyof T | ((row: T, index: number) => ReactNode);
  /** Column width */
  width?: string | number;
  /** Text alignment */
  align?: "left" | "center" | "right";
}

export interface TableProps<T> {
  /** Table columns configuration */
  columns: Column<T>[];
  /** Table data */
  data: T[];
  /** Show striped rows */
  striped?: boolean;
  /** Highlight row on hover */
  highlightOnHover?: boolean;
  /** With border */
  withTableBorder?: boolean;
  /** With column borders */
  withColumnBorders?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Loading state */
  loading?: boolean;
  /** Custom row key accessor */
  getRowKey?: (row: T, index: number) => string | number;
}

/**
 * Common Table component
 * 
 * @example
 * ```tsx
 * <Table 
 *   columns={[
 *     { header: 'Name', accessor: 'name' },
 *     { header: 'Email', accessor: 'email' },
 *     { header: 'Actions', accessor: (row) => <Button>Edit</Button> }
 *   ]}
 *   data={customers}
 *   striped
 *   highlightOnHover
 * />
 * ```
 */
export function Table<T>({
  columns,
  data,
  striped = true,
  highlightOnHover = true,
  withTableBorder = true,
  withColumnBorders = false,
  emptyMessage = "No data available",
  loading = false,
  getRowKey = (_, index) => index,
}: TableProps<T>) {
  if (loading) {
    return <div>Loading...</div>;
  }

  if (data.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <MantineTable
      striped={striped}
      highlightOnHover={highlightOnHover}
      withTableBorder={withTableBorder}
      withColumnBorders={withColumnBorders}
    >
      <MantineTable.Thead>
        <MantineTable.Tr>
          {columns.map((column, index) => (
            <MantineTable.Th
              key={index}
              style={{
                width: column.width,
                textAlign: column.align || "left",
              }}
            >
              {column.header}
            </MantineTable.Th>
          ))}
        </MantineTable.Tr>
      </MantineTable.Thead>
      <MantineTable.Tbody>
        {data.map((row, rowIndex) => (
          <MantineTable.Tr key={getRowKey(row, rowIndex)}>
            {columns.map((column, colIndex) => {
              const value =
                typeof column.accessor === "function"
                  ? column.accessor(row, rowIndex)
                  : row[column.accessor];

              return (
                <MantineTable.Td
                  key={colIndex}
                  style={{ textAlign: column.align || "left" }}
                >
                  {value as ReactNode}
                </MantineTable.Td>
              );
            })}
          </MantineTable.Tr>
        ))}
      </MantineTable.Tbody>
    </MantineTable>
  );
}
