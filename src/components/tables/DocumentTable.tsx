/**
 * Reusable table component for document listings
 * Used across Purchase Orders, Invoices, Sales, Quotations, etc.
 */

import { ActionIcon, Menu, Text } from "@mantine/core";
import { IconEdit, IconTrash, IconPrinter, IconDots } from "@tabler/icons-react";
import Table from "../../lib/AppTable";

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  width?: string;
}

export interface DocumentTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onPrint?: (row: T) => void;
  onRowClick?: (row: T) => void;
  keyExtractor: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
}

/**
 * Generic document table component with built-in actions
 * Supports edit, delete, print operations with menu dropdown
 */
export function DocumentTable<T>({
  data,
  columns,
  onEdit,
  onDelete,
  onPrint,
  onRowClick,
  keyExtractor,
  loading = false,
  emptyMessage = "No records found",
}: DocumentTableProps<T>) {
  if (loading) {
    return <Text c="dimmed">Loading...</Text>;
  }

  if (!data || data.length === 0) {
    return <Text c="dimmed">{emptyMessage}</Text>;
  }

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          {columns.map((col) => (
            <Table.Th key={col.key} style={{ width: col.width }}>
              {col.label}
            </Table.Th>
          ))}
          {(onEdit || onDelete || onPrint) && <Table.Th>Actions</Table.Th>}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {data.map((row) => (
          <Table.Tr
            key={keyExtractor(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            style={onRowClick ? { cursor: "pointer" } : undefined}
          >
            {columns.map((col) => (
              <Table.Td key={col.key}>
                {col.render
                  ? col.render(row)
                  : String((row as Record<string, unknown>)[col.key] ?? "")}
              </Table.Td>
            ))}
            {(onEdit || onDelete || onPrint) && (
              <Table.Td>
                <Menu position="bottom-end">
                  <Menu.Target>
                    <ActionIcon variant="subtle" onClick={(e) => e.stopPropagation()}>
                      <IconDots size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {onEdit && (
                      <Menu.Item
                        leftSection={<IconEdit size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(row);
                        }}
                      >
                        Edit
                      </Menu.Item>
                    )}
                    {onPrint && (
                      <Menu.Item
                        leftSection={<IconPrinter size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPrint(row);
                        }}
                      >
                        Print
                      </Menu.Item>
                    )}
                    {onDelete && (
                      <Menu.Item
                        leftSection={<IconTrash size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(row);
                        }}
                        color="red"
                      >
                        Delete
                      </Menu.Item>
                    )}
                  </Menu.Dropdown>
                </Menu>
              </Table.Td>
            )}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
