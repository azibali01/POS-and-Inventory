import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Group,
  Pagination,
  SimpleGrid,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import {
  inventoryService,
  type StockValuationReport,
  type StockValuationRow,
} from "../../../api/services/inventoryService";
import { formatCurrency } from "../../../lib/format-utils";

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString();
}

export default function StockValuation() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const valuationQuery = useQuery<StockValuationReport>({
    queryKey: ["stock-valuation-report"],
    queryFn: (): Promise<StockValuationReport> =>
      inventoryService.getValuationReport(),
    staleTime: 60_000,
  });

  const report: StockValuationReport | null = valuationQuery.data ?? null;

  const filteredRows: StockValuationRow[] = useMemo(() => {
    const rows = report?.rows ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((row: StockValuationRow) => {
      const variant =
        `${row.color} ${row.thickness} ${row.length}`.toLowerCase();
      return (
        row.productName.toLowerCase().includes(q) ||
        row.brand.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q) ||
        row.sku.toLowerCase().includes(q) ||
        variant.includes(q)
      );
    });
  }, [report?.rows, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));

  const paginatedRows: StockValuationRow[] = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, currentPage, itemsPerPage]);

  return (
    <div>
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Stock Valuation Report</Title>
          <Text c="dimmed" size="sm">
            Bird&apos;s-eye view of inventory quantity, running feet, and total
            value
          </Text>
        </div>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="md">
        <Card withBorder>
          <Text c="dimmed" size="sm">
            Total Items (Pcs)
          </Text>
          <Title order={3}>
            {formatNumber(report?.summary.totalItems ?? 0)}
          </Title>
        </Card>
        <Card withBorder>
          <Text c="dimmed" size="sm">
            Total Running Feet (ft)
          </Text>
          <Title order={3}>
            {formatNumber(report?.summary.totalRunningFeet ?? 0)}
          </Title>
        </Card>
        <Card withBorder>
          <Text c="dimmed" size="sm">
            Total Inventory Value (Rs.)
          </Text>
          <Title order={3}>
            {formatCurrency(report?.summary.totalInventoryValue ?? 0)}
          </Title>
        </Card>
      </SimpleGrid>

      <Card withBorder>
        <Group justify="space-between" mb="sm">
          <TextInput
            placeholder="Search by product, brand, category, SKU, or variant..."
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
              setCurrentPage(1);
            }}
            leftSection={<IconSearch size={16} />}
            style={{ flex: 1, maxWidth: 460 }}
          />
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              Rows per page
            </Text>
            <TextInput
              value={String(itemsPerPage)}
              onChange={(event) => {
                const next = Number(event.currentTarget.value || 25);
                setItemsPerPage(Number.isFinite(next) && next > 0 ? next : 25);
                setCurrentPage(1);
              }}
              style={{ width: 80 }}
            />
          </Group>
        </Group>

        {valuationQuery.isLoading ? (
          <Text c="dimmed">Loading valuation report...</Text>
        ) : valuationQuery.isError ? (
          <Text c="red">Failed to load stock valuation report.</Text>
        ) : (
          <>
            <Table
              withColumnBorders
              withRowBorders
              withTableBorder
              striped
              highlightOnHover
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Product</Table.Th>
                  <Table.Th>Variant (Color/Thick/Length)</Table.Th>
                  <Table.Th>Brand</Table.Th>
                  <Table.Th>Stock</Table.Th>
                  <Table.Th>Total Feet</Table.Th>
                  <Table.Th>Value</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginatedRows.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Text c="dimmed">No valuation rows found.</Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  paginatedRows.map((row) => (
                    <Table.Tr key={`${row.productId}-${row.sku}`}>
                      <Table.Td>{row.productName}</Table.Td>
                      <Table.Td>{`${row.color} / ${row.thickness} / ${row.length}`}</Table.Td>
                      <Table.Td>{row.brand || "-"}</Table.Td>
                      <Table.Td>{formatNumber(row.availableStock)}</Table.Td>
                      <Table.Td>{formatNumber(row.totalFeet)}</Table.Td>
                      <Table.Td>{formatCurrency(row.inventoryValue)}</Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>

            {filteredRows.length > itemsPerPage ? (
              <Group justify="center" mt="md">
                <Pagination
                  value={currentPage}
                  onChange={setCurrentPage}
                  total={totalPages}
                  withEdges
                />
              </Group>
            ) : null}
          </>
        )}
      </Card>
    </div>
  );
}
