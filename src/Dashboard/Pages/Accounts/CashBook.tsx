import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Text,
  Group,
  ScrollArea,
  TextInput,
  Title,
  NumberInput,
  Button,
  Modal,
  Stack,
  Divider,
} from "@mantine/core";
import Table from "../../../lib/AppTable";
import { formatCurrency, formatDate } from "../../../lib/format-utils";
import {
  getAllReceiptVouchers,
  getAllPaymentVouchers,
  getSales,
  getPurchaseInvoices,
  getExpenses,
} from "../../../lib/api";
import type {
  ReceiptVoucherPayload,
  PaymentVoucherPayload,
  SaleRecordPayload,
  PurchaseInvoicePayload,
} from "../../../lib/api";

// CashBookEntry type for unified mapping
interface CashBookEntry {
  date: string | Date;
  particulars: string;
  receipt?: number;
  payment?: number;
  balance?: number;
  type: "Receipt" | "Payment";
  refNo?: string;
}

export default function CashBookPage() {
  // Modal state for transaction details
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<CashBookEntry | null>(null);
  // Date range state (fromDate, toDate as string)
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [q, setQ] = useState("");
  const [data, setData] = useState<CashBookEntry[]>([]);
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [editingOpening, setEditingOpening] = useState(false);
  const [tempOpening, setTempOpening] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      // Fetch all data in parallel
      const [receipts, payments, sales, purchases, expenses] =
        await Promise.all([
          getAllReceiptVouchers(),
          getAllPaymentVouchers(),
          getSales(),
          getPurchaseInvoices(),
          getExpenses(),
        ]);

      // Receipt Vouchers (Cash In)
      const receiptEntries: CashBookEntry[] = (
        (receipts as ReceiptVoucherPayload[]) || []
      )
        .filter((r) => r.paymentMode?.toLowerCase() === "cash")
        .map((r) => ({
          date: r.voucherDate,
          particulars: r.receivedFrom || "Receipt",
          receipt: r.amount,
          payment: 0,
          type: "Receipt",
          refNo: r.voucherNumber ? String(r.voucherNumber) : undefined,
        }));

      // Payment Vouchers (Cash Out)
      const paymentEntries: CashBookEntry[] = (
        (payments as PaymentVoucherPayload[]) || []
      )
        .filter((p) => p.paymentMode?.toLowerCase() === "cash")
        .map((p) => ({
          date: p.voucherDate,
          particulars: p.paidTo || "Payment",
          receipt: 0,
          payment: p.amount,
          type: "Payment",
          refNo: p.voucherNumber ? String(p.voucherNumber) : undefined,
        }));

      // Sale Invoices (Cash In)
      const saleEntries: CashBookEntry[] = (
        (sales as SaleRecordPayload[]) || []
      )
        .filter((s) => s.paymentMethod?.toLowerCase() === "cash")
        .map((s) => ({
          date: s.invoiceDate ?? "",
          particulars: (s.customer && s.customer.name) || "Sale Invoice",
          receipt: s.totalNetAmount || s.totalGrossAmount || s.subTotal || 0,
          payment: 0,
          type: "Receipt",
          refNo: s.invoiceNumber ? String(s.invoiceNumber) : undefined,
        }));

      // Purchase Invoices (Cash Out)
      const purchaseEntries: CashBookEntry[] = (
        (purchases as PurchaseInvoicePayload[]) || []
      )
        .filter((p) => {
          const mode = (p as { paymentMode?: string }).paymentMode;
          return typeof mode === "string" && mode.toLowerCase() === "cash";
        })
        .map((p) => ({
          date: p.invoiceDate ?? "",
          particulars:
            typeof p.supplierId === "string"
              ? p.supplierId
              : "Purchase Invoice",
          receipt: 0,
          payment: p.total || p.subTotal || 0,
          type: "Payment",
          refNo: p.purchaseInvoiceNumber
            ? String(p.purchaseInvoiceNumber)
            : undefined,
        }));

      // Expenses (Cash Out)
      const expenseEntries: CashBookEntry[] = Array.isArray(expenses)
        ? expenses
            .filter((e) => e.paymentMethod?.toLowerCase() === "cash")
            .map((e) => ({
              date: e.date ?? "",
              particulars: e.categoryType
                ? `${e.categoryType} Expense${
                    e.description ? ": " + e.description : ""
                  }`
                : e.description || "Expense",
              receipt: 0,
              payment: e.amount || 0,
              type: "Payment",
              refNo: e.expenseNumber ? String(e.expenseNumber) : undefined,
            }))
        : [];

      // Combine all entries and sort by date
      const all = [
        ...receiptEntries,
        ...paymentEntries,
        ...saleEntries,
        ...purchaseEntries,
        ...expenseEntries,
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Opening balance (could be fetched from backend or set to 0)
      const opening = 0;
      setOpeningBalance(opening);
      setTempOpening(opening);
      // Calculate running balance
      let balance = opening;
      const withBalance = all.map((entry) => {
        balance += (entry.receipt || 0) - (entry.payment || 0);
        return { ...entry, balance };
      });
      setData(withBalance);
    }
    fetchData();
  }, []);

  // Filter by search and date range
  const filtered = useMemo(() => {
    let filteredData = data;
    // Date range filter
    const start = fromDate ? new Date(fromDate) : null;
    const end = toDate ? new Date(toDate) : null;
    if (start || end) {
      filteredData = filteredData.filter((v) => {
        const d = new Date(v.date);
        if (start && d < start) return false;
        if (end && d > end) return false;
        return true;
      });
    }
    // Search filter
    const t = q.toLowerCase().trim();
    if (!t) return filteredData;
    return filteredData.filter(
      (v) =>
        v.particulars.toLowerCase().includes(t) ||
        (v.refNo && v.refNo.toLowerCase().includes(t))
    );
  }, [q, data, fromDate, toDate]);

  // Calculate totals for filtered data
  const totals = filtered.reduce(
    (acc, v) => {
      acc.receipt += v.receipt || 0;
      acc.payment += v.payment || 0;
      return acc;
    },
    { receipt: 0, payment: 0 }
  );

  // Recalculate running balance if opening balance changes
  useEffect(() => {
    let balance = openingBalance;
    const withBalance = data.map((entry) => {
      balance += (entry.receipt || 0) - (entry.payment || 0);
      return { ...entry, balance };
    });
    setData(withBalance);
    // eslint-disable-next-line
  }, [openingBalance]);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Group justify="apart" align="center">
        <div>
          <Title order={2}>Cash Book</Title>
          <Text size="sm" color="dimmed">
            All cash receipts and payments with running balance
          </Text>
        </div>
      </Group>
      <Group justify="space-between" align="center" wrap="wrap" gap={10}>
        <Group>
          <TextInput
            w={300}
            mt={20}
            placeholder="Search by particulars or ref no..."
            value={q}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQ(e.currentTarget.value)
            }
          />
          <TextInput
            type="date"
            label="From Date"
            w={220}
            value={fromDate}
            onChange={(e) => setFromDate(e.currentTarget.value)}
            mx={4}
            style={{ minWidth: 140 }}
          />
          <TextInput
            type="date"
            label="To Date"
            w={220}
            value={toDate}
            onChange={(e) => setToDate(e.currentTarget.value)}
            mx={4}
            style={{ minWidth: 140 }}
          />
          <Button
            w={100}
            size="sm"
            mt={25}
            onClick={() => {
              setFromDate("");
              setToDate("");
            }}
          >
            Clear
          </Button>
        </Group>
        <div>
          {editingOpening ? (
            <Group>
              <NumberInput
                label="Opening Balance"
                value={tempOpening}
                onChange={(val) => setTempOpening(Number(val) || 0)}
                hideControls
                styles={{ input: { width: 120 } }}
              />
              <Button
                size="xs"
                color="green"
                onClick={() => {
                  setOpeningBalance(tempOpening);
                  setEditingOpening(false);
                }}
              >
                Save
              </Button>
              <Button
                size="xs"
                variant="default"
                onClick={() => {
                  setTempOpening(openingBalance);
                  setEditingOpening(false);
                }}
              >
                Cancel
              </Button>
            </Group>
          ) : (
            <Group>
              <Text size="sm" color="dimmed">
                Opening Balance:
              </Text>
              <Text fw={700}>{formatCurrency(openingBalance)}</Text>
              <Button
                size="xs"
                variant="default"
                onClick={() => setEditingOpening(true)}
              >
                Edit
              </Button>
            </Group>
          )}
        </div>
      </Group>
      <Card>
        <Card.Section>
          <ScrollArea>
            <Table
              highlightOnHover
              withRowBorders
              withColumnBorders
              withTableBorder
            >
              <Table.Thead
                style={{ background: "var(--mantine-color-gray-1, #f8f9fa)" }}
              >
                <tr>
                  <th>Date</th>
                  <th>Ref No</th>
                  <th>Particulars</th>
                  <th style={{ textAlign: "right" }}>Receipt (In)</th>
                  <th style={{ textAlign: "right" }}>Payment (Out)</th>
                  <th style={{ textAlign: "right" }}>Balance</th>
                </tr>
              </Table.Thead>
              <tbody>
                {/* Opening Balance Row */}
                <tr style={{ fontWeight: 600, background: "#f6f6f6" }}>
                  <td colSpan={3}>Opening Balance</td>
                  <td style={{ textAlign: "right" }}></td>
                  <td style={{ textAlign: "right" }}></td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(openingBalance)}
                  </td>
                </tr>
                {filtered.map((v, idx) => (
                  <tr
                    key={idx}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setSelectedTxn(v);
                      setModalOpen(true);
                    }}
                  >
                    <td>{formatDate(v.date)}</td>
                    <td>{v.refNo}</td>
                    <td>{v.particulars}</td>
                    <td style={{ textAlign: "right" }}>
                      {v.receipt ? formatCurrency(v.receipt) : ""}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {v.payment ? formatCurrency(v.payment) : ""}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>
                      {formatCurrency(v.balance || 0)}
                    </td>
                  </tr>
                ))}
                {/* Transaction Details Modal */}
                <Modal
                  opened={modalOpen}
                  onClose={() => setModalOpen(false)}
                  title="Transaction Details"
                  size="md"
                  centered
                >
                  {selectedTxn && (
                    <Stack gap={6}>
                      <Group justify="space-between">
                        <Text size="sm" color="dimmed">
                          Date
                        </Text>
                        <Text>{formatDate(selectedTxn.date)}</Text>
                      </Group>
                      <Divider my={2} />
                      <Group justify="space-between">
                        <Text size="sm" color="dimmed">
                          Type
                        </Text>
                        <Text>{selectedTxn.type}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" color="dimmed">
                          Ref No
                        </Text>
                        <Text>{selectedTxn.refNo || "-"}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" color="dimmed">
                          Particulars
                        </Text>
                        <Text>{selectedTxn.particulars}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" color="dimmed">
                          Receipt (In)
                        </Text>
                        <Text>
                          {selectedTxn.receipt
                            ? formatCurrency(selectedTxn.receipt)
                            : "-"}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" color="dimmed">
                          Payment (Out)
                        </Text>
                        <Text>
                          {selectedTxn.payment
                            ? formatCurrency(selectedTxn.payment)
                            : "-"}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" color="dimmed">
                          Balance After
                        </Text>
                        <Text>{formatCurrency(selectedTxn.balance || 0)}</Text>
                      </Group>
                    </Stack>
                  )}
                </Modal>
                {/* Totals Row */}
                <tr style={{ fontWeight: 700, background: "#f0f0f0" }}>
                  <td colSpan={3}>Totals</td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(totals.receipt)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(totals.payment)}
                  </td>
                  <td style={{ textAlign: "right" }}></td>
                </tr>
              </tbody>
            </Table>
          </ScrollArea>
        </Card.Section>
      </Card>
    </div>
  );
}
