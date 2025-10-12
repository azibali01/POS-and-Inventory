import {
  Table,
  NumberInput,
  TextInput,
  Button,
  Avatar,
  Group,
} from "@mantine/core";
import { Trash } from "lucide-react";
import type { PurchaseLineItem } from "./types";
import type { InventoryItem } from "../../Context/DataContext";

export default function GRNLineItemsTable({
  items,
  onChange,
  products,
}: {
  items: PurchaseLineItem[];
  onChange: (items: PurchaseLineItem[]) => void;
  products?: InventoryItem[];
}) {
  function update(id: string, patch: Partial<PurchaseLineItem>) {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function addRow() {
    const p = products?.[0];
    const rate = p?.costPrice ?? p?.sellingPrice ?? 0;
    const row: PurchaseLineItem = {
      id:
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2),
      productId: String(p?.id ?? ""),
      productName: p?.name ?? "",
      unit: p?.unit ?? "pcs",
      quantity: 1,
      rate,
      rateSource: "old",
      colorId: undefined,
      color: undefined,
      gauge: undefined,
      length: undefined,
      grossAmount: rate * 1,
      percent: 0,
      discountAmount: 0,
      netAmount: rate * 1,
      taxRate: 18,
      amount: rate * 1 * 1.18,
    };
    onChange([...items, row]);
  }

  function remove(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Button size="xs" variant="outline" onClick={addRow}>
          + Add Item
        </Button>
      </div>

      <Table highlightOnHover>
        <thead>
          <tr>
            <th></th>
            <th>Item</th>
            <th>Color</th>
            <th>Gauge</th>
            <th>Length</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td>
                <Group>
                  <Avatar radius="xl">
                    {String(it.productName || it.productId || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </Avatar>
                </Group>
              </td>
              <td style={{ minWidth: 200 }}>
                <TextInput
                  value={it.productName}
                  onChange={(e) =>
                    update(it.id, { productName: e.currentTarget.value })
                  }
                />
              </td>
              <td>
                <TextInput
                  value={it.color ?? ""}
                  onChange={(e) =>
                    update(it.id, { color: e.currentTarget.value })
                  }
                />
              </td>
              <td>
                <TextInput
                  value={String(it.gauge ?? "")}
                  onChange={(e) =>
                    update(it.id, { gauge: e.currentTarget.value })
                  }
                />
              </td>
              <td>
                <TextInput
                  value={String(it.length ?? "")}
                  onChange={(e) =>
                    update(it.id, { length: e.currentTarget.value })
                  }
                />
              </td>
              <td>
                <NumberInput
                  value={it.quantity}
                  onChange={(v) => update(it.id, { quantity: Number(v || 0) })}
                />
              </td>
              <td>
                <NumberInput
                  value={it.rate}
                  onChange={(v) => update(it.id, { rate: Number(v || 0) })}
                />
              </td>
              <td>{((it.quantity || 0) * (it.rate || 0)).toFixed(2)}</td>
              <td>
                <Button variant="subtle" onClick={() => remove(it.id)}>
                  <Trash size={14} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
