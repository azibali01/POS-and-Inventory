import { useEffect, useMemo, useState } from "react";
import {
  Card,
  TextInput,
  Textarea,
  Button,
  Text,
  Select,
  Title,
  Table,
  Modal,
} from "@mantine/core";
import {
  useDataContext,
  type PurchaseReturnRecord,
  type PurchaseRecord,
  type Customer,
} from "../../Context/DataContext";
import { PurchaseLineItemsTable } from "./line-items-table-purchase";
import type { PurchaseLineItem } from "./types";
import { formatCurrency, formatDate } from "../../../lib/format-utils";

export default function PurchaseReturnPage() {
  const {
    purchases = [],
    customers = [],
    purchaseReturns = [],
    processPurchaseReturn,
  } = useDataContext();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const data = useMemo(
    () =>
      (purchaseReturns || []).map((r) => ({
        id: r.id,
        returnNumber: r.returnNumber,
        returnDate: r.returnDate,
        supplier: r.supplier,
        total: r.totalAmount,
        reason: r.reason,
      })),
    [purchaseReturns]
  );
  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim();
    if (!term) return data;
    return data.filter(
      (d) =>
        String(d.returnNumber).toLowerCase().includes(term) ||
        String(d.supplier).toLowerCase().includes(term)
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
          <Title order={2}>Purchase Returns</Title>
          <Text color="dimmed">Record product returns to suppliers</Text>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <TextInput
            placeholder="Search returns..."
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
            style={{ width: 260 }}
          />
          <Button onClick={() => setOpen(true)}>New Return</Button>
        </div>
      </div>

      <Card>
        <div style={{ padding: 12 }}>
          <Title order={4}>Recent Returns</Title>
          <Text color="dimmed">Last {data.length} purchase returns</Text>
          <div style={{ marginTop: 12, overflowX: "auto" }}>
            <Table>
              <thead>
                <tr>
                  <th>Return#</th>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: "monospace" }}>
                      {r.returnNumber}
                    </td>
                    <td>{formatDate(r.returnDate)}</td>
                    <td>{r.supplier}</td>
                    <td style={{ textAlign: "right" }}>
                      {formatCurrency(r.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </Card>

      <Modal opened={open} onClose={() => setOpen(false)} size="80%">
        <ReturnForm
          purchases={purchases}
          suppliers={customers}
          onClose={() => setOpen(false)}
          onSave={(ret) => {
            // idempotent processing via DataContext
            const res = processPurchaseReturn(ret);
            if (res.applied) setOpen(false);
            else alert(res.message || "Return not applied");
          }}
        />
      </Modal>
    </div>
  );
}

function ReturnForm({
  purchases,
  suppliers,
  onClose,
  onSave,
}: {
  purchases: PurchaseRecord[];
  suppliers: Customer[];
  onClose: () => void;
  onSave: (r: PurchaseReturnRecord) => void;
}) {
  const [returnNumber, setReturnNumber] = useState(`pret-${Date.now()}`);
  const [returnDate, setReturnDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [linkedPoId, setLinkedPoId] = useState<string>(
    purchases[0] ? String(purchases[0].id) : ""
  );
  const [supplierId, setSupplierId] = useState<string>(
    suppliers[0] ? String(suppliers[0].id) : ""
  );
  const [reason, setReason] = useState<string>("");
  const [items, setItems] = useState<PurchaseLineItem[]>(() => {
    // initialize from first PO if available
    const po = purchases[0];
    if (!po) return [];
    return (po.items || []).map((it) => ({
      id: `${Math.random()}`,
      productId: it.sku,
      productName: it.sku,
      unit: "pcs",
      quantity: 0,
      rate: it.price || 0,
      rateSource: "old" as const,
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
    }));
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] =
    useState<PurchaseReturnRecord | null>(null);

  useEffect(() => {
    if (!linkedPoId) return;
    const po = (purchases || []).find(
      (p) => String(p.id) === String(linkedPoId)
    );
    if (!po) return;
    setSupplierId(String(po.supplier));
    setItems(
      (po.items || []).map((it) => {
        const remaining = Math.max(0, (it.quantity || 0) - (it.received || 0));
        return {
          id: `${Math.random()}`,
          productId: it.sku,
          productName: `${it.sku} (remaining: ${remaining})`,
          unit: "pcs",
          quantity: 0,
          rate: it.price || 0,
          rateSource: "old" as const,
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
        };
      })
    );
  }, [linkedPoId, purchases]);

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

  function handleSave() {
    const record: PurchaseReturnRecord = {
      id:
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `pret-${Date.now()}`,
      returnNumber,
      returnDate,
      supplier: supplierId
        ? String(
            (suppliers || []).find((s) => String(s.id) === String(supplierId))
              ?.name ?? supplierId
          )
        : "",
      supplierId: supplierId || undefined,
      linkedPoId: linkedPoId || undefined,
      items: (items || [])
        .filter((i) => (i.quantity || 0) > 0)
        .map((it) => ({
          sku: String(it.productId || it.productName),
          quantity: it.quantity || 0,
          price: it.rate || 0,
        })),
      subtotal: totals.sub,
      totalAmount: totals.total,
      reason,
      status: "processed",
    };
    // show confirmation modal before final save
    setConfirmPayload(record);
    setConfirmOpen(true);
  }

  function handleConfirmSave() {
    if (!confirmPayload) return;
    onSave(confirmPayload);
    setConfirmOpen(false);
  }

  return (
    <div>
      <Title order={3}>New Purchase Return</Title>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginTop: 12,
        }}
      >
        <div>
          <label>Return Number</label>
          <TextInput
            value={returnNumber}
            onChange={(e) => setReturnNumber(e.currentTarget.value)}
          />
        </div>
        <div>
          <label>Return Date</label>
          <TextInput
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.currentTarget.value)}
          />
        </div>
        <div>
          <label>Link Purchase Order (optional)</label>
          <Select
            data={(purchases || []).map((p) => ({
              value: String(p.id),
              label: `${p.id} — ${p.supplier}`,
            }))}
            value={linkedPoId}
            onChange={(v) => setLinkedPoId(v ?? "")}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginTop: 12,
        }}
      >
        <div>
          <label>Supplier</label>
          <Select
            data={(suppliers || []).map((s) => ({
              value: String(s.id),
              label: `${s.name} — ${s.city}`,
            }))}
            value={supplierId}
            onChange={(v) => setSupplierId(v ?? "")}
          />
        </div>
        <div>
          <label>Reason</label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            minRows={3}
          />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <PurchaseLineItemsTable items={items} onChange={setItems} />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
        }}
      >
        <div style={{ color: "#666" }}>
          Subtotal: {formatCurrency(totals.sub)} • Tax:{" "}
          {formatCurrency(totals.tax)}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            {formatCurrency(totals.total)}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Button variant="outline" onClick={() => onClose()}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Return</Button>
          </div>
        </div>
      </div>
      <Modal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        size="sm"
      >
        <div style={{ padding: 12 }}>
          <Title order={4}>Confirm Return</Title>
          <Text color="dimmed">
            This will apply the return to inventory and create a supplier
            credit. Proceed?
          </Text>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 12,
            }}
          >
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSave}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
