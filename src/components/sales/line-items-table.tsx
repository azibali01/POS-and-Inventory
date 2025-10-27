import { useCallback } from "react";
import { NumberInput, TextInput, Button, Select } from "@mantine/core";
import Table from "../../lib/AppTable";
import type { InventoryItem } from "../../Dashboard/Context/DataContext";

export type LineItem = {
  id: string;
  productId: string;
  productName: string;
  unit?: string;
  quantity: number;
  rate: number;
  discount?: number;
  taxRate?: number;
  amount?: number;
  rateSource?: "old" | "new";
  color?: string;
  thickness?: string | number;
  length?: string | number;
  percent?: number;
  discountAmount?: number;
  netAmount?: number;
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
    (id: string, patch: Partial<LineItem>) =>
      onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it))),
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
          <Table.Th style={{ width: 120 }}>Price Source</Table.Th>
          <Table.Th style={{ width: 120 }}>Qty</Table.Th>
          <Table.Th style={{ width: 120 }}>Rate</Table.Th>
          <Table.Th style={{ width: 120 }}>Gross</Table.Th>
          <Table.Th style={{ width: 120 }}>%</Table.Th>
          <Table.Th style={{ width: 120 }}>Discount</Table.Th>
          <Table.Th style={{ width: 120 }}>Net</Table.Th>
          <Table.Th style={{ width: 120 }}>GST</Table.Th>
          <Table.Th style={{ width: 120 }}>Amount</Table.Th>
          <Table.Th style={{ width: 120 }}>Remove</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {items.map((it) => {
          const gross = (it.quantity || 0) * (it.rate || 0);
          const discount = it.discountAmount ?? it.discount ?? 0;
          const net = gross - discount;
          // GST removed per request — line total is net amount (no tax)
          const lineTotal = net;

          return (
            <Table.Tr key={it.id}>
              <Table.Td style={{ minWidth: 200 }}>
                {products && products.length ? (
                  <Select
                    value={String(it.productId || "")}
                    data={products.map((p) => ({
                      value: String(p.id),
                      label: p.name,
                    }))}
                    onChange={(val: string | null) => {
                      const prod = products.find(
                        (p) => String(p.id) === String(val)
                      );
                      if (prod) {
                        const ext = prod as unknown as {
                          thickness?: string | number;
                          weight?: string | number;
                          msl?: string | number;
                          length?: string | number;
                          color?: string;
                          colorId?: string;
                        };
                        update(it.id, {
                          productId: String(prod.id),
                          productName: prod.name,
                          rate: prod.sellingPrice,
                          // map product metadata into the line item when available
                          color: prod.color ?? prod.colorId ?? ext.color ?? "",
                          thickness:
                            ext.thickness ??
                            ext.weight ??
                            ext.msl ??
                            ext.length ??
                            "",
                          length: ext.length ?? prod.length ?? "",
                        });
                      } else update(it.id, { productId: String(val || "") });
                    }}
                  />
                ) : (
                  <TextInput
                    value={it.productName}
                    onChange={(e) =>
                      update(it.id, { productName: e.currentTarget.value })
                    }
                  />
                )}
              </Table.Td>

              <Table.Td>
                <TextInput
                  value={it.color ?? ""}
                  placeholder="Color"
                  onChange={(e) =>
                    update(it.id, { color: e.currentTarget.value })
                  }
                />
              </Table.Td>

              <Table.Td>
                <TextInput
                  value={String(it.thickness ?? "")}
                  placeholder="Thickness"
                  onChange={(e) =>
                    update(it.id, { thickness: e.currentTarget.value })
                  }
                />
              </Table.Td>

              <Table.Td>
                <TextInput
                  value={String(it.length ?? "")}
                  placeholder="Length"
                  onChange={(e) =>
                    update(it.id, { length: e.currentTarget.value })
                  }
                />
              </Table.Td>

              <Table.Td>
                <Select
                  value={it.rateSource ?? "new"}
                  data={[
                    { value: "old", label: "Old Price" },
                    { value: "new", label: "New Price" },
                  ]}
                  onChange={(v: string | null) => {
                    const prod = products?.find(
                      (p) => String(p.id) === String(it.productId)
                    );
                    const source = (v ?? "new") as "old" | "new";
                    if (prod) {
                      const chosen =
                        source === "old"
                          ? prod.oldPrice ?? prod.sellingPrice
                          : prod.newPrice ?? prod.sellingPrice;
                      update(it.id, {
                        rate: Number(chosen || 0),
                        rateSource: source,
                      });
                    } else update(it.id, { rateSource: source });
                  }}
                />
              </Table.Td>

              <Table.Td>
                <NumberInput
                  value={it.quantity}
                  onChange={(v: number | string | undefined) =>
                    update(it.id, { quantity: Number(v || 0) })
                  }
                />
              </Table.Td>

              <Table.Td>
                <NumberInput
                  value={it.rate}
                  onChange={(v: number | string | undefined) =>
                    update(it.id, { rate: Number(v || 0) })
                  }
                />
              </Table.Td>

              <Table.Td>{gross.toFixed(2)}</Table.Td>

              <Table.Td>
                <NumberInput
                  value={it.percent ?? 0}
                  onChange={(v: number | string | undefined) => {
                    const pct = Number(v || 0);
                    const discountAmount = (pct / 100) * gross;
                    update(it.id, {
                      percent: pct,
                      discountAmount,
                      discount: discountAmount,
                    });
                  }}
                />
              </Table.Td>

              <Table.Td>
                <NumberInput
                  value={it.discountAmount ?? it.discount ?? 0}
                  onChange={(v: number | string | undefined) =>
                    update(it.id, {
                      discountAmount: Number(v || 0),
                      discount: Number(v || 0),
                    })
                  }
                />
              </Table.Td>

              <Table.Td>{net.toFixed(2)}</Table.Td>

              <Table.Td>{lineTotal.toFixed(2)}</Table.Td>

              <Table.Td>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="subtle"
                    onClick={() =>
                      onChange(items.filter((x) => x.id !== it.id))
                    }
                  >
                    Remove
                  </Button>
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
