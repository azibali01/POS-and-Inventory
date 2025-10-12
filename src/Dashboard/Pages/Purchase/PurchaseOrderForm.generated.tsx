import type React from "react";

import { useMemo, useState } from "react";
import {
  Card,
  TextInput,
  Textarea,
  Button,
  Badge,
  Text,
  Select,
  Title,
  NumberInput,
  Table,
} from "@mantine/core";
// inline table used instead of PurchaseLineItemsTable
import type { PurchaseLineItem } from "./types";
import { formatCurrency, formatDate } from "../../../lib/format-utils";
import { mockSuppliers, mockGRNs } from "../../../lib/mock-data";
import { useEffect } from "react";
import { useDataContext } from "../../Context/DataContext";
import { Trash2 } from "lucide-react";

export type POFormPayload = {
  poNumber: string;
  poDate: string;
  expectedDelivery?: string;
  supplierId?: string;
  items: PurchaseLineItem[];
  totals: { sub: number; tax: number; total: number };
  remarks?: string;
  status?: string;
};

const suppliers = mockSuppliers;
const grns = mockGRNs;

export function PurchaseOrderForm({
  onSubmit,
}: {
  onSubmit?: (payload: POFormPayload) => void;
}) {
  const [poNumber, setPoNumber] = useState("");
  const [poDate, setPoDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [expectedDelivery, setExpectedDelivery] = useState<string>("");
  const [grnNumber, setGrnNumber] = useState<string>("");
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id ?? "");
  const [remarks, setRemarks] = useState("Monthly stock replenishment");
  const [status] = useState("Draft");

  const [items, setItems] = useState<PurchaseLineItem[]>([
    {
      id: crypto.randomUUID(),
      productId: "",
      productName: "Select product",
      unit: "pcs",
      quantity: 1,
      rate: 0,
      rateSource: "manual",
      colorId: undefined,
      color: undefined,
      gauge: undefined,
      length: undefined,
      grossAmount: 0,
      percent: 0,
      discountAmount: 0,
      netAmount: 0,
      taxRate: 18,
      amount: 0,
    },
  ]);

  const { inventory, colors } = useDataContext();

  useEffect(() => {
    if (!grnNumber) return;
    const g = grns.find((x) => x.grnNumber === grnNumber);
    if (!g) return;
    setSupplierId(g.supplierId);
    setItems(
      g.items.map(
        (i: {
          productId: string;
          productName?: string;
          unit?: string;
          quantity?: number;
          rate?: number;
          discount?: number;
          taxRate?: number;
        }) => {
          // try to map product metadata from inventory
          const prod = inventory.find(
            (p) => String(p.id) === String(i.productId)
          );
          const rate = i.rate ?? prod?.costPrice ?? prod?.sellingPrice ?? 0;
          const productName = prod?.name ?? i.productName ?? "";
          const code = prod?.code ?? undefined;
          const unit = prod?.unit ?? i.unit ?? "pcs";
          const qty = i.quantity ?? 1;
          const gross = qty * rate;
          const discount = i.discount ?? 0;
          const net = gross - discount;
          const taxRate = i.taxRate ?? 0;
          const amount = net * (1 + taxRate / 100);
          return {
            id: crypto.randomUUID(),
            productId: String(i.productId ?? ""),
            productName,
            code,
            unit,
            quantity: qty,
            rate,
            rateSource: "manual",
            colorId: undefined,
            color: undefined,
            gauge: undefined,
            length: undefined,
            grossAmount: gross,
            percent: 0,
            discountAmount: discount,
            netAmount: net,
            taxRate,
            amount,
          };
        }
      )
    );
  }, [grnNumber, inventory]);

  const totals = useMemo(() => {
    const sub = items.reduce((s, i) => s + (i.grossAmount || 0), 0);
    const tax = items.reduce(
      (s, i) => s + ((i.netAmount || 0) * (i.taxRate || 0)) / 100,
      0
    );
    return {
      sub,
      tax,
      total: sub - items.reduce((s, i) => s + (i.discountAmount || 0), 0) + tax,
    };
  }, [items]);

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: POFormPayload = {
      poNumber,
      poDate,
      expectedDelivery,
      supplierId,
      items,
      totals,
      remarks,
      status,
    };
    onSubmit?.(payload);
    console.info("Purchase Order saved (mock)!", payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <div
          style={{
            padding: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Title order={3}>Purchase Order</Title>
            <Text color="dimmed">Create and send a purchase order</Text>
          </div>
          <Badge variant="outline">{status}</Badge>
        </div>

        <div style={{ padding: 12 }} className="space-y-4">
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(3, 1fr)",
            }}
          >
            <div>
              <label htmlFor="poNo">PO Number</label>
              <TextInput
                id="poNo"
                value={poNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPoNumber(e.target.value)
                }
                placeholder="PO-2025-001"
              />
            </div>
            <div>
              <label htmlFor="poDate">PO Date</label>
              <TextInput
                id="poDate"
                type="date"
                value={poDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPoDate(e.target.value)
                }
              />
            </div>
            <div>
              <label htmlFor="expDate">Expected Delivery</label>
              <TextInput
                id="expDate"
                type="date"
                value={expectedDelivery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setExpectedDelivery(e.target.value)
                }
              />
            </div>
            <div>
              <label>GRN (optional)</label>
              <Select
                data={grns.map((g) => ({
                  value: g.grnNumber,
                  label: `${g.grnNumber} — ${g.supplierName}`,
                }))}
                value={grnNumber}
                onChange={(v) => setGrnNumber(v ?? "")}
              />
            </div>
          </div>

          <div
            style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}
          >
            <div>
              <label>Supplier</label>
              <Select
                data={suppliers.map((s) => ({
                  value: s.id,
                  label: `${s.name} — ${s.city}`,
                }))}
                value={supplierId}
                onChange={(v) => setSupplierId(v ?? "")}
              />
            </div>
            <div>
              <label>Supplier Details</label>
              <Textarea
                readOnly
                value={
                  selectedSupplier
                    ? `${selectedSupplier.name}\n${selectedSupplier.address}\n${selectedSupplier.city}\nGST: ${selectedSupplier.gstNumber}`
                    : ""
                }
                minRows={4}
              />
            </div>
          </div>

          <div>
            <label>Items</label>
            {/* Sales-style table design adapted for PurchaseLineItem */}
            <div style={{ overflowX: "auto" }}>
              <Table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <td style={{ textAlign: "left", padding: 8 }}>Item</td>
                    <th style={{ textAlign: "left", padding: 8, width: 120 }}>
                      Color
                    </th>
                    <th style={{ textAlign: "left", padding: 8, width: 120 }}>
                      Gauge
                    </th>
                    <th style={{ textAlign: "left", padding: 8, width: 120 }}>
                      Length
                    </th>
                    <th style={{ textAlign: "left", padding: 8, width: 120 }}>
                      Price Source
                    </th>
                    <th style={{ textAlign: "right", padding: 8, width: 100 }}>
                      Qty
                    </th>
                    <th style={{ textAlign: "right", padding: 8, width: 120 }}>
                      Rate
                    </th>
                    <th style={{ textAlign: "right", padding: 8, width: 120 }}>
                      Gross
                    </th>
                    <th style={{ textAlign: "right", padding: 8, width: 80 }}>
                      %
                    </th>
                    <th style={{ textAlign: "right", padding: 8, width: 120 }}>
                      Discount
                    </th>
                    <th style={{ textAlign: "right", padding: 8, width: 120 }}>
                      Net
                    </th>
                    <th style={{ textAlign: "right", padding: 8, width: 80 }}>
                      GST
                    </th>
                    <th style={{ textAlign: "right", padding: 8, width: 120 }}>
                      Amount
                    </th>
                    <th style={{ textAlign: "right", padding: 8, width: 80 }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => {
                    const gross = (it.quantity || 0) * (it.rate || 0);
                    const discount = it.discountAmount ?? 0;
                    const net = gross - discount;
                    const tax = ((it.taxRate || 0) * net) / 100;
                    const lineTotal = net + tax;
                    return (
                      <tr key={it.id}>
                        <td style={{ padding: 8 }}>
                          <Select
                            searchable
                            data={inventory.map((p) => ({
                              value: String(p.id),
                              label: p.name,
                            }))}
                            value={String(it.productId || "")}
                            onChange={(val) => {
                              const prod = inventory.find(
                                (p) => String(p.id) === String(val)
                              );
                              if (prod) {
                                const ext = prod as unknown as {
                                  gauge?: string | number;
                                  weight?: string | number;
                                  msl?: string | number;
                                  length?: string | number;
                                  color?: string;
                                  colorId?: string;
                                };
                                const mappedRate = Number(
                                  prod.newPrice ??
                                    prod.oldPrice ??
                                    prod.sellingPrice ??
                                    0
                                );
                                const mappedRateSource = prod.newPrice
                                  ? "new"
                                  : "old";
                                setItems((prev) =>
                                  prev.map((row) =>
                                    row.id === it.id
                                      ? {
                                          ...row,
                                          productId: String(prod.id),
                                          productName: prod.name,
                                          code: prod.code,
                                          unit: prod.unit || "pcs",
                                          rate: mappedRate,
                                          rateSource: mappedRateSource as
                                            | "old"
                                            | "new",
                                          colorId:
                                            prod.colorId ??
                                            prod.color ??
                                            undefined,
                                          color: prod.color ?? undefined,
                                          gauge:
                                            ext.gauge ??
                                            ext.weight ??
                                            ext.msl ??
                                            ext.length
                                              ? String(
                                                  ext.gauge ??
                                                    ext.weight ??
                                                    ext.msl ??
                                                    ext.length
                                                )
                                              : undefined,
                                          length:
                                            ext.length ??
                                            prod.length ??
                                            undefined,
                                          grossAmount:
                                            mappedRate * (row.quantity || 0),
                                          discountAmount:
                                            row.discountAmount ?? 0,
                                          netAmount:
                                            mappedRate * (row.quantity || 0) -
                                            (row.discountAmount ?? 0),
                                          amount:
                                            (mappedRate * (row.quantity || 0) -
                                              (row.discountAmount ?? 0)) *
                                            (1 + (row.taxRate || 0) / 100),
                                        }
                                      : row
                                  )
                                );
                              } else {
                                setItems((prev) =>
                                  prev.map((row) =>
                                    row.id === it.id
                                      ? {
                                          ...row,
                                          productId: String(val ?? ""),
                                          productName: row.productName,
                                        }
                                      : row
                                  )
                                );
                              }
                            }}
                          />
                        </td>
                        <td style={{ padding: 8 }}>
                          <Select
                            placeholder="Color"
                            data={colors.map((c) => ({
                              value: c.id,
                              label: c.name,
                            }))}
                            value={it.colorId}
                            onChange={(v) =>
                              setItems((prev) =>
                                prev.map((row) =>
                                  row.id === it.id
                                    ? {
                                        ...row,
                                        colorId: v ?? undefined,
                                        color: colors.find(
                                          (c) => c.id === (v ?? undefined)
                                        )?.name,
                                      }
                                    : row
                                )
                              )
                            }
                          />
                        </td>
                        <td style={{ padding: 8 }}>
                          <TextInput
                            value={it.gauge ?? ""}
                            onChange={(e) =>
                              setItems((prev) =>
                                prev.map((row) =>
                                  row.id === it.id
                                    ? { ...row, gauge: e.target.value }
                                    : row
                                )
                              )
                            }
                            placeholder="Gauge"
                          />
                        </td>
                        <td style={{ padding: 8 }}>
                          <TextInput
                            value={String(it.length ?? "")}
                            onChange={(e) =>
                              setItems((prev) =>
                                prev.map((row) =>
                                  row.id === it.id
                                    ? { ...row, length: e.target.value }
                                    : row
                                )
                              )
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
                            value={it.rateSource}
                            onChange={(v) => {
                              const source = (v ?? "old") as "old" | "new";
                              const prod = inventory.find(
                                (p) => String(p.id) === String(it.productId)
                              );
                              if (prod) {
                                const chosen =
                                  source === "old"
                                    ? prod.oldPrice ?? prod.sellingPrice
                                    : prod.newPrice ?? prod.sellingPrice;
                                setItems((prev) =>
                                  prev.map((row) =>
                                    row.id === it.id
                                      ? {
                                          ...row,
                                          rate: Number(chosen || 0),
                                          rateSource: source,
                                        }
                                      : row
                                  )
                                );
                              } else {
                                setItems((prev) =>
                                  prev.map((row) =>
                                    row.id === it.id
                                      ? { ...row, rateSource: source }
                                      : row
                                  )
                                );
                              }
                            }}
                          />
                        </td>
                        <td style={{ padding: 8, textAlign: "right" }}>
                          <NumberInput
                            value={it.quantity}
                            onChange={(v) =>
                              setItems((prev) =>
                                prev.map((row) =>
                                  row.id === it.id
                                    ? {
                                        ...row,
                                        quantity: Number(v || 0),
                                        grossAmount: Number(v || 0) * row.rate,
                                      }
                                    : row
                                )
                              )
                            }
                            min={0}
                          />
                        </td>
                        <td style={{ padding: 8 }}>
                          <NumberInput
                            value={it.rate}
                            onChange={(v) =>
                              setItems((prev) =>
                                prev.map((row) =>
                                  row.id === it.id
                                    ? {
                                        ...row,
                                        rate: Number(v || 0),
                                        grossAmount:
                                          (row.quantity || 0) * Number(v || 0),
                                      }
                                    : row
                                )
                              )
                            }
                            min={0}
                          />
                        </td>
                        <td style={{ padding: 8 }}>{gross.toFixed(2)}</td>
                        <td style={{ padding: 8 }}>
                          <NumberInput
                            value={it.percent ?? 0}
                            onChange={(v) =>
                              setItems((prev) =>
                                prev.map((row) =>
                                  row.id === it.id
                                    ? {
                                        ...row,
                                        percent: Number(v || 0),
                                        discountAmount:
                                          (Number(v || 0) / 100) * gross || 0,
                                      }
                                    : row
                                )
                              )
                            }
                            min={0}
                            max={100}
                          />
                        </td>
                        <td style={{ padding: 8 }}>
                          <NumberInput
                            value={it.discountAmount}
                            onChange={(v) =>
                              setItems((prev) =>
                                prev.map((row) =>
                                  row.id === it.id
                                    ? { ...row, discountAmount: Number(v || 0) }
                                    : row
                                )
                              )
                            }
                            min={0}
                          />
                        </td>
                        <td style={{ padding: 8 }}>{net.toFixed(2)}</td>
                        <td style={{ padding: 8 }}>
                          <NumberInput
                            value={it.taxRate}
                            onChange={(v) =>
                              setItems((prev) =>
                                prev.map((row) =>
                                  row.id === it.id
                                    ? { ...row, taxRate: Number(v || 0) }
                                    : row
                                )
                              )
                            }
                            min={0}
                          />
                        </td>
                        <td style={{ padding: 8, textAlign: "right" }}>
                          {formatCurrency(lineTotal)}
                        </td>
                        <td style={{ padding: 8, textAlign: "right" }}>
                          <Button
                            variant="subtle"
                            onClick={() =>
                              setItems((prev) =>
                                prev.filter((r) => r.id !== it.id)
                              )
                            }
                          >
                            <Trash2 size={14} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </div>

          <div>
            <label>Remarks</label>
            <Textarea
              value={remarks}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setRemarks(e.target.value)
              }
              minRows={3}
            />
          </div>
        </div>

        <div
          style={{
            padding: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 13, color: "#666" }}>
            Date: {formatDate(new Date(poDate))} • Supplier Balance:{" "}
            {formatCurrency(selectedSupplier?.currentBalance ?? 0)}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#777" }}>Subtotal</div>
            <div style={{ fontSize: 14 }}>{formatCurrency(totals.sub)}</div>
            <div style={{ fontSize: 12, color: "#777", marginTop: 8 }}>GST</div>
            <div style={{ fontSize: 14 }}>{formatCurrency(totals.tax)}</div>
            <div style={{ fontSize: 12, color: "#777", marginTop: 8 }}>
              Total
            </div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {formatCurrency(totals.total)}
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Button type="button" variant="outline" onClick={() => window.print()}>
          Print
        </Button>
        <Button type="submit">Save PO</Button>
      </div>
    </form>
  );
}
