import { useState } from "react";
import { Modal, Button, TextInput } from "@mantine/core";
import { formatCurrency, formatDate } from "../../../lib/format-utils";
import type { PurchaseLineItem } from "./types";
import { PurchaseOrderForm as GeneratedPOForm } from "./PurchaseOrderForm.generated";
import type { POFormPayload } from "./PurchaseOrderForm.generated";
// lucide icons not needed here
import { useDataContext } from "../../Context/DataContext";
import type { PurchaseRecord } from "../../Context/DataContext";

type PO = {
  id: string;
  poNumber: string;
  poDate: string | Date;
  supplierId?: string;
  supplierName: string;
  items: PurchaseLineItem[];
  subtotal: number;
  totalAmount: number;
  status: string;
  expectedDeliveryDate?: Date;
  remarks?: string;
  createdAt?: Date;
};

export default function PurchaseOrdersPage() {
  const { purchases, setPurchases } = useDataContext();
  // local view uses DataContext purchases mapped to PO type
  const [data, setData] = useState<PO[]>(() =>
    (purchases || []).map((p) => ({
      id: p.id,
      poNumber: p.id,
      poDate: p.date,
      supplierName: p.supplier,
      items: [],
      subtotal: p.total || 0,
      totalAmount: p.total || 0,
      status: p.status || "",
    }))
  );
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  function handleCreate(payload: POFormPayload) {
    const items = (payload.items || []) as PurchaseLineItem[];
    const subtotal = items.reduce((s, it) => s + (it.netAmount || 0), 0);
    const tax = items.reduce(
      (s, it) => s + ((it.taxRate || 0) * (it.netAmount || 0)) / 100,
      0
    );
    const total = subtotal + tax;

    // create a PurchaseRecord to persist in DataContext (simple shape)
    const allowedStatus =
      payload.status === "paid" ||
      payload.status === "pending" ||
      payload.status === "overdue"
        ? (payload.status as PurchaseRecord["status"]) // narrow to union
        : undefined;

    const record: PurchaseRecord = {
      id: crypto.randomUUID(),
      date: payload.poDate || new Date().toISOString(),
      supplier: String(payload.supplierId ?? "Supplier"),
      items: (items || []).map((it) => ({
        sku: it.productId || it.productName,
        quantity: it.quantity || 0,
        price: it.rate || 0,
      })),
      total,
      status: allowedStatus,
    };

    if (typeof setPurchases === "function") {
      setPurchases((prev) => [record, ...prev]);
    }

    // update local list too for immediate UI (optional)
    setData((prev) => [
      {
        id: record.id,
        poNumber: payload.poNumber || record.id,
        poDate: record.date,
        supplierId: payload.supplierId,
        supplierName: record.supplier,
        items: items as PurchaseLineItem[],
        subtotal,
        totalAmount: total,
        status: record.status || "Draft",
        expectedDeliveryDate: payload.expectedDelivery
          ? new Date(payload.expectedDelivery)
          : undefined,
        remarks: payload.remarks,
        createdAt: new Date(),
      },
      ...prev,
    ]);

    setOpen(false);
  }

  return (
    <div>
      <Modal opened={open} onClose={() => setOpen(false)} size="80%">
        <GeneratedPOForm onSubmit={handleCreate} />
      </Modal>

      <div style={{ marginTop: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>Purchase Orders</h2>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <TextInput
              placeholder="Search PO number or supplier..."
              value={q}
              onChange={(e) => setQ(e.currentTarget.value)}
              style={{ width: 260 }}
            />
            <Button onClick={() => setOpen(true)}>Create PO</Button>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>PO Number</th>
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
                  String(o.poNumber).toLowerCase().includes(term) ||
                  String(o.supplierName).toLowerCase().includes(term)
                );
              })
              .map((o) => (
                <tr key={o.id}>
                  <td style={{ fontFamily: "monospace" }}>{o.poNumber}</td>
                  <td>{formatDate(o.poDate)}</td>
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
