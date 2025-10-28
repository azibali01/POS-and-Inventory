import { useState, useEffect } from "react";
import { Modal, Button, TextInput } from "@mantine/core";
import Table from "../../../lib/AppTable";
import { showNotification } from "@mantine/notifications";
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
  const {
    grns,
    setGrns,
    applyGrnToInventory,
    updatePurchaseFromGrn,
    loadGrns,
  } = useDataContext();

  useEffect(() => {
    if ((!grns || grns.length === 0) && typeof loadGrns === "function") {
      loadGrns().catch(() => {
        /* ignore - errors surfaced by DataContext */
      });
    }
  }, [loadGrns]);
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
        color: undefined,
        thickness: undefined,
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
      (async () => {
        try {
          const api = await import("../../../lib/api");
          await api.createGRN({
            id: record.id,
            items: record.items,
            subtotal: record.subtotal,
            totalAmount: record.totalAmount,
            grnDate: record.grnDate,
            supplierId: record.supplierId,
          });
        } catch (err) {
          showNotification({
            title: "GRN Persist Failed",
            message: String(err),
            color: "red",
          });
        }
      })();
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
        <Table
          striped
          highlightOnHover
          verticalSpacing="sm"
          style={{
            width: "100%",
            border: "1px solid rgba(0,0,0,0.06)",
            borderCollapse: "collapse",
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>GRN Number</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Supplier</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Total</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
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
                <Table.Tr key={o.id}>
                  <Table.Td style={{ fontFamily: "monospace" }}>
                    {o.grnNumber}
                  </Table.Td>
                  <Table.Td>{formatDate(o.grnDate)}</Table.Td>
                  <Table.Td>{o.supplierName}</Table.Td>
                  <Table.Td style={{ textAlign: "right" }}>
                    {formatCurrency(o.totalAmount)}
                  </Table.Td>
                  <Table.Td>{o.status}</Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      </div>
    </div>
  );
}
