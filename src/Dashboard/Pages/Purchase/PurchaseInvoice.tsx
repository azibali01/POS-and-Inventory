import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  TextInput,
  Textarea,
  Button,
  Badge,
  Text,
  Select,
  Title,
  Table,
  Modal,
} from "@mantine/core";
import { PurchaseLineItemsTable } from "./line-items-table-purchase";
import type { PurchaseLineItem } from "./types";
import { formatCurrency, formatDate } from "../../../lib/format-utils";
import {
  useDataContext,
  type Customer,
  type GRNRecord,
  type PurchaseRecord,
} from "../../Context/DataContext";
import { IconPlus } from "@tabler/icons-react";

export interface PurchaseInvoicePayload {
  invoiceNumber?: string;
  invoiceDate?: string;
  grnNumber?: string;
  supplierId?: string | number;
  items?: PurchaseLineItem[];
  totals?: { sub: number; tax: number; total: number };
  remarks?: string;
}

export function PurchaseInvoiceForm({
  onSubmit,
}: {
  onSubmit?: (payload: PurchaseInvoicePayload) => void;
}) {
  const { customers: suppliers = [], grns = [] } = useDataContext();

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [grnNumber, setGrnNumber] = useState<string>("");
  const [supplierId, setSupplierId] = useState<string>(
    suppliers[0] ? String(suppliers[0].id) : ""
  );
  const [remarks, setRemarks] = useState("Invoice received");
  const [status] = useState("Draft");

  const [items, setItems] = useState<PurchaseLineItem[]>([
    {
      id:
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2),
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

  useEffect(() => {
    if (!grnNumber) return;
    const g = (grns || []).find((x: GRNRecord) => x.grnNumber === grnNumber);
    if (!g) return;
    setSupplierId(String(g.supplierId ?? ""));
    setItems(
      (g.items || []).map((i) => ({
        id:
          typeof crypto !== "undefined" &&
          typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2),
        productId: String(i.sku ?? ""),
        productName: i.sku ?? "",
        unit: "pcs",
        quantity: i.quantity ?? 1,
        rate: i.price ?? 0,
        rateSource: "old",
        colorId: undefined,
        color: undefined,
        gauge: undefined,
        length: undefined,
        grossAmount: (i.quantity || 0) * (i.price || 0),
        percent: 0,
        discountAmount: 0,
        netAmount: (i.quantity || 0) * (i.price || 0),
        taxRate: 18,
        amount: (i.quantity || 0) * (i.price || 0),
      }))
    );
  }, [grnNumber, grns]);

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

  const selectedSupplier = (suppliers || []).find(
    (s: Customer) => String(s.id) === String(supplierId)
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      invoiceNumber,
      invoiceDate,
      grnNumber,
      supplierId,
      items,
      totals,
      remarks,
    };
    onSubmit?.(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 12,
          }}
        >
          <div>
            <Title order={3}>Purchase Invoice</Title>
            <Text color="dimmed">
              Record supplier invoice (optional GRN prefill)
            </Text>
          </div>
          <Badge variant="outline">{status}</Badge>
        </div>

        <div style={{ padding: 12 }}>
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(3, 1fr)",
            }}
          >
            <div>
              <label>Invoice Number</label>
              <TextInput
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.currentTarget.value)}
                placeholder="PINV-2025-001"
              />
            </div>
            <div>
              <label>Invoice Date</label>
              <TextInput
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.currentTarget.value)}
              />
            </div>
            <div>
              <label>GRN Number (optional)</label>
              <Select
                data={(grns || []).map((g: GRNRecord) => ({
                  value: g.grnNumber,
                  label: `${g.grnNumber} — ${g.supplierName}`,
                }))}
                value={grnNumber}
                onChange={(v) => setGrnNumber(v ?? "")}
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "1fr 1fr",
              marginTop: 12,
            }}
          >
            <div>
              <label>Supplier</label>
              <Select
                data={(suppliers || []).map((s: Customer) => ({
                  value: String(s.id),
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

          <div style={{ marginTop: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: 600 }}>Items</Text>
            </div>
            <PurchaseLineItemsTable items={items} onChange={setItems} />
            <div style={{ marginTop: 12 }}>
              <label>Remarks</label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.currentTarget.value)}
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
              Date: {formatDate(new Date(invoiceDate))} • Supplier Balance:{" "}
              {formatCurrency(selectedSupplier?.currentBalance ?? 0)}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "#777" }}>Subtotal</div>
              <div style={{ fontSize: 14 }}>{formatCurrency(totals.sub)}</div>
              <div style={{ fontSize: 12, color: "#777", marginTop: 8 }}>
                GST
              </div>
              <div style={{ fontSize: 14 }}>{formatCurrency(totals.tax)}</div>
              <div style={{ fontSize: 12, color: "#777", marginTop: 8 }}>
                Total
              </div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {formatCurrency(totals.total)}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          marginTop: 8,
        }}
      >
        <Button type="button" variant="outline" onClick={() => window.print()}>
          Print
        </Button>
        <Button type="submit">Save Invoice</Button>
      </div>
    </form>
  );
}

