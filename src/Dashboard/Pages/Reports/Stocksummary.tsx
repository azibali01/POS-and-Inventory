"use client";

import { useMemo } from "react";
import { Title, Table, Text, ScrollArea, Badge } from "@mantine/core";
import { useDataContext } from "../../Context/DataContext";
import type { InventoryItem } from "../../Context/DataContext";
import { formatCurrency } from "../../../lib/format-utils";

export default function Stocksummary() {
  const { inventory = [] } = useDataContext();

  const lowStock = useMemo(
    () =>
      inventory.filter(
        (i: InventoryItem) => (i.stock ?? 0) <= (i.minStock ?? 0)
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
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Stock</th>
                <th style={{ textAlign: "right" }}>Min</th>
                <th style={{ textAlign: "right" }}>Cost</th>
                <th style={{ textAlign: "right" }}>Sell</th>
                <th>Supplier</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((it: InventoryItem) => (
                <tr key={it.id}>
                  <td>{it.sku}</td>
                  <td>{it.name}</td>
                  <td>{it.category}</td>
                  <td style={{ textAlign: "right" }}>{it.stock}</td>
                  <td style={{ textAlign: "right" }}>{it.minStock}</td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(it.costPrice)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(it.sellingPrice)}
                  </td>
                  <td>{it.supplier}</td>
                </tr>
              ))}
            </tbody>
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
