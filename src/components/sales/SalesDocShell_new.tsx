"use client";

import React, { useMemo, useState } from "react";
import {
  Card,
  TextInput,
  Textarea,
  Button,
  Badge,
  Select,
  Text,
} from "@mantine/core";
import LineItemsTable from "./line-items-table";
import type { LineItem } from "./line-items-table";
import type {
  Customer,
  InventoryItem,
} from "../../Dashboard/Context/DataContext";

export interface SalesPayload {
  mode: "Quotation" | "Invoice";
  docNo: string;
  docDate: string;
  validUntil?: string;
  customerId: string | number;
  items: LineItem[];
  totals: { sub: number; total: number };
  remarks: string;
  terms: string;
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
}: {
  mode: "Quotation" | "Invoice";
  onSubmit?: (payload: SalesPayload) => void;
  customers?: Customer[];
  products?: InventoryItem[];
}) {
  const customers = propCustomers ?? [];
  const products = propProducts ?? [];

  const [docNo, setDocNo] = useState("");
  const [docDate, setDocDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [validUntil, setValidUntil] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>(
    String(customers[0]?.id ?? "")
  );
  const [remarks, setRemarks] = useState("");

  const [items, setItems] = useState<LineItem[]>([
    {
      id: generateId(),
      productId: "",
      productName: "",
      unit: "pcs",
      quantity: 1,
      rate: 0,
      discount: 0,
      amount: 0,
    },
  ]);

  const status = mode === "Quotation" ? "Draft" : "Confirmed";

  const totals = useMemo(() => {
    const sub = items.reduce(
      (s, i) => s + i.quantity * i.rate - (i.discount || 0),
      0
    );
    return { sub, total: sub };
  }, [items]);

  const selectedCustomer = customers.find(
    (c) => String(c.id) === String(customerId)
  );

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
              <Textarea
                readOnly
                value={
                  selectedCustomer
                    ? `${selectedCustomer.name}\n${selectedCustomer.address}\n${selectedCustomer.city}`
                    : ""
                }
                minRows={4}
              />
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
            {selectedCustomer?.paymentType === "debit" ? "-" : ""}
            {Number(selectedCustomer?.openingAmount ?? 0).toLocaleString()}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#888" }}>Subtotal</div>
            <div style={{ fontSize: 14 }}>{totals.sub.toFixed(2)}</div>
            {/* GST removed */}
            <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
              Total
            </div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {totals.total.toFixed(2)}
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
        <Button type="button" variant="outline" onClick={() => window.print()}>
          Print
        </Button>
        <Button type="submit">Save {mode}</Button>
      </div>
    </form>
  );
}
