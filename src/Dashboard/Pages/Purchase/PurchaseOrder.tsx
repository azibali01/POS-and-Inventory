import { useState, useEffect } from "react";
import { Modal, Button, TextInput } from "@mantine/core";
import openPrintWindow from "../../../components/print/printWindow";
import type { InvoiceData } from "../../../components/print/printTemplate";
import Table from "../../../lib/AppTable";
import { showNotification } from "@mantine/notifications";
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
  const { purchases, setPurchases, loadPurchases } = useDataContext();

  useEffect(() => {
    if (
      (!purchases || purchases.length === 0) &&
      typeof loadPurchases === "function"
    ) {
      loadPurchases().catch(() => {
        /* ignore - UI will show optimistic/empty list */
      });
    }
  }, [loadPurchases]);
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
      // optimistic
      setPurchases((prev) => [record, ...prev]);
      (async () => {
        try {
          await (
            await import("../../../lib/api")
          ).createPurchase({
            id: record.id,
            items: record.items,
            total: record.total,
            date: record.date,
            supplierId: record.supplier,
          });
        } catch (err) {
          showNotification({
            title: "Purchase Persist Failed",
            message: String(err),
            color: "red",
          });
        }
      })();
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
        <Table style={{ width: "100%", borderCollapse: "collapse" }}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>PO Number</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Supplier</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Total</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
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
                <Table.Tr key={o.id}>
                  <Table.Td style={{ fontFamily: "monospace" }}>
                    {o.poNumber}
                  </Table.Td>
                  <Table.Td>{formatDate(o.poDate)}</Table.Td>
                  <Table.Td>{o.supplierName}</Table.Td>
                  <Table.Td style={{ textAlign: "right" }}>
                    {formatCurrency(o.totalAmount)}
                  </Table.Td>
                  <Table.Td>{o.status}</Table.Td>
                  <Table.Td>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="subtle"
                        onClick={() => {
                          const d: InvoiceData = {
                            title: "Purchase Order",
                            companyName: "Seven Star Traders",
                            addressLines: [
                              "Nasir Gardezi Road, Chowk Fawara, Bohar Gate Multan",
                            ],
                            invoiceNo: String(o.poNumber),
                            date: String(o.poDate),
                            customer: o.supplierName,
                            items: (o.items || []).map((it, idx) => {
                              const p = it as PurchaseLineItem;
                              const idLike =
                                (
                                  p as unknown as {
                                    productId?: string;
                                    sku?: string;
                                  }
                                ).productId ??
                                (
                                  p as unknown as {
                                    productId?: string;
                                    sku?: string;
                                  }
                                ).sku;
                              const priceLike =
                                (
                                  p as unknown as {
                                    rate?: number;
                                    price?: number;
                                  }
                                ).rate ??
                                (
                                  p as unknown as {
                                    rate?: number;
                                    price?: number;
                                  }
                                ).price;
                              const amountLike =
                                (
                                  p as unknown as {
                                    netAmount?: number;
                                    amount?: number;
                                  }
                                ).netAmount ??
                                (
                                  p as unknown as {
                                    netAmount?: number;
                                    amount?: number;
                                  }
                                ).amount;
                              return {
                                sr: idx + 1,
                                section: p.productName || String(idLike ?? ""),
                                quantity: p.quantity,
                                rate: Number(priceLike ?? 0),
                                amount: Number(amountLike ?? 0),
                              };
                            }),
                            totals: {
                              subtotal: o.subtotal ?? o.totalAmount,
                              tax: 0,
                              total: o.totalAmount,
                            },
                          };
                          openPrintWindow(d);
                        }}
                      >
                        Print
                      </Button>
                    </div>
                  </Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      </div>
    </div>
  );
}
