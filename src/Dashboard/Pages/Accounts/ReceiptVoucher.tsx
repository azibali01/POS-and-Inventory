"use client";

import { useMemo, useState } from "react";

import {
  Card,
  Text,
  Group,
  ScrollArea,
  TextInput,
  Button,
  Title,
  Table,
} from "@mantine/core";
import { ReceiptForm } from "../../../components/accounts/receipt-form";
import { formatCurrency, formatDate } from "../../../lib/format-utils";
import { Plus, Search } from "lucide-react";

// Local type describing a receipt voucher used by this component.
// If you already have a shared type elsewhere, replace this with an import.
interface ReceiptVoucher {
  id: string;
  voucherNumber: string;
  voucherDate: string | Date; // ISO date string or Date
  receivedFrom: string;
  paymentMode: string;
  reference?: string;
  amount: number;
}

export default function ReceiptsPage() {
  const [q, setQ] = useState("");
  const [data, setData] = useState<ReceiptVoucher[]>([]);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim();
    if (!t) return data;
    return data.filter(
      (v) =>
        v.voucherNumber.toLowerCase().includes(t) ||
        v.receivedFrom.toLowerCase().includes(t) ||
        v.paymentMode.toLowerCase().includes(t) ||
        (v.reference ?? "").toLowerCase().includes(t)
    );
  }, [q, data]);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Group justify="apart" align="center">
        <div>
          <Title order={2}>Receipts</Title>
          <Text size="sm" color="dimmed">
            Record money received from customers and others
          </Text>
        </div>

        <Group gap="sm">
          <div style={{ position: "relative", width: 300 }}>
            <Search
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--mantine-color-dimmed)",
              }}
            />
            <TextInput
              placeholder="Search receipts..."
              value={q}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setQ(e.currentTarget.value)
              }
              style={{ paddingLeft: 36 }}
            />
          </div>
          <Button leftSection={<Plus />} onClick={() => setOpen(true)}>
            Add Receipt
          </Button>
        </Group>
      </Group>

      <Card>
        <Group justify="apart" style={{ padding: 16 }}>
          <div>
            <Text fw={600}>All Receipts</Text>
            <Text size="sm" c="dimmed">
              {filtered.length} found
            </Text>
          </div>
        </Group>

        <Card.Section>
          <ScrollArea>
            <Table highlightOnHover verticalSpacing="md">
              <thead>
                <tr>
                  <th>Voucher No</th>
                  <th>Date</th>
                  <th>Received From</th>
                  <th>Mode</th>
                  <th>Reference</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>
                      {v.voucherNumber}
                    </td>
                    <td>{formatDate(v.voucherDate)}</td>
                    <td style={{ fontWeight: 600 }}>{v.receivedFrom}</td>
                    <td style={{ color: "var(--mantine-color-dimmed)" }}>
                      {v.paymentMode}
                    </td>
                    <td style={{ color: "var(--mantine-color-dimmed)" }}>
                      {v.reference}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>
                      {formatCurrency(v.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ScrollArea>
        </Card.Section>
      </Card>

      <ReceiptForm
        open={open}
        onOpenChange={setOpen}
        onSave={(payload: ReceiptVoucher) =>
          setData((prev) => [payload, ...prev])
        }
      />
    </div>
  );
}
