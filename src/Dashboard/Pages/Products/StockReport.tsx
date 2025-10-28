import React from "react";
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

function formatNumber(n: number | undefined) {
  if (n === undefined || n === null || isNaN(n)) {
    return "0";
  }
  return n.toLocaleString();
}

export default function StockReportPage() {
  const { inventory, loadInventory } = useDataContext();

  // Clear any stored mock data and use real inventory data
  React.useEffect(() => {
    // Clear mock data from localStorage
    localStorage.removeItem('dev-mock-inventory');
    localStorage.setItem('dev-use-mock-data', 'false');
    
    // Load real inventory data
    if (typeof loadInventory === 'function') {
      loadInventory().catch(() => {
        console.warn("Failed to load inventory data");
      });
    }
  }, [loadInventory]);

  // Use real inventory data (this will include products created/updated in ProductMaster)
  const products: InventoryItem[] = inventory;
  
  console.log("StockReport - Using real inventory data:", products.length, "items");

  // Get stock value - prioritize openingStock for new products, then stock for updated products
  const getStockValue = (p: InventoryItem) => {
    const stock = p.openingStock ?? p.stock ?? 0;
    return typeof stock === 'number' ? stock : 0;
  };
  
  const lowStockItems = products.filter(
    (p) => getStockValue(p) <= (p.minimumStockLevel || 0) && getStockValue(p) > 0
  );
  const negativeStockItems = products.filter((p) => getStockValue(p) < 0);
  const inStockItems = products.filter((p) => getStockValue(p) > (p.minimumStockLevel || 0));

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
                      <Table.Th>Sr No.</Table.Th>
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
                    {products.map((product, index) => (
                      <Table.Tr key={product.id}>
                        <Table.Td style={{ fontFamily: "monospace" }}>
                          {index + 1}
                        </Table.Td>
                        <Table.Td>{product.name}</Table.Td>
                        <Table.Td>
                          <Badge>{product.category}</Badge>
                        </Table.Td>
                        <Table.Td
                          style={{ textAlign: "right", fontWeight: 600 }}
                        >
                          {formatNumber(product.openingStock ?? product.stock)}
                        </Table.Td>
                        <Table.Td style={{ textAlign: "right", color: "#666" }}>
                          {formatNumber(product.minimumStockLevel)}
                        </Table.Td>
                        <Table.Td>
                          {getStockValue(product) < 0 ? (
                            <Badge color="red">Negative</Badge>
                          ) : getStockValue(product) <= (product.minimumStockLevel || 0) ? (
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
                      <Table.Th>Sr No.</Table.Th>
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
                    {lowStockItems.map((product, index) => (
                      <Table.Tr key={product.id}>
                        <Table.Td style={{ fontFamily: "monospace" }}>
                          {index + 1}
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
                          {formatNumber(getStockValue(product))}
                        </Table.Td>
                        <Table.Td style={{ textAlign: "right", color: "#666" }}>
                          {formatNumber(product.minimumStockLevel)}
                        </Table.Td>
                        <Table.Td
                          style={{
                            textAlign: "right",
                            color: "#c92a2a",
                            fontWeight: 600,
                          }}
                        >
                          {formatNumber((product.minimumStockLevel || 0) - getStockValue(product))}
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
                      <Table.Th>Sr No.</Table.Th>
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
                    {negativeStockItems.map((product, index) => (
                      <Table.Tr key={product.id}>
                        <Table.Td style={{ fontFamily: "monospace" }}>
                          {index + 1}
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
                          {formatNumber(getStockValue(product))}
                        </Table.Td>
                        <Table.Td style={{ textAlign: "right", color: "#666" }}>
                          {formatNumber(product.minimumStockLevel)}
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