export default function PurchaseInvoicesPage() {
  const [q, setQ] = useState("");
  const { purchases = [], setPurchases } = useDataContext();
  const [data, setData] = useState(() =>
    (purchases || []).slice(0, 20).map((p: PurchaseRecord) => ({
      id: p.id,
      invoiceNumber: String(p.id),
      invoiceDate: p.date,
      supplierName: p.supplier,
      totalAmount: p.total,
      status: p.status || "Pending",
    }))
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setData(
      (purchases || []).map((p: PurchaseRecord) => ({
        id: p.id,
        invoiceNumber: String(p.id),
        invoiceDate: p.date,
        supplierName: p.supplier,
        totalAmount: p.total,
        status: p.status || "Pending",
      }))
    );
  }, [purchases]);

  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim();
    if (!term) return data;
    return data.filter(
      (i) =>
        i.invoiceNumber.toLowerCase().includes(term) ||
        i.supplierName.toLowerCase().includes(term)
    );
  }, [q, data]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div>
          <Title order={2}>Purchase Invoices</Title>
          <Text color="dimmed">Create and track supplier invoices</Text>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <TextInput
            placeholder="Search invoices..."
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
            style={{ width: 260 }}
          />
          <Button
            onClick={() => setOpen(true)}
            leftSection={<IconPlus size={16} />}
          >
            Create Invoice
          </Button>
        </div>
      </div>

      <Card>
        <div style={{ padding: 12 }}>
          <Title order={4}>Recent Purchase Invoices</Title>
          <Text color="dimmed">Last {data.length} purchase invoices</Text>
          <div style={{ marginTop: 12, overflowX: "auto" }}>
            <Table>
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontFamily: "monospace" }}>
                      {inv.invoiceNumber}
                    </td>
                    <td>{formatDate(inv.invoiceDate)}</td>
                    <td>{inv.supplierName}</td>
                    <td style={{ textAlign: "right" }}>
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td>
                      <Badge variant="outline">{inv.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </Card>

      <Modal opened={open} onClose={() => setOpen(false)} size="80%">
        <PurchaseInvoiceForm
          onSubmit={(payload?: PurchaseInvoicePayload) => {
            const items = (payload?.items || []).map((it) => ({
              sku: String(it.productId || it.productName),
              quantity: it.quantity || 0,
              price: it.rate || 0,
            }));
            const record: PurchaseRecord = {
              id:
                typeof crypto !== "undefined" &&
                typeof crypto.randomUUID === "function"
                  ? crypto.randomUUID()
                  : `pinv-${Date.now()}`,
              date: payload?.invoiceDate || new Date().toISOString(),
              supplier: String(payload?.supplierId ?? ""),
              items,
              total: payload?.totals?.total || 0,
              status: "pending",
            };
            if (typeof setPurchases === "function")
              setPurchases((prev: PurchaseRecord[]) => [
                record,
                ...(prev || []),
              ]);
            setOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
