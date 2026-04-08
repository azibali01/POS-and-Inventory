import { Card, Text, Badge, Grid, Title, Table } from "@mantine/core";
import type { InventoryItem } from "../../Dashboard/Context/DataContext";
import { formatCurrency } from "../../lib/format-utils";

interface Props {
  product: InventoryItem;
}

export function ProductDetails({ product }: Props) {
  const variants = Array.isArray((product as { variants?: unknown[] }).variants)
    ? ((product as { variants?: Array<Record<string, unknown>> }).variants ??
      [])
    : [];

  return (
    <div>
      <Card>
        <Grid>
          <Grid.Col span={6}>
            <Text size="xs" c="dimmed">
              Item Name
            </Text>
            <Text fw={600} size="lg">
              {product.itemName || "-"}
            </Text>
          </Grid.Col>

          <Grid.Col span={6}>
            <Text size="xs" c="dimmed">
              Category
            </Text>
            <Badge size="lg" mt={4}>
              {product.category || "-"}
            </Badge>
          </Grid.Col>

          <Grid.Col span={6}>
            <Text size="xs" c="dimmed">
              Brand/Supplier
            </Text>
            <Text fw={600}>{product.brand || "-"}</Text>
          </Grid.Col>

          <Grid.Col span={6}>
            <Text size="xs" c="dimmed">
              Unit
            </Text>
            <Text fw={600}>{product.unit || "-"}</Text>
          </Grid.Col>

          <Grid.Col span={12}>
            <Text size="xs" c="dimmed">
              Description
            </Text>
            <Text fw={400}>
              {product.description || "No description provided"}
            </Text>
          </Grid.Col>

          <Grid.Col span={12} mt="md">
            <Title order={5} mb="sm">
              Product Variants
            </Title>

            {variants.length === 0 ? (
              <Text c="dimmed">No variants found</Text>
            ) : (
              <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>SKU</Table.Th>
                    <Table.Th>Thickness</Table.Th>
                    <Table.Th>Color</Table.Th>
                    <Table.Th>Length (ft)</Table.Th>
                    <Table.Th>Sales Rate</Table.Th>
                    <Table.Th>Available Stock</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {variants.map((variant, index) => (
                    <Table.Tr key={String(variant._id ?? variant.sku ?? index)}>
                      <Table.Td>{String(variant.sku ?? "-")}</Table.Td>
                      <Table.Td>{String(variant.thickness ?? "-")}</Table.Td>
                      <Table.Td>{String(variant.color ?? "-")}</Table.Td>
                      <Table.Td>{String(variant.length ?? "-")}</Table.Td>
                      <Table.Td>
                        {typeof variant.salesRate === "number"
                          ? formatCurrency(variant.salesRate)
                          : "-"}
                      </Table.Td>
                      <Table.Td>
                        {typeof variant.availableStock === "number"
                          ? String(variant.availableStock)
                          : typeof variant.openingStock === "number"
                            ? String(variant.openingStock)
                            : "-"}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Grid.Col>
        </Grid>
      </Card>
    </div>
  );
}
