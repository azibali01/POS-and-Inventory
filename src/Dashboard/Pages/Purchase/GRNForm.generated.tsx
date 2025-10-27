import React, { useMemo, useState } from "react";
import {
  Card,
  TextInput,
  Textarea,
  Button,
  Badge,
  Text,
  Select,
} from "@mantine/core";
import { PurchaseLineItemsTable } from "./line-items-table-purchase";
import type { PurchaseLineItem } from "./types";
import { formatCurrency, formatDate } from "../../../lib/format-utils";
import { mockSuppliers } from "../../../lib/mock-data";
import { useDataContext } from "../../Context/DataContext";

export type GRNFormPayload = {
  grnNumber: string;
  grnDate: string;
  supplierId?: string;
  items: PurchaseLineItem[];
  totals: { sub: number; tax: number; total: number };
  remarks?: string;
  status?: string;
};

export function GRNForm({
  onSubmit,
}: {
  onSubmit?: (p: GRNFormPayload) => void;
}) {
  const suppliers = mockSuppliers;
  // read purchases from global data store when importing PO into GRN
  const [grnNumber, setGrnNumber] = useState("");
  const [grnDate, setGrnDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id ?? "");
  const [remarks, setRemarks] = useState<string>("");
  const [status] = useState<string>("Received");

  const [items, setItems] = useState<PurchaseLineItem[]>([
    {
      id:
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2),
      productId: "",
      productName: "",
      unit: "pcs",
      quantity: 1,
      rate: 0,
      rateSource: "old",
      colorId: undefined,
      color: undefined,
      thickness: undefined,
      length: undefined,
      grossAmount: 0,
      percent: 0,
      discountAmount: 0,
      netAmount: 0,
      taxRate: 18,
      amount: 0,
    },
  ]);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: GRNFormPayload = {
      grnNumber,
      grnDate,
      supplierId,
      items,
      totals,
      remarks,
      status,
    };
    // include linked PO id if set
    type GRNFormPayloadWithLink = GRNFormPayload & { linkedPoId?: string };
    const payloadWithLink: GRNFormPayloadWithLink = { ...payload, linkedPoId };
    onSubmit?.(payloadWithLink);
  }

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);
  const { purchases } = useDataContext();
  const [linkedPoId, setLinkedPoId] = useState<string | undefined>(undefined);

  const warnings = (() => {
    if (!linkedPoId) return [] as string[];
    const po = (purchases || []).find(
      (p) => String(p.id) === String(linkedPoId)
    );
    if (!po) return [] as string[];
    const msgs: string[] = [];
    for (const it of items) {
      const ordered =
        (po.items || []).find((pi) => String(pi.sku) === String(it.productId))
          ?.quantity || 0;
      const prevReceived =
        (po.items || []).find((pi) => String(pi.sku) === String(it.productId))
          ?.received || 0;
      if ((prevReceived || 0) + (it.quantity || 0) > ordered) {
        msgs.push(
          `Item ${
            it.productName || it.productId
          } will exceed ordered qty (${ordered})`
        );
      }
    }
    return msgs;
  })();

  function importPO(poId?: string) {
    if (!poId) return;
    const po = (purchases || []).find((p) => String(p.id) === String(poId));
    if (!po) return;
    setLinkedPoId(poId);
    // map PO items into GRN items
    type POItem = { sku?: string; quantity?: number; price?: number };
    const mapped: PurchaseLineItem[] = (po.items || []).map((it: POItem) => ({
      id:
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2),
      productId: String(it.sku ?? ""),
      productName: String(it.sku ?? ""),
      unit: "pcs",
      quantity: Number(it.quantity || 1),
      rate: Number(it.price || 0),
      rateSource: "old" as const,
      colorId: undefined,
      color: undefined,
      thickness: undefined,
      length: undefined,
      grossAmount: (it.quantity || 0) * (it.price || 0),
      percent: 0,
      discountAmount: 0,
      netAmount: (it.quantity || 0) * (it.price || 0),
      taxRate: 18,
      amount: (it.quantity || 0) * (it.price || 0) * 1.18,
    }));
    setItems(mapped);
  }

  return (
    <form onSubmit={handleSubmit}>
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
            <Text style={{ fontSize: 18, fontWeight: 700 }}>GRN</Text>
            <Text color="dimmed">Record received goods</Text>
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
              <label>GRN Number</label>
              <TextInput
                value={grnNumber}
                onChange={(e) => setGrnNumber(e.currentTarget.value)}
                placeholder={`GRN-${Date.now()}`}
              />
            </div>
            <div>
              <label>GRN Date</label>
              <TextInput
                type="date"
                value={grnDate}
                onChange={(e) => setGrnDate(e.currentTarget.value)}
              />
            </div>
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
          </div>

          <div style={{ marginTop: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: 600 }}>Items</Text>
              <div style={{ minWidth: 260 }}>
                <Select
                  placeholder="Import from PO"
                  data={(purchases || []).map((p) => ({
                    value: String(p.id),
                    label: `${String(p.id)} — ${p.supplier} • ${formatDate(
                      new Date(p.date)
                    )}`,
                  }))}
                  searchable
                  clearable
                  onChange={(v) => importPO(v ?? undefined)}
                />
              </div>
            </div>
            {warnings.length > 0 && (
              <div style={{ marginBottom: 8, color: "#b45309" }}>
                <div style={{ fontWeight: 600 }}>Warning</div>
                {warnings.map((w, i) => (
                  <div key={i}>{w}</div>
                ))}
              </div>
            )}
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
              Date: {formatDate(new Date(grnDate))} • Supplier:{" "}
              {selectedSupplier?.name ?? ""}
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
        <Button type="submit">Save GRN</Button>
      </div>
    </form>
  );
}

export default GRNForm;
