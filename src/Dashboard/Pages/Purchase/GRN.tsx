import { useState } from "react";
import { Modal, Button, TextInput } from "@mantine/core";
import { formatCurrency, formatDate } from "../../../lib/format-utils";
import type { PurchaseLineItem } from "./types";
import GRNForm, { type GRNFormPayload } from "./GRNForm.generated";
import { useDataContext, type GRNRecord } from "../../Context/DataContext";

type GRN = {
  id: string;
  grnNumber: string;
  grnDate: string | Date;
  supplierId?: string;
  supplierName: string;
  items: PurchaseLineItem[];
  subtotal: number;
  totalAmount: number;
  status: string;
  createdAt?: Date;
};

export default function GRNPage() {
  const { grns, setGrns, applyGrnToInventory, updatePurchaseFromGrn } =
    useDataContext();
  const [data, setData] = useState<GRN[]>(() =>
    (grns || []).map((g) => ({
      id: g.id,
      grnNumber: g.grnNumber,
      grnDate: g.grnDate,
      supplierId: g.supplierId,
      supplierName: g.supplierName ?? "Supplier",
      items: (g.items || []).map((it) => ({
        id:
          typeof crypto !== "undefined" &&
          typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2),
        productId: String(it.sku ?? ""),
        productName: String(it.sku ?? ""),
        unit: "pcs",
        quantity: it.quantity || 0,
        rate: it.price || 0,
        rateSource: "old",
        colorId: undefined,
        color: undefined,
        gauge: undefined,
        length: undefined,
        grossAmount: (it.quantity || 0) * (it.price || 0),
        percent: 0,
        discountAmount: 0,
        netAmount: (it.quantity || 0) * (it.price || 0),
        taxRate: 18,
        amount: (it.quantity || 0) * (it.price || 0) * 1.18,
      })),
      subtotal: g.subtotal,
      totalAmount: g.totalAmount,
      status: g.status || "Received",
      createdAt: undefined,
    }))
  );
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  function handleCreate(payload: GRNFormPayload) {
    const items = (payload.items || []) as PurchaseLineItem[];
    const subtotal = items.reduce((s, it) => s + (it.netAmount || 0), 0);
    const tax = items.reduce(
      (s, it) => s + ((it.taxRate || 0) * (it.netAmount || 0)) / 100,
      0
    );
    const total = subtotal + tax;
    const record: GRNRecord = {
      id: crypto.randomUUID(),
      grnNumber: payload.grnNumber || `GRN-${Date.now()}`,
      grnDate: payload.grnDate || new Date().toISOString(),
      supplierId: payload.supplierId,
      supplierName: payload.supplierId
        ? String(payload.supplierId)
        : "Supplier",
      items: (items || []).map((it) => ({
        sku: it.productId || it.productName || "",
        quantity: it.quantity || 0,
        price: it.rate || 0,
      })),
      subtotal,
      totalAmount: total,
      status: payload.status || "Received",
    };

    if (typeof setGrns === "function") {
      setGrns((prev) => [record, ...(prev || [])]);
    }
    // update local view (map GRNRecord -> local GRN shape expected by this page)
    const local: GRN = {
      id: record.id,
      grnNumber: record.grnNumber,
      grnDate: record.grnDate,
      supplierId: record.supplierId,
      supplierName: record.supplierName ?? "Supplier",
      items: items as PurchaseLineItem[],
      subtotal: record.subtotal,
      totalAmount: record.totalAmount,
      status: record.status || "Received",
      createdAt: new Date(),
    };

    setData((prev) => [local, ...prev]);
    // apply inventory and update linked PO
    applyGrnToInventory(record);
    updatePurchaseFromGrn(record);
    setOpen(false);
  }

  return (
    <div>
      <Modal opened={open} onClose={() => setOpen(false)} size="80%">
        <GRNForm onSubmit={handleCreate} />
      </Modal>

      <div style={{ marginTop: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>Goods Received Notes (GRN)</h2>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <TextInput
              placeholder="Search GRN number or supplier..."
              value={q}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setQ(e.currentTarget.value)
              }
              style={{ width: 260 }}
            />
            <Button onClick={() => setOpen(true)}>Create GRN</Button>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>GRN Number</th>
              <th>Date</th>
              <th>Supplier</th>
              <th style={{ textAlign: "right" }}>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data
              .filter((o) => {
                const term = q.trim().toLowerCase();
                if (!term) return true;
                return (
                  String(o.grnNumber).toLowerCase().includes(term) ||
                  String(o.supplierName).toLowerCase().includes(term)
                );
              })
              .map((o) => (
                <tr key={o.id}>
                  <td style={{ fontFamily: "monospace" }}>{o.grnNumber}</td>
                  <td>{formatDate(o.grnDate)}</td>
                  <td>{o.supplierName}</td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(o.totalAmount)}
                  </td>
                  <td>{o.status}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
