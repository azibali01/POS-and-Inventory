import { useState, useEffect } from "react";
import {
  Card,
  Group,
  Text,
  Title,
  Box,
  Button,
  Badge,
  Modal,
  ScrollArea,
} from "@mantine/core";
import Table from "../../../lib/AppTable";
// using Mantine modal and card components
import SalesDocShell, {
  type SalesPayload,
} from "../../../components/sales/SalesDocShell";
import type { SaleRecord } from "../../Context/DataContext";
import { useDataContext } from "../../Context/DataContext";
import { formatCurrency, formatDate } from "../../../lib/format-utils";
import { IconPlus, IconReceipt } from "@tabler/icons-react";
import openPrintWindow from "../../../components/print/printWindow";
import type { InvoiceData } from "../../../components/print/printTemplate";
import { showNotification } from "@mantine/notifications";

type Invoice = {
  id: string | number;
  invoiceNumber: string;
  invoiceDate: string | Date;
  customerName: string;
  totalAmount: number;
  status: string;
};

const sampleInvoices: Invoice[] = [
  {
    id: 1,
    invoiceNumber: "INV-2025-001",
    invoiceDate: new Date().toISOString(),
    customerName: "Aamir Traders",
    totalAmount: 12500,
    status: "Paid",
  },
  {
    id: 2,
    invoiceNumber: "INV-2025-002",
    invoiceDate: new Date().toISOString(),
    customerName: "Bilal Enterprises",
    totalAmount: 4200,
    status: "Pending",
  },
];

