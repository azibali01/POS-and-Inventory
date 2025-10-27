"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Card,
  TextInput,
  Textarea,
  Button,
  Badge,
  Select,
  Text,
  Paper,
} from "@mantine/core";
import { formatCurrency } from "../../lib/format-utils";
import LineItemsTable from "./line-items-table";
import type { LineItem } from "./line-items-table";
import type {
  Customer,
  InventoryItem,
} from "../../Dashboard/Context/DataContext";
import { useDataContext } from "../..//Dashboard/Context/DataContext";
import openPrintWindow from "../print/printWindow";
import type { InvoiceData } from "../print/printTemplate";

export interface SalesPayload {
  mode: "Quotation" | "Invoice";
  docNo: string;
  docDate: string;
  validUntil?: string;
  customerId: string | number;
  items: LineItem[];
  totals: { sub: number; tax: number; total: number };
  remarks: string;
  terms: string;
  // optional metadata tracked for quotations/invoices
  status?: string;
  sourceQuotationId?: string | number;
  convertedInvoiceId?: string | number;
  convertedAt?: string;
}

function generateId() {
  try {
    // use crypto.randomUUID when available
    return typeof crypto !== "undefined" &&
      typeof (crypto as Crypto & { randomUUID?: () => string }).randomUUID ===
        "function"
      ? (crypto as Crypto & { randomUUID?: () => string }).randomUUID!()
      : Math.random().toString(36).slice(2);
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

export default function SalesDocShell({
  mode,
  onSubmit,
  customers: propCustomers,
  products: propProducts,
  initial,
  showImportIssues = true,
}: {
  mode: "Quotation" | "Invoice";
  onSubmit?: (payload: SalesPayload) => void;
  customers?: Customer[];
  products?: InventoryItem[];
  initial?: Partial<SalesPayload> & { sourceQuotationId?: string | number };
  showImportIssues?: boolean;
}) {
  // fallback to central DataContext when props are not provided
  const ctx = useDataContext();
  const customers = useMemo(
    () => propCustomers ?? ctx.customers ?? [],
    [propCustomers, ctx.customers]
  );
  const products = useMemo(
    () => propProducts ?? ctx.inventory ?? [],
    [propProducts, ctx.inventory]
  );

  const [docNo, setDocNo] = useState("");
  const [docDate, setDocDate] = useState<string>(
    (initial?.docDate as string) ?? new Date().toISOString().slice(0, 10)
  );
  const [validUntil, setValidUntil] = useState<string>(
    initial?.validUntil ?? ""
  );
  const [customerId, setCustomerId] = useState<string>(
    String(initial?.customerId ?? customers[0]?.id ?? "")
  );
  const [remarks, setRemarks] = useState("");
  const [terms, setTerms] = useState(
    "Prices valid for 15 days.\nPayment terms: Due on receipt."
  );

  const [items, setItems] = useState<LineItem[]>(
    (initial?.items as LineItem[] | undefined) ?? [
      {
        id: generateId(),
        productId: "",
        productName: "",
        unit: "pcs",
        quantity: 1,
        rate: 0,
        discount: 0,
        taxRate: 18,
        amount: 0,
      },
    ]
  );

  const status = mode === "Quotation" ? "Draft" : "Confirmed";

  const totals = useMemo(() => {
    // gross = sum(quantity * rate)
    const totalGrossAmount = items.reduce(
      (s, i) => s + (i.quantity || 0) * (i.rate || 0),
      0
    );
    // discounts sum
    const totalDiscountAmount = items.reduce(
      (s, i) => s + (i.discountAmount ?? i.discount ?? 0),
      0
    );
    // subtotal (for display) — keep it as gross minus discounts? We'll show both
    const sub = totalGrossAmount - totalDiscountAmount;
    // net = sub (no tax/GST per request)
    const totalNetAmount = sub;
    return {
      sub,
      totalGrossAmount,
      totalDiscountAmount,
      totalNetAmount,
      // keep legacy fields for compatibility
      tax: 0,
      total: totalNetAmount,
    } as unknown as { sub: number; tax: number; total: number } & {
      totalGrossAmount: number;
      totalDiscountAmount: number;
      totalNetAmount: number;
    };
  }, [items]);

  const selectedCustomer = customers.find(
    (c) => String(c.id) === String(customerId)
  );

  // If customers are loaded after mount, ensure we pick a sensible default
  useEffect(() => {
    if ((customerId === "" || customerId == null) && customers?.length > 0) {
      setCustomerId(String(customers[0].id));
    }
  }, [customers, customerId]);

  // detect missing products and price diffs against current products
  const detectIssues = () => {
    const missing: LineItem[] = [];
    const priceDiffs: Array<{ item: LineItem; currentPrice: number }> = [];
    for (const it of items) {
      const prod = products.find((p) => String(p.id) === String(it.productId));
      if (!prod) missing.push(it);
      else {
        const current = prod.newPrice ?? prod.sellingPrice ?? 0;
        if (Number.isFinite(current) && current !== it.rate) {
          priceDiffs.push({ item: it, currentPrice: current });
        }
      }
    }
    return { missing, priceDiffs };
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: SalesPayload = {
      mode,
      docNo,
      docDate,
      validUntil: mode === "Quotation" ? validUntil : undefined,
      customerId,
      items,
      totals,
      remarks,
      terms,
    };
    onSubmit?.(payload);
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <Card.Section
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: 12,
          }}
        >
          <div>
            <Text style={{ fontSize: 18, fontWeight: 700 }}>{mode}</Text>
            <Text style={{ color: "#666" }}>Enter details and add items</Text>
          </div>
          <Badge variant="outline">{status}</Badge>
        </Card.Section>

        <Card.Section style={{ padding: 12 }}>
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(3, 1fr)",
            }}
          >
            <div>
              <Text style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                {mode} No.
              </Text>
              <TextInput
                id="docNo"
                value={docNo}
                onChange={(e) => setDocNo(e.target.value)}
                placeholder={`${mode === "Quotation" ? "QUO" : "INV"}-2025-001`}
              />
            </div>
            <div>
              <Text style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                {mode} Date
              </Text>
              <TextInput
                id="docDate"
                type="date"
                value={docDate}
                onChange={(e) => setDocDate(e.target.value)}
              />
            </div>
            {mode === "Quotation" ? (
              <div>
                <Text
                  style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}
                >
                  Valid Until
                </Text>
                <TextInput
                  id="valid"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <Text
                  style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}
                >
                  Payment Method
                </Text>
                <Select
                  data={["Cash", "Card", "UPI", "Cheque", "Credit"]}
                  defaultValue="Cash"
                />
              </div>
            )}
          </div>

          {/* Issues panel: missing products / price diffs */}
          {showImportIssues &&
            (() => {
              const issues = detectIssues();
              if (issues.missing.length === 0 && issues.priceDiffs.length === 0)
                return null;
              return (
                <div
                  style={{
                    marginTop: 8,
                    padding: 8,
                    border: "1px solid #ffd8a8",
                    borderRadius: 6,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>Import Issues</div>
                  {issues.missing.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ color: "#a60" }}>
                        Missing products: {issues.missing.length}
                      </div>
                      <ul>
                        {issues.missing.map((m) => (
                          <li key={m.id}>{m.productName || m.productId}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {issues.priceDiffs.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ color: "#a60" }}>
                        Price differences detected: {issues.priceDiffs.length}
                      </div>
                      <ul>
                        {issues.priceDiffs.map((d) => (
                          <li
                            key={d.item.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 12,
                            }}
                          >
                            <div>
                              {d.item.productName} — quoted: {d.item.rate} •
                              current: {d.currentPrice}
                            </div>
                            <div>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => {
                                  setItems((prev) =>
                                    prev.map((it) =>
                                      it.id === d.item.id
                                        ? { ...it, rate: d.currentPrice }
                                        : it
                                    )
                                  );
                                }}
                              >
                                Apply current price
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })()}

          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(2, 1fr)",
              marginTop: 12,
            }}
          >
            <div>
              <Text style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                Customer
              </Text>
              <Select
                value={String(customerId)}
                onChange={(v) => setCustomerId(String(v ?? ""))}
                data={customers.map((c) => ({
                  value: String(c.id),
                  label: `${c.name} — ${c.city}`,
                }))}
              />
            </div>
            <div>
              <Text style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                Customer Details
              </Text>
              {selectedCustomer ? (
                <Paper
                  style={{ padding: 12, boxShadow: "var(--mantine-shadow-xs)" }}
                >
                  <div style={{ fontWeight: 700 }}>{selectedCustomer.name}</div>
                  <div style={{ color: "#666", marginTop: 6 }}>
                    {selectedCustomer.address}
                  </div>
                  <div style={{ marginTop: 8, display: "flex", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#888" }}>Opening</div>
                      <div style={{ fontWeight: 700 }}>
                        {formatCurrency(selectedCustomer.openingBalance ?? 0)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "#888" }}>Current</div>
                      <div style={{ fontWeight: 700 }}>
                        {formatCurrency(selectedCustomer.currentBalance ?? 0)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "#888" }}>
                        Credit/Debit
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          color:
                            (selectedCustomer.currentBalance ?? 0) < 0
                              ? "red"
                              : "green",
                        }}
                      >
                        {Math.abs(selectedCustomer.currentBalance ?? 0) > 0
                          ? `${
                              (selectedCustomer.currentBalance ?? 0) < 0
                                ? "Debit"
                                : "Credit"
                            } ${formatCurrency(
                              Math.abs(selectedCustomer.currentBalance ?? 0)
                            )}`
                          : "Nil"}
                      </div>
                    </div>
                  </div>
                </Paper>
              ) : (
                <Textarea readOnly value={""} minRows={4} />
              )}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: 600 }}>Items</Text>
              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  setItems((prev) => [
                    ...prev,
                    {
                      id: generateId(),
                      productId: "",
                      productName: "",
                      unit: "pcs",
                      quantity: 1,
                      rate: 0,
                      discount: 0,
                      taxRate: 18,
                      amount: 0,
                    },
                  ])
                }
              >
                Add item
              </Button>
            </div>
            <LineItemsTable
              items={items}
              onChange={setItems}
              products={products}
            />
          </div>

          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(2, 1fr)",
              marginTop: 16,
            }}
          >
            <div>
              <Text style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                Remarks
              </Text>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.currentTarget.value)}
                minRows={3}
                placeholder="Additional notes"
              />
            </div>
            <div>
              <Text style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                Terms & Conditions
              </Text>
              <Textarea
                value={terms}
                onChange={(e) => setTerms(e.currentTarget.value)}
                minRows={3}
              />
            </div>
          </div>
        </Card.Section>

        <Card.Section
          style={{
            padding: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{ fontSize: 13, color: "var(--mantine-color-dimmed, #666)" }}
          >
            Date: {new Date(docDate).toLocaleDateString()} • Customer Balance:{" "}
            {Number(selectedCustomer?.currentBalance ?? 0).toLocaleString()}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#888" }}>Subtotal</div>
            <div style={{ fontSize: 14 }}>{totals.sub.toFixed(2)}</div>

            <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
              Total Gross Amount
            </div>
            <div style={{ fontSize: 14 }}>
              {totals.totalGrossAmount.toFixed(2)}
            </div>

            <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
              Total Discount Amount
            </div>
            <div style={{ fontSize: 14 }}>
              {totals.totalDiscountAmount.toFixed(2)}
            </div>

            <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
              Total Net Amount
            </div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {totals.totalNetAmount.toFixed(2)}
            </div>
          </div>
        </Card.Section>
      </Card>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          marginTop: 12,
        }}
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            try {
              // find GRNs that contain any of the SKUs in this invoice
              const allGrns = (ctx.grns || []) as any[];
              const skuSet = new Set(items.map((it) => String(it.productId)));
              const matched = allGrns.filter((g) =>
                (g.items || []).some((gi: any) => skuSet.has(String(gi.sku)))
              );

              const grnList = Array.from(
                new Set(matched.map((g) => g.grnNumber))
              ).filter(Boolean);

              const invoiceItems = items.map((it, idx) => ({
                sr: idx + 1,
                section: it.productName || it.productId,
                color: (it as any).color ?? undefined,
                thickness: (it as any).thickness ?? undefined,
                sizeFt: (it as any).length ?? undefined,
                lengths: it.quantity,
                totalFeet: undefined,
                rate: it.rate,
                amount: it.amount ?? (it.quantity || 0) * (it.rate || 0),
              }));

              // optionally append GRN reference rows
              const grnRows = matched.flatMap((g) => [
                {
                  sr: undefined,
                  section: `GRN: ${g.grnNumber} — ${g.supplierName ?? ""}`,
                },
                ...(g.items || []).map((gi: any) => ({
                  sr: undefined,
                  section: `  ${gi.sku ?? gi.description ?? ""}`,
                  color: gi.color ?? undefined,
                  thickness: gi.thickness ?? undefined,
                  sizeFt: gi.size ?? undefined,
                  lengths: gi.quantity,
                  totalFeet: gi.totalFeet ?? undefined,
                  rate: gi.price ?? undefined,
                  amount: (gi.quantity || 0) * (gi.price || 0),
                })),
              ]);

              const data: InvoiceData = {
                title: mode === "Invoice" ? "Sales Invoice" : "Quotation",
                companyName: "Seven Star Traders",
                addressLines: [
                  "Nasir Gardezi Road, Chowk Fawara, Bohar Gate Multan",
                ],
                invoiceNo: docNo,
                date: docDate,
                ms: selectedCustomer?.name ?? undefined,
                customer: selectedCustomer?.name ?? undefined,
                grn: grnList.length ? grnList.join(", ") : null,
                items: [...invoiceItems, ...grnRows],
                totals: {
                  subtotal: totals.sub,
                  tax: (totals as any).tax ?? 0,
                  total:
                    (totals as any).total ?? (totals as any).totalNetAmount,
                },
                footerNotes: [
                  "Extrusion & Powder Coating",
                  "Aluminum Window, Door, Profiles & All Kinds of Pipes",
                ],
              };
              openPrintWindow(data);
            } catch (err) {
              console.error("Failed to open print preview", err);
              window.print();
            }
          }}
        >
          Print
        </Button>
        <Button type="submit">Save {mode}</Button>
      </div>
    </form>
  );
}
