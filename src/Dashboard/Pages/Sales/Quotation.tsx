import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Group,
  ScrollArea,
  Table,
  Text,
  Title,
  Badge,
  Modal,
} from "@mantine/core";
import { IconFileText, IconPlus } from "@tabler/icons-react";
import { useDataContext } from "../../Context/DataContext";
import type { SaleRecord } from "../../Context/DataContext";
import SalesDocShell, {
  type SalesPayload,
} from "../../../components/sales/SalesDocShell";
import { showNotification } from "@mantine/notifications";

// Small fallback mock
const fallbackQuotes: SaleRecord[] = [
  {
    id: "1",
    date: new Date().toISOString(),
    customer: "Walk-in",
    items: [],
    total: 1200,
    status: "pending",
  },
];

export default function QuotationsPage() {
  const { sales, setSales } = useDataContext();
  const { customers, inventory } = useDataContext();
  const [open, setOpen] = useState(false);
  const [, setCreating] = useState(false);

  // form state for creating quotation

  const quotes = (
    sales && sales.length ? sales : fallbackQuotes
  ) as Partial<SaleRecord>[];

  // optimistic create handler: accepts payload from SalesDocShell
  async function handleCreate(payload: {
    customer: string;
    items: { sku: string; quantity: number; price: number }[];
    total: number;
    status?: string;
  }) {
    if (!payload.customer || payload.total == null) {
      showNotification({
        title: "Validation",
        message: "Customer and total are required",
        color: "red",
      });
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const temp: SaleRecord = {
      id: tempId,
      date: new Date().toISOString(),
      customer: payload.customer,
      items: payload.items || [],
      total: payload.total,
      status:
        payload.status === "pending" ||
        payload.status === "paid" ||
        payload.status === "overdue"
          ? payload.status
          : "pending",
    };

    // optimistic UI
    setSales((prev) => [temp, ...prev]);
    setCreating(true);
    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server returned ${res.status}: ${text}`);
      }
      const created: SaleRecord = await res.json();

      // replace temp with created response
      setSales((prev) => prev.map((s) => (s.id === tempId ? created : s)));
      setOpen(false);
      showNotification({
        title: "Success",
        message: "Quotation created",
        color: "green",
      });
    } catch (err: unknown) {
      console.error("Create quotation failed", err);
      // rollback optimistic record
      setSales((prev) => prev.filter((s) => s.id !== tempId));
      const message = err instanceof Error ? err.message : String(err);
      showNotification({
        title: "Error",
        message: message || "Failed to create quotation",
        color: "red",
      });
    } finally {
      setCreating(false);
    }
  }
  return (
    <div>
      <Box mb="md">
        <Group justify="space-between">
          <div>
            <Title order={2}>Quotations</Title>
            <Text color="dimmed">Prepare and manage sales quotations</Text>
          </div>
          <div>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setOpen(true)}
            >
              New Quotation
            </Button>
          </div>
        </Group>
      </Box>

      <Card>
        <Card.Section>
          <Box p="md">
            <Text fw={700}>Recent Quotations</Text>
            <Text c="dimmed">Last {quotes.length} quotations</Text>
          </Box>
        </Card.Section>
        <Card.Section>
          <ScrollArea>
            <Table verticalSpacing="sm">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q: Partial<SaleRecord>) => (
                  <tr key={q.id}>
                    <td style={{ fontFamily: "monospace" }}>{q.id}</td>
                    <td>
                      {q.date ? new Date(q.date).toLocaleDateString() : ""}
                    </td>
                    <td>{q.customer ?? ""}</td>
                    <td style={{ textAlign: "right" }}>{q.total ?? 0}</td>
                    <td>
                      <Badge>{q.status ?? "Draft"}</Badge>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Button variant="subtle">
                        <IconFileText size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ScrollArea>
        </Card.Section>
      </Card>

      <Modal opened={open} onClose={() => setOpen(false)} size="100%">
        <Box p="md">
          <Text fw={700}>Create Quotation</Text>
          <Text c="dimmed" mb="md">
            Quick create: enter customer and total. For full editor, replace
            with your SalesDocShell.
          </Text>

          <SalesDocShell
            mode="Quotation"
            customers={customers}
            products={inventory}
            showImportIssues={false}
            onSubmit={(payload: SalesPayload) => {
              const cust = customers.find(
                (c) => String(c.id) === String(payload.customerId)
              );
              const customerName = cust
                ? cust.name
                : String(payload.customerId ?? "");
              handleCreate({
                customer: customerName,
                items: (payload.items || []).map((it) => ({
                  sku: it.productId || it.productName,
                  quantity: it.quantity,
                  price: it.rate,
                })),
                total: payload.totals.total,
              });
            }}
          />
        </Box>
      </Modal>
    </div>
  );
}
