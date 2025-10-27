import {
  Card,
  Group,
  Text,
  Title,
  Badge,
  Box,
  Grid,
  Tabs,
  ScrollArea,
} from "@mantine/core";
import Table from "../../../lib/AppTable";
import {
  IconAlertTriangle,
  IconPackage,
  IconPackageExport,
} from "@tabler/icons-react";

import { useDataContext } from "../../Context/DataContext";
import type { InventoryItem } from "../../Context/DataContext";

function formatNumber(n: number) {
  return n.toLocaleString();
}

export default function StockReportPage() {
  const { inventory } = useDataContext();

  const products: InventoryItem[] = inventory;

  const lowStockItems = products.filter(
    (p) => p.stock <= p.minStock && p.stock > 0
  );
  const negativeStockItems = products.filter((p) => p.stock < 0);
  const inStockItems = products.filter((p) => p.stock > p.minStock);

  return (
    <div>
      <Box mb="md">
        <Title order={2}>Stock Report</Title>
        <Text color="dimmed">Monitor inventory levels and stock status</Text>
      </Box>

      <Grid gutter="md" mb="md">
        <Grid.Col span={4}>
          <Card>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={600} c="dimmed">
                In Stock
              </Text>
              <IconPackage size={18} />
            </Group>
            <Text fw={700} size="xl">
              {inStockItems.length}
            </Text>
            <Text size="xs" color="dimmed">
              Items above minimum level
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={4}>
          <Card>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={600} c="dimmed">
                Low Stock
              </Text>
              <IconAlertTriangle size={18} />
            </Group>
            <Text fw={700} size="xl">
              {lowStockItems.length}
            </Text>
            <Text size="xs" color="dimmed">
              Items below minimum level
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={4}>
          <Card>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={600} c="dimmed">
                Negative Stock
              </Text>
              <IconPackageExport size={18} />
            </Group>
            <Text fw={700} size="xl">
              {negativeStockItems.length}
            </Text>
            <Text size="xs" color="dimmed">
              Items with minus balance
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      <Tabs defaultValue="all">
        <Tabs.List>
          <Tabs.Tab value="all">All Items ({products.length})</Tabs.Tab>
          <Tabs.Tab value="low">Low Stock ({lowStockItems.length})</Tabs.Tab>
          <Tabs.Tab value="negative">
            Negative ({negativeStockItems.length})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="all" pt="md">
          <Card>
            <Card.Section>
              <Box p="md">
                <Text size="lg" fw={600} mb="xs">
                  All Products
                </Text>
                <Text size="sm" color="dimmed">
                  Complete inventory stock report
                </Text>
              </Box>
            </Card.Section>
            <Card.Section>
              <ScrollArea>
                <Table verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Item Code</Table.Th>
                      <Table.Th>Item Name</Table.Th>
                      <Table.Th>Category</Table.Th>
                      <Table.Th style={{ textAlign: "right" }}>
                        Current Stock
                      </Table.Th>
                      <Table.Th style={{ textAlign: "right" }}>
                        Min. Level
                      </Table.Th>
                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {products.map((product) => (
                      <Table.Tr key={product.id}>
                        <Table.Td style={{ fontFamily: "monospace" }}>
                          {product.code || product.sku}
                        </Table.Td>
                        <Table.Td>{product.name}</Table.Td>
                        <Table.Td>
                          <Badge>{product.category}</Badge>
                        </Table.Td>
                        <Table.Td
                          style={{ textAlign: "right", fontWeight: 600 }}
                        >
                          {formatNumber(product.stock)} {product.unit}
                        </Table.Td>
                        <Table.Td style={{ textAlign: "right", color: "#666" }}>
                          {formatNumber(product.minStock)} {product.unit}
                        </Table.Td>
                        <Table.Td>
                          {product.stock < 0 ? (
                            <Badge color="red">Negative</Badge>
                          ) : product.stock <= product.minStock ? (
                            <Badge color="yellow">Low Stock</Badge>
                          ) : (
                            <Badge color="green">In Stock</Badge>
                          )}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Card.Section>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="low" pt="md">
          <Card>
            <Card.Section>
              <Box p="md">
                <Text size="lg" fw={600} mb="xs">
                  Low Stock Items
                </Text>
                <Text size="sm" c="dimmed">
                  Items below minimum stock level
                </Text>
              </Box>
            </Card.Section>
            <Card.Section>
              <ScrollArea>
                <Table verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Item Code</Table.Th>
                      <Table.Th>Item Name</Table.Th>
                      <Table.Th>Category</Table.Th>
                      <Table.Th style={{ textAlign: "right" }}>
                        Current Stock
                      </Table.Th>
                      <Table.Th style={{ textAlign: "right" }}>
                        Min. Level
                      </Table.Th>
                      <Table.Th style={{ textAlign: "right" }}>
                        Shortfall
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {lowStockItems.map((product) => (
                      <Table.Tr key={product.id}>
                        <Table.Td style={{ fontFamily: "monospace" }}>
                          {product.code || product.sku}
                        </Table.Td>
                        <Table.Td>{product.name}</Table.Td>
                        <Table.Td>
                          <Badge>{product.category}</Badge>
                        </Table.Td>
                        <Table.Td
                          style={{
                            textAlign: "right",
                            color: "#c92a2a",
                            fontWeight: 600,
                          }}
                        >
                          {formatNumber(product.stock)} {product.unit}
                        </Table.Td>
                        <Table.Td style={{ textAlign: "right", color: "#666" }}>
                          {formatNumber(product.minStock)} {product.unit}
                        </Table.Td>
                        <Table.Td
                          style={{
                            textAlign: "right",
                            color: "#c92a2a",
                            fontWeight: 600,
                          }}
                        >
                          {formatNumber(product.minStock - product.stock)}{" "}
                          {product.unit}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Card.Section>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="negative" pt="md">
          <Card>
            <Card.Section>
              <Box p="md">
                <Text size="lg" fw={600} mb="xs">
                  Negative Stock Items
                </Text>
                <Text size="sm" c="dimmed">
                  Items with minus stock balance - requires immediate attention
                </Text>
              </Box>
            </Card.Section>
            <Card.Section>
              <ScrollArea>
                <Table verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Item Code</Table.Th>
                      <Table.Th>Item Name</Table.Th>
                      <Table.Th>Category</Table.Th>
                      <Table.Th style={{ textAlign: "right" }}>
                        Current Stock
                      </Table.Th>
                      <Table.Th style={{ textAlign: "right" }}>
                        Min. Level
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {negativeStockItems.map((product) => (
                      <Table.Tr key={product.id}>
                        <Table.Td style={{ fontFamily: "monospace" }}>
                          {product.code || product.sku}
                        </Table.Td>
                        <Table.Td>{product.name}</Table.Td>
                        <Table.Td>
                          <Badge>{product.category}</Badge>
                        </Table.Td>
                        <Table.Td
                          style={{
                            textAlign: "right",
                            color: "#c92a2a",
                            fontWeight: 600,
                          }}
                        >
                          {formatNumber(product.stock)} {product.unit}
                        </Table.Td>
                        <Table.Td style={{ textAlign: "right", color: "#666" }}>
                          {formatNumber(product.minStock)} {product.unit}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Card.Section>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
