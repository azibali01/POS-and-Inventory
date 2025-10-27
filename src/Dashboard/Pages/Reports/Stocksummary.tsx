"use client";

import { useMemo } from "react";
import { Title, Text, ScrollArea, Badge } from "@mantine/core";
import Table from "../../../lib/AppTable";
import { useDataContext } from "../../Context/DataContext";
import type { InventoryItem } from "../../Context/DataContext";
import { formatCurrency } from "../../../lib/format-utils";

export default function Stocksummary() {
  const { inventory = [] } = useDataContext();

  const lowStock = useMemo(
    () =>
      inventory.filter(
        (i: InventoryItem) =>
          ((i as any).openingStock ?? i.stock ?? 0) <=
          ((i as any).minimumStockLevel ?? i.minStock ?? 0)
      ),
    [inventory]
  );

  return (
    <div>
      <Title order={3}>Stock Summary</Title>
      <Text size="sm" color="dimmed">
        Overview of current stock levels
      </Text>

      <div style={{ marginTop: 12 }}>
        <Text style={{ fontWeight: 600, marginBottom: 8 }}>Inventory</Text>
        <ScrollArea style={{ maxHeight: 360 }}>
          <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>SKU</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th style={{ textAlign: "right" }}>Stock</Table.Th>
                <Table.Th style={{ textAlign: "right" }}>Min</Table.Th>
                <Table.Th style={{ textAlign: "right" }}>Cost</Table.Th>
                <Table.Th style={{ textAlign: "right" }}>Sell</Table.Th>
                <Table.Th>Supplier</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {inventory.map((it: InventoryItem) => (
                <Table.Tr key={it.id}>
                  <Table.Td>{it.sku}</Table.Td>
                  <Table.Td>{it.name}</Table.Td>
                  <Table.Td>{it.category}</Table.Td>
                  <Table.Td style={{ textAlign: "right" }}>
                    {(it as any).openingStock ?? it.stock}
                  </Table.Td>
                  <Table.Td style={{ textAlign: "right" }}>
                    {(it as any).minimumStockLevel ?? it.minStock}
                  </Table.Td>
                  <Table.Td style={{ textAlign: "right" }}>
                    {formatCurrency(it.costPrice)}
                  </Table.Td>
                  <Table.Td style={{ textAlign: "right" }}>
                    {formatCurrency((it as any).salesRate ?? it.sellingPrice)}
                  </Table.Td>
                  <Table.Td>{it.supplier}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </div>

      <div style={{ marginTop: 16 }}>
        <Text style={{ fontWeight: 600, marginBottom: 8 }}>
          Low stock items
        </Text>
        {lowStock.length === 0 ? (
          <Text color="dimmed">No low-stock items</Text>
        ) : (
          <Table highlightOnHover verticalSpacing="sm">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th style={{ textAlign: "right" }}>Stock</th>
                <th style={{ textAlign: "right" }}>Min</th>
                <th>Alert</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((it: InventoryItem) => (
                <tr key={`low-${it.id}`}>
                  <td>{it.sku}</td>
                  <td>{it.name}</td>
                  <td style={{ textAlign: "right" }}>{it.stock}</td>
                  <td style={{ textAlign: "right" }}>{it.minStock}</td>
                  <td>
                    <Badge color="red">Low</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
