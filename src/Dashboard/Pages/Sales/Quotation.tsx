import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  Group,
  ScrollArea,
  Text,
  Title,
  Badge,
  Modal,
} from "@mantine/core";
import Table from "../../../lib/AppTable";
import { IconFileText, IconPlus } from "@tabler/icons-react";
import openPrintWindow from "../../../components/print/printWindow";
import type { InvoiceData } from "../../../components/print/printTemplate";
import { useDataContext } from "../../Context/DataContext";
import type { SaleRecord } from "../../Context/DataContext";
import SalesDocShell, {
  type SalesPayload,
} from "../../../components/sales/SalesDocShell";
import { showNotification } from "@mantine/notifications";

export default function QuotationsPage() {
  const {
    sales,
    setSales,
    loadSales,
    customers,
    inventory,
    loadCustomers,
    loadInventory,
  } = useDataContext();

  useEffect(() => {
    // load sales/customers/inventory lazily when this page mounts (if not already loaded)
    if ((!sales || sales.length === 0) && typeof loadSales === "function") {
      loadSales().catch(() => {});
    }
    if (
      (!customers || customers.length === 0) &&
      typeof loadCustomers === "function"
    ) {
      loadCustomers().catch(() => {});
    }
    if (
      (!inventory || inventory.length === 0) &&
      typeof loadInventory === "function"
    ) {
      loadInventory().catch(() => {});
    }
  }, [loadSales, loadCustomers, loadInventory]);
  const [open, setOpen] = useState(false);
  const [, setCreating] = useState(false);

  // form state for creating quotation

  const quotes = (sales || []) as Partial<SaleRecord>[];

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
      showNotification({
        title: "Create Quotation Failed",
        message: String(err),
        color: "red",
      });
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
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Number</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Customer</Table.Th>
                  <Table.Th style={{ textAlign: "right" }}>Amount</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th style={{ textAlign: "right" }}>Action</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {quotes.map((q: Partial<SaleRecord>) => (
                  <Table.Tr key={q.id}>
                    <Table.Td style={{ fontFamily: "monospace" }}>
                      {q.id}
                    </Table.Td>
                    <Table.Td>
                      {q.date ? new Date(q.date).toLocaleDateString() : ""}
                    </Table.Td>
                    <Table.Td>{q.customer ?? ""}</Table.Td>
                    <Table.Td style={{ textAlign: "right" }}>
                      {q.total ?? 0}
                    </Table.Td>
                    <Table.Td>
                      <Badge>{q.status ?? "Draft"}</Badge>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 6,
                        }}
                      >
                        <Button variant="subtle">
                          <IconFileText size={16} />
                        </Button>
                        <Button
                          variant="subtle"
                          onClick={() => {
                            const d: InvoiceData = {
                              title: "Quotation",
                              companyName: "Seven Star Traders",
                              addressLines: [
                                "Nasir Gardezi Road, Chowk Fawara, Bohar Gate Multan",
                              ],
                              invoiceNo: String(q.id),
                              date: q.date as string,
                              customer: q.customer as string,
                              items: (q.items || []).map((it, idx) => ({
                                sr: idx + 1,
                                section: it.sku || "",
                                amount: (it.quantity || 0) * (it.price || 0),
                              })),
                              totals: { total: (q.total as number) || 0 },
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
