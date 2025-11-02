import { useCallback } from "react";
import { NumberInput, TextInput, Button, Select } from "@mantine/core";

import Table from "../../lib/AppTable";
import type { InventoryItem } from "../../Dashboard/Context/DataContext";
import { IconTrash } from "@tabler/icons-react";

export type LineItem = {
  _id?: string | number;
  itemName?: string;
  unit: string;
  discount?: number;
  discountAmount?: number;
  salesRate?: number;
  color?: string;
  openingStock?: number;
  quantity?: number;
  thickness?: number;
  amount: number;
  length?: number;
  totalGrossAmount: number;
  totalNetAmount: number;
};

export function LineItemsTable({
  items,
  onChange,
  products,
}: {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  products?: InventoryItem[];
}) {
  const update = useCallback(
    (rowIdx: number, patch: Partial<LineItem>) =>
      onChange(
        items.map((it, idx) => (idx === rowIdx ? { ...it, ...patch } : it))
      ),
    [items, onChange]
  );

  return (
    <Table withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th style={{ width: 300 }}>Item</Table.Th>
          <Table.Th style={{ width: 140 }}>Color</Table.Th>
          <Table.Th style={{ width: 120 }}>Thickness</Table.Th>
          <Table.Th style={{ width: 120 }}>Length</Table.Th>

          <Table.Th style={{ width: 120 }}>Qty</Table.Th>
          <Table.Th style={{ width: 120 }}>Rate</Table.Th>
          <Table.Th style={{ width: 120 }}>Gross</Table.Th>
          <Table.Th style={{ width: 120 }}>%</Table.Th>
          <Table.Th style={{ width: 120 }}>Discount</Table.Th>
          <Table.Th style={{ width: 120 }}>Net</Table.Th>

          <Table.Th style={{ width: 120 }}>Amount</Table.Th>
          <Table.Th style={{ textAlign: "left" }}>Remove</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {items.map((it, idx) => {
          // Amount = Length * Quantity * Rate
          const length = Number(it.length || 0);
          const quantity = Number(it.quantity || 0);
          const rate = Number(it.salesRate || 0);
          const gross = length * quantity * rate;
          const discountAmount = it.discountAmount ?? 0;
          const net = gross - discountAmount;
          // GST removed per request — line total is net amount (no tax)

          return (
            <Table.Tr key={`line-${idx}`}>
              <Table.Td style={{ minWidth: 200 }}>
                {products && products.length ? (
                  <Select
                    value={String(it._id || "")}
                    data={products.map((p) => ({
                      value: String(p._id),
                      label: p.itemName || String(p._id),
                    }))}
                    onChange={(val: string | null) => {
                      const prod = products.find(
                        (p) => String(p._id) === String(val)
                      );
                      if (prod) {
                        update(idx, {
                          _id: prod._id,
                          itemName: prod.itemName || "",
                          unit: prod.unit ?? "",
                          salesRate: Number(prod.salesRate ?? 0),
                          color: prod.color ?? "",
                          thickness: Number(prod.thickness ?? 0),
                          openingStock: prod.openingStock ?? 0,
                          // length: prod.length ?? 0, // Remove if not in InventoryItem
                          amount: 0,
                          totalGrossAmount: 0,
                          totalNetAmount: 0,
                        });
                      } else {
                        update(idx, {
                          _id: "",
                          itemName: "",
                        });
                      }
                    }}
                  />
                ) : (
                  <TextInput
                    value={it.itemName}
                    onChange={(e) =>
                      update(idx, {
                        itemName: e.currentTarget.value,
                      })
                    }
                  />
                )}
              </Table.Td>

              <Table.Td>
                <TextInput
                  value={it.color ?? ""}
                  placeholder="Color"
                  onChange={(e) =>
                    update(idx, { color: e.currentTarget.value })
                  }
                />
              </Table.Td>

              <Table.Td>
                <TextInput
                  value={String(it.thickness ?? "")}
                  placeholder="Thickness"
                  onChange={(e) =>
                    update(idx, {
                      thickness: Number(e.currentTarget.value),
                    })
                  }
                />
              </Table.Td>

              <Table.Td>
                <TextInput
                  value={String(it.length ?? "")}
                  placeholder="Length"
                  onChange={(e) => {
                    const length = Number(e.currentTarget.value);
                    const quantity = Number(it.quantity || 0);
                    const rate = Number(it.salesRate || 0);
                    update(idx, {
                      length,
                      amount: length * quantity * rate,
                    });
                  }}
                />
              </Table.Td>

              <Table.Td>
                <NumberInput
                  value={it.quantity}
                  onChange={(v: number | string | undefined) => {
                    const quantity = Number(v || 0);
                    const length = Number(it.length || 0);
                    const rate = Number(it.salesRate || 0);
                    update(idx, {
                      quantity,
                      amount: length * quantity * rate,
                    });
                  }}
                />
              </Table.Td>

              <Table.Td>
                <NumberInput
                  value={it.salesRate}
                  onChange={(v: number | string | undefined) => {
                    const rate = Number(v || 0);
                    const length = Number(it.length || 0);
                    const quantity = Number(it.quantity || 0);
                    update(idx, {
                      salesRate: rate,
                      amount: length * quantity * rate,
                    });
                  }}
                />
              </Table.Td>

              <Table.Td>{gross.toFixed(2)}</Table.Td>

              <Table.Td>
                <NumberInput
                  value={it.discount ?? 0}
                  onChange={(v: number | string | undefined) => {
                    const pct = Number(v || 0);
                    const discountAmount = (pct / 100) * gross;
                    update(idx, {
                      discount: pct,
                      discountAmount,
                    });
                  }}
                />
              </Table.Td>

              <Table.Td>
                <NumberInput
                  value={it.discountAmount ?? 0}
                  onChange={(v: number | string | undefined) => {
                    const amt = Number(v || 0);
                    // When user edits discountAmount, update both fields to keep them in sync
                    const pct = gross > 0 ? (amt / gross) * 100 : 0;
                    update(idx, {
                      discountAmount: amt,
                      discount: pct,
                    });
                  }}
                />
              </Table.Td>

              <Table.Td>{net.toFixed(2)}</Table.Td>

              <Table.Td>{(length * quantity * rate).toFixed(2)}</Table.Td>

              <Table.Td>
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <Button
                    variant="subtle"
                    onClick={() => onChange(items.filter((_, i) => i !== idx))}
                    leftSection={<IconTrash size={18} />}
                  ></Button>
                </div>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}

export default LineItemsTable;