export default function SaleInvoicePage() {
  const [invoices] = useState<Invoice[]>(sampleInvoices);
  const { 
    customers, 
    inventory, 
    quotations, 
    setQuotations, 
    createSale,
    sales,
    salesLoading,
    loadSales 
  } = useDataContext();
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  type ImportPayload = Partial<SalesPayload> & {
    sourceQuotationId?: string | number;
  };
  const [initialPayload, setInitialPayload] = useState<ImportPayload | null>(
    null
  );

  const makeInvoiceNumber = () =>
    `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

  // Load sales data when component mounts
  useEffect(() => {
    if (typeof loadSales === "function") {
      loadSales().catch(console.error);
    }
  }, [loadSales]);

  // Convert sales records to invoice format for display
  const actualInvoices: Invoice[] = sales.map(sale => ({
    id: sale.id,
    invoiceNumber: `INV-${sale.id}`,
    invoiceDate: sale.date || new Date().toISOString(), // Fallback to current date if undefined
    customerName: sale.customer,
    totalAmount: sale.total,
    status: sale.status === "paid" ? "Paid" : sale.status === "pending" ? "Pending" : "Overdue"
  }));

  // Combine sample invoices with actual sales (you can remove sampleInvoices if not needed)
  const allInvoices = [...actualInvoices, ...invoices];

  return (
    <div>
      <Group mb="md" style={{ justifyContent: "space-between" }}>
        <div>
          <Title order={2}>Sales Invoices</Title>
          <Text color="dimmed">Create and track tax invoices</Text>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={() => setImportOpen(true)}>Import Quotation</Button>
          <Button leftSection={<IconPlus />} onClick={() => setOpen(true)}>
            New Invoice
          </Button>
        </div>
      </Group>

      <Card shadow="sm">
        <Box p="md">
          <Title order={4}>All Sales Invoices</Title>
          <Text color="dimmed">{allInvoices.length} invoices total</Text>
          <div style={{ marginTop: 12, overflowX: "auto" }}>
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
                  <Table.Th style={{ textAlign: "left" }}>Number</Table.Th>
                  <Table.Th style={{ textAlign: "left" }}>Date</Table.Th>
                  <Table.Th style={{ textAlign: "left" }}>Customer</Table.Th>
                  <Table.Th style={{ textAlign: "right" }}>Amount</Table.Th>
                  <Table.Th style={{ textAlign: "left" }}>Status</Table.Th>
                  <Table.Th style={{ textAlign: "right" }}>Action</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {salesLoading ? (
                  <Table.Tr>
                    <Table.Td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                      <Text color="dimmed">Loading sales data...</Text>
                    </Table.Td>
                  </Table.Tr>
                ) : allInvoices.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                      <Text color="dimmed">No sales invoices found</Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  allInvoices.map((inv) => (
                  <Table.Tr key={inv.id}>
                    <Table.Td style={{ fontFamily: "monospace" }}>
                      {inv.invoiceNumber}
                    </Table.Td>
                    <Table.Td>{formatDate(inv.invoiceDate)}</Table.Td>
                    <Table.Td>{inv.customerName}</Table.Td>
                    <Table.Td style={{ textAlign: "right" }}>
                      {formatCurrency(inv.totalAmount)}
                    </Table.Td>
                    <Table.Td>
                      <Badge 
                        variant="outline" 
                        color={
                          inv.status === "Paid" ? "green" : 
                          inv.status === "Pending" ? "yellow" : 
                          inv.status === "Overdue" ? "red" : "gray"
                        }
                      >
                        {inv.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 8,
                        }}
                      >
                        <Button variant="subtle" leftSection={<IconReceipt />}>
                          Open
                        </Button>
                        <Button
                          variant="subtle"
                          onClick={() => {
                            const invData: InvoiceData = {
                              title: "Sales Invoice",
                              companyName: "Seven Star Traders",
                              addressLines: [
                                "Nasir Gardezi Road, Chowk Fawara, Bohar Gate Multan",
                              ],
                              invoiceNo: inv.invoiceNumber,
                              date: inv.invoiceDate as string,
                              customer: inv.customerName,
                              items: [],
                              totals: { total: inv.totalAmount },
                            };
                            openPrintWindow(invData);
                          }}
                        >
                          Print
                        </Button>
                      </div>
                    </Table.Td>
                  </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </div>
        </Box>
      </Card>

      <Modal opened={open} onClose={() => setOpen(false)} size="80%">
        <ScrollArea >
          <SalesDocShell
            mode="Invoice"
            customers={customers}
            products={inventory}
            showImportIssues={false}
            onSubmit={async (payload: SalesPayload) => {
              // create invoice in memory
              const invId = `inv-${Date.now()}`;
              const invoiceNumber = makeInvoiceNumber();
              const invoiceDate = payload.docDate || new Date().toISOString();
              const customerName =
                customers.find(
                  (c) => String(c.id) === String(payload.customerId)
                )?.name ?? String(payload.customerId);
              const saleRecord: SaleRecord = {
                id: invId,
                date: invoiceDate,
                customer: customerName,
                items:
                  payload.items?.map((it) => ({
                    sku: it.productId || it.productName,
                    quantity: it.quantity,
                    price: it.rate,
                  })) ?? [],
                total: payload.totals.total,
                status: "pending",
              };

              // Create sale using context function
              try {
                await createSale({
                  id: saleRecord.id,
                  items: saleRecord.items,
                  total: saleRecord.total,
                  date: saleRecord.date,
                  customerId: saleRecord.customer,
                });
              } catch (err) {
                showNotification({
                  title: "Sale Persist Failed",
                  message: String(err),
                  color: "red",
                });
              }

              // mark quotation converted if referenced
              if (
                payload.sourceQuotationId &&
                typeof setQuotations === "function"
              ) {
                const now = new Date().toISOString();
                setQuotations((prev) =>
                  prev.map((q) =>
                    q.docNo === payload.sourceQuotationId ||
                    q.docNo === String(payload.sourceQuotationId)
                      ? {
                          ...q,
                          status: "converted",
                          convertedInvoiceId: invoiceNumber,
                          convertedAt: now,
                        }
                      : q
                  )
                );
              }

              setOpen(false);
            }}
          />
        </ScrollArea>
      </Modal>

      <Modal
        opened={importOpen}
        onClose={() => setImportOpen(false)}
        size="60%"
      >
        <ScrollArea style={{ maxHeight: 400 }}>
          <div style={{ padding: 12 }}>
            <h3>Quotations</h3>
            {quotations.length === 0 && <div>No quotations found</div>}
            <div style={{ display: "grid", gap: 8 }}>
              {quotations.map((q: SalesPayload, idx: number) => (
                <div
                  key={idx}
                  style={{
                    padding: 12,
                    border: "1px solid #f0f0f0",
                    borderRadius: 6,
                    background: "#fff",
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {q.docNo || `Quotation ${idx + 1}`}
                      </div>
                      <div style={{ color: "#666" }}>
                        Date:{" "}
                        {q.docDate
                          ? new Date(q.docDate).toLocaleDateString()
                          : "-"}
                        {q.validUntil
                          ? ` • Valid until ${new Date(
                              q.validUntil
                            ).toLocaleDateString()}`
                          : ""}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: "#888" }}>
                        {q.items?.length ?? 0} items
                      </div>
                      <div style={{ fontWeight: 700 }}>
                        {formatCurrency(q.totals?.total ?? 0)}
                      </div>
                    </div>
                  </div>

                  {q.items && q.items.length > 0 && (
                    <div
                      style={{
                        marginTop: 8,
                        borderTop: "1px dashed #eee",
                        paddingTop: 8,
                      }}
                    >
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
                            <Table.Th style={{ textAlign: "left" }}>
                              Item
                            </Table.Th>
                            <Table.Th style={{ textAlign: "right" }}>
                              Qty
                            </Table.Th>
                            <Table.Th style={{ textAlign: "right" }}>
                              Rate
                            </Table.Th>
                            <Table.Th style={{ textAlign: "right" }}>
                              Amount
                            </Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {q.items.map((it, i) => (
                            <Table.Tr key={it.id || i}>
                              <Table.Td>
                                {it.productName || it.productId}
                              </Table.Td>
                              <Table.Td style={{ textAlign: "right" }}>
                                {it.quantity}
                              </Table.Td>
                              <Table.Td style={{ textAlign: "right" }}>
                                {it.rate?.toFixed?.(2) ?? it.rate}
                              </Table.Td>
                              <Table.Td style={{ textAlign: "right" }}>
                                {((it.quantity || 0) * (it.rate || 0)).toFixed(
                                  2
                                )}
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    </div>
                  )}

                  {q.remarks && (
                    <div style={{ marginTop: 8, color: "#444" }}>
                      {q.remarks}
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      size="xs"
                      onClick={() => {
                        // pass a payload that includes sourceQuotationId so SalesDocShell can mark conversion
                        setInitialPayload({
                          ...q,
                          sourceQuotationId: q.docNo ?? `quo-${idx}`,
                        });
                        setImportOpen(false);
                        setOpen(true);
                      }}
                    >
                      Import
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </Modal>

      {/* when initialPayload is set we pass it to SalesDocShell via modal open */}
      {initialPayload && (
        <Modal
          opened={open}
          onClose={() => {
            setOpen(false);
            setInitialPayload(null);
          }}
          size="70%"
        >
          <ScrollArea style={{ height: "75vh" }}>
            <SalesDocShell
              mode="Invoice"
              customers={customers}
              products={inventory}
              initial={initialPayload}
              showImportIssues={false}
              onSubmit={async (payload: SalesPayload) => {
                // create invoice like above
                const invId = `inv-${Date.now()}`;
                const invoiceNumber = makeInvoiceNumber();
                const invoiceDate = payload.docDate || new Date().toISOString();
                const customerName =
                  customers.find(
                    (c) => String(c.id) === String(payload.customerId)
                  )?.name ?? String(payload.customerId);
                const saleRecord: SaleRecord = {
                  id: invId,
                  date: invoiceDate,
                  customer: customerName,
                  items:
                    payload.items?.map((it) => ({
                      sku: it.productId || it.productName,
                      quantity: it.quantity,
                      price: it.rate,
                    })) ?? [],
                  total: payload.totals.total,
                  status: "pending",
                };

                // Create sale using context function
                try {
                  await createSale({
                    id: saleRecord.id,
                    items: saleRecord.items,
                    total: saleRecord.total,
                    date: saleRecord.date,
                    customerId: saleRecord.customer,
                  });
                } catch (err) {
                  showNotification({
                    title: "Sale Persist Failed",
                    message: String(err),
                    color: "red",
                  });
                }

                if (
                  payload.sourceQuotationId &&
                  typeof setQuotations === "function"
                ) {
                  const now = new Date().toISOString();
                  setQuotations((prev) =>
                    prev.map((q) =>
                      q.docNo === payload.sourceQuotationId ||
                      q.docNo === String(payload.sourceQuotationId)
                        ? {
                            ...q,
                            status: "converted",
                            convertedInvoiceId: invoiceNumber,
                            convertedAt: now,
                          }
                        : q
                    )
                  );
                }

                setOpen(false);
                setInitialPayload(null);
              }}
            />
          </ScrollArea>
        </Modal>
      )}
    </div>
  );
}
