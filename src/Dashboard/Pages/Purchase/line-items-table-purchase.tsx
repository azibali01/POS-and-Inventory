import { useMemo } from "react";
import { Button, NumberInput, Select, TextInput } from "@mantine/core";
import { Plus, Trash2 } from "lucide-react";
import { useDataContext } from "../../Context/DataContext";
import { formatCurrency } from "../../../lib/format-utils";
import type { PurchaseLineItem } from "./types";

export function PurchaseLineItemsTable({
  items,
  onChange,
}: {
  items: PurchaseLineItem[];
  onChange: (next: PurchaseLineItem[]) => void;
}) {
  const { inventory, colors } = useDataContext();

  const products = inventory.map((p) => ({
    id: String(p.id),
    name: p.name,
    code: p.code,
    unit: p.unit,
    costPrice: p.costPrice,
    sellingPrice: p.sellingPrice,
  }));

  const totals = useMemo(() => {
    const sub = items.reduce((sum, i) => sum + (i.grossAmount || 0), 0);
    const totalDiscount = items.reduce(
      (sum, i) => sum + (i.discountAmount || 0),
      0
    );
    const net = items.reduce((sum, i) => sum + (i.netAmount || 0), 0);
    const tax = items.reduce(
      (sum, i) => sum + ((i.taxRate || 0) * (i.netAmount || 0)) / 100,
      0
    );
    return { sub, totalDiscount, net, tax, total: net + tax };
  }, [items]);

  function addRow() {
    const p = products[0] ?? {
      id: "",
      name: "New Product",
      unit: "pcs",
      costPrice: 0,
    };
    const rate = p.costPrice ?? p.sellingPrice ?? 0;
    const row: PurchaseLineItem = {
      id: crypto.randomUUID(),
      productId: String(p.id),
      productName: p.name || "",
      code: p.code,
      unit: p.unit || "pcs",
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

  function removeRow(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }

  function updateRow(id: string, patch: Partial<PurchaseLineItem>) {
    onChange(
      items.map((i) => {
        if (i.id !== id) return i;
        const next: PurchaseLineItem = { ...i, ...patch } as PurchaseLineItem;
        next.grossAmount = Number((next.quantity || 0) * (next.rate || 0));
        if (next.percent && next.percent > 0) {
          next.discountAmount = Number(
            (next.grossAmount * (next.percent || 0)) / 100
          );
        }
        if (patch.discountAmount !== undefined) {
          next.discountAmount = Number(patch.discountAmount || 0);
        }
        next.netAmount = Math.max(
          0,
          next.grossAmount - (next.discountAmount || 0)
        );
        const tax = ((next.taxRate || 0) * (next.netAmount || 0)) / 100;
        next.amount = Number((next.netAmount || 0) + tax || 0);
        return next;
      })
    );
  }

  return (
    <div>
      <div
        style={{
          overflowX: "auto",
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 6,
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>Item</th>
              <th style={{ textAlign: "left", padding: 8, width: 120 }}>
                Color
              </th>
              <th style={{ textAlign: "left", padding: 8, width: 100 }}>
                Gauge
              </th>
              <th style={{ textAlign: "left", padding: 8, width: 100 }}>
                Length
              </th>
              <th style={{ textAlign: "left", padding: 8, width: 120 }}>
                Price Source
              </th>
              <th style={{ textAlign: "right", padding: 8, width: 80 }}>Qty</th>
              <th style={{ textAlign: "right", padding: 8, width: 120 }}>
                Rate
              </th>
              <th style={{ textAlign: "right", padding: 8, width: 120 }}>
                Gross
              </th>
              <th style={{ textAlign: "right", padding: 8, width: 80 }}>%</th>
              <th style={{ textAlign: "right", padding: 8, width: 120 }}>
                Discount
              </th>
              <th style={{ textAlign: "right", padding: 8, width: 120 }}>
                Net
              </th>
              <th style={{ textAlign: "right", padding: 8, width: 80 }}>GST</th>
              <th style={{ textAlign: "right", padding: 8, width: 120 }}>
                Amount
              </th>
              <th style={{ textAlign: "right", padding: 8, width: 80 }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id}>
                <td style={{ padding: 8 }}>
                  <Select
                    searchable
                    data={products.map((p) => ({
                      value: String(p.id),
                      label: `${p.name} — ${p.code ?? p.id}`,
                    }))}
                    value={row.productId}
                    onChange={(productId) => {
                      const p = products.find(
                        (x) => String(x.id) === String(productId)
                      );
                      const prod = inventory.find(
                        (inv) => String(inv.id) === String(productId)
                      );
                      if (prod) {
                        // mirror Sales mapping: prefer newPrice/oldPrice then sellingPrice
                        const mappedRate = Number(
                          prod.newPrice ??
                            prod.oldPrice ??
                            prod.sellingPrice ??
                            0
                        );
                        const mappedRateSource = prod.newPrice ? "new" : "old";
                        const ext = prod as unknown as {
                          gauge?: string | number;
                          weight?: string | number;
                          msl?: string | number;
                          length?: string | number;
                          color?: string;
                          colorId?: string;
                        };

                        updateRow(row.id, {
                          productId: String(prod.id),
                          productName: prod.name,
                          code: prod.code,
                          unit: prod.unit || "pcs",
                          rate: mappedRate,
                          rateSource: mappedRateSource as
                            | "old"
                            | "new"
                            | "manual",
                          colorId: prod.colorId ?? prod.color ?? undefined,
                          color: prod.color ?? undefined,
                          gauge:
                            ext.gauge ?? ext.weight ?? ext.msl ?? ext.length
                              ? String(
                                  ext.gauge ??
                                    ext.weight ??
                                    ext.msl ??
                                    ext.length
                                )
                              : undefined,
                          length: ext.length ?? prod.length ?? undefined,
                        });
                      } else {
                        // fallback when product not found in inventory
                        updateRow(row.id, {
                          productId: String(productId || ""),
                          productName: p?.name || "",
                          code: p?.code ?? undefined,
                          unit: p?.unit || "pcs",
                        });
                      }
                    }}
                  />
                </td>
                <td style={{ padding: 8 }}>
                  <Select
                    placeholder="Color"
                    data={colors.map((c) => ({ value: c.id, label: c.name }))}
                    value={row.colorId}
                    onChange={(v) =>
                      updateRow(row.id, {
                        colorId: v ?? undefined,
                        color: colors.find((c) => c.id === (v ?? undefined))
                          ?.name,
                      })
                    }
                  />
                </td>
                <td style={{ padding: 8 }}>
                  <TextInput
                    value={row.gauge}
                    onChange={(e) =>
                      updateRow(row.id, { gauge: e.target.value })
                    }
                    placeholder="Gauge"
                  />
                </td>
                <td style={{ padding: 8 }}>
                  <TextInput
                    value={String(row.length ?? "")}
                    onChange={(e) =>
                      updateRow(row.id, { length: e.target.value })
                    }
                    placeholder="Length"
                  />
                </td>
                <td style={{ padding: 8 }}>
                  <Select
                    data={[
                      { value: "old", label: "Old" },
                      { value: "new", label: "New" },
                    ]}
                    value={row.rateSource}
                    onChange={(v) => {
                      const source = (v ?? "old") as "old" | "new";
                      // look up product in inventory to pick corresponding price
                      const prod = inventory.find(
                        (p) => String(p.id) === String(row.productId)
                      );
                      if (prod) {
                        const chosen =
                          source === "old"
                            ? prod.oldPrice ?? prod.sellingPrice
                            : prod.newPrice ?? prod.sellingPrice;
                        updateRow(row.id, {
                          rate: Number(chosen || 0),
                          rateSource: source,
                        });
                      } else {
                        updateRow(row.id, { rateSource: source });
                      }
                    }}
                  />
                </td>
                <td style={{ padding: 8, textAlign: "right" }}>
                  <NumberInput
                    value={row.quantity}
                    onChange={(v) =>
                      updateRow(row.id, { quantity: Number(v || 0) })
                    }
                    min={0}
                  />
                </td>
                <td style={{ padding: 8 }}>
                  <NumberInput
                    value={row.rate}
                    onChange={(v) =>
                      updateRow(row.id, { rate: Number(v || 0) })
                    }
                    min={0}
                  />
                </td>
                <td style={{ padding: 8 }}>
                  <NumberInput value={row.grossAmount} readOnly />
                </td>
                <td style={{ padding: 8 }}>
                  <NumberInput
                    value={row.percent}
                    onChange={(v) =>
                      updateRow(row.id, { percent: Number(v || 0) })
                    }
                    min={0}
                    max={100}
                  />
                </td>
                <td style={{ padding: 8 }}>
                  <NumberInput
                    value={row.discountAmount}
                    onChange={(v) =>
                      updateRow(row.id, { discountAmount: Number(v || 0) })
                    }
                    min={0}
                  />
                </td>
                <td style={{ padding: 8 }}>
                  <NumberInput value={row.netAmount} readOnly />
                </td>
                <td style={{ padding: 8 }}>
                  <NumberInput
                    value={row.taxRate}
                    onChange={(v) =>
                      updateRow(row.id, { taxRate: Number(v || 0) })
                    }
                    min={0}
                  />
                </td>
                <td style={{ padding: 8, textAlign: "right" }}>
                  {formatCurrency(row.amount)}
                </td>
                <td style={{ padding: 8, textAlign: "right" }}>
                  <Button variant="subtle" onClick={() => removeRow(row.id)}>
                    <Trash2 size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
        }}
      >
        <Button variant="outline" onClick={addRow}>
          <Plus size={14} style={{ marginRight: 8 }} />
          Add Item
        </Button>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#666" }}>Subtotal</div>
          <div style={{ fontSize: 14 }}>{formatCurrency(totals.sub)}</div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
            Discount
          </div>
          <div style={{ fontSize: 14 }}>
            {formatCurrency(totals.totalDiscount)}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>Net</div>
          <div style={{ fontSize: 14 }}>{formatCurrency(totals.net)}</div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>Tax</div>
          <div style={{ fontSize: 14 }}>{formatCurrency(totals.tax)}</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginTop: 6 }}>
            Total: {formatCurrency(totals.total)}
          </div>
        </div>
      </div>
    </div>
  );
}
