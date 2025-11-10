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
  Pagination,
  Select,
} from "@mantine/core";
// Removed DatePickerInput import
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

interface BankBookEntry {
  date: string | Date;
  particulars: string;
  receipt?: number;
  payment?: number;
  balance?: number;
  type: "Receipt" | "Payment";
  refNo?: string;
}

export default function BankBookPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<BankBookEntry | null>(null);
  // Date range state (fromDate, toDate as string)
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [q, setQ] = useState("");
  const [data, setData] = useState<BankBookEntry[]>([]);
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [editingOpening, setEditingOpening] = useState(false);
  const [tempOpening, setTempOpening] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<string>("25");

  useEffect(() => {
    async function fetchData() {
      const [receipts, payments, sales, purchases, expenses] =
        await Promise.all([
          getAllReceiptVouchers(),
          getAllPaymentVouchers(),
          getSales(),
          getPurchaseInvoices(),
          getExpenses(),
        ]);

      // Receipt Vouchers (Bank/Online In)
      const receiptEntries: BankBookEntry[] = (
        (receipts as ReceiptVoucherPayload[]) || []
      )
        .filter((r) => {
          const mode =
            typeof r.paymentMode === "string"
              ? r.paymentMode.toLowerCase()
              : "";
          return ["bank", "online", "bank/online"].includes(mode);
        })
        .map((r) => ({
          date: r.voucherDate,
          particulars: r.receivedFrom || "Receipt",
          receipt: r.amount,
          payment: 0,
          type: "Receipt",
          refNo: r.voucherNumber ? String(r.voucherNumber) : undefined,
        }));

      // Payment Vouchers (Bank/Online Out)
      const paymentEntries: BankBookEntry[] = (
        (payments as PaymentVoucherPayload[]) || []
      )
        .filter((p) => {
          const mode =
            typeof p.paymentMode === "string"
              ? p.paymentMode.toLowerCase()
              : "";
          return ["bank", "online", "bank/online"].includes(mode);
        })
        .map((p) => ({
          date: p.voucherDate,
          particulars: p.paidTo || "Payment",
          receipt: 0,
          payment: p.amount,
          type: "Payment",
          refNo: p.voucherNumber ? String(p.voucherNumber) : undefined,
        }));

      // Sale Invoices (Bank/Online In)
      const saleEntries: BankBookEntry[] = (
        (sales as SaleRecordPayload[]) || []
      )
        .filter((s) => {
          const mode =
            typeof s.paymentMethod === "string"
              ? s.paymentMethod.toLowerCase()
              : "";
          return ["bank", "online", "bank/online"].includes(mode);
        })
        .map((s) => ({
          date: s.invoiceDate ?? "",
          particulars: (s.customer && s.customer.name) || "Sale Invoice",
          receipt: s.totalNetAmount || s.totalGrossAmount || s.subTotal || 0,
          payment: 0,
          type: "Receipt",
          refNo: s.invoiceNumber ? String(s.invoiceNumber) : undefined,
        }));

      // Purchase Invoices (Bank/Online Out)
      const purchaseEntries: BankBookEntry[] = (
        (purchases as PurchaseInvoicePayload[]) || []
      )
        .filter((p) => {
          const mode = (p as { paymentMode?: string }).paymentMode;
          if (typeof mode !== "string") return false;
          return ["bank", "online", "bank/online"].includes(mode.toLowerCase());
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

      // Expenses (Bank/Online Out)
      const expenseEntries: BankBookEntry[] = Array.isArray(expenses)
        ? expenses
            .filter((e) => {
              const method =
                typeof e.paymentMethod === "string"
                  ? e.paymentMethod.toLowerCase()
                  : "";
              return ["bank", "card", "upi", "cheque"].includes(method);
            })
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

      const all = [
        ...receiptEntries,
        ...paymentEntries,
        ...saleEntries,
        ...purchaseEntries,
        ...expenseEntries,
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const opening = 0;
      setOpeningBalance(opening);
      setTempOpening(opening);
      let balance = opening;
      const withBalance = all.map((entry) => {
        balance += (entry.receipt || 0) - (entry.payment || 0);
        return { ...entry, balance };
      });
      setData(withBalance);
    }
    fetchData();
  }, []);

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
    const t = q.toLowerCase().trim();
    if (!t) return filteredData;
    return filteredData.filter(
      (v) =>
        v.particulars.toLowerCase().includes(t) ||
        (v.refNo && v.refNo.toLowerCase().includes(t))
    );
  }, [q, data, fromDate, toDate]);

  const totals = filtered.reduce(
    (acc, v) => {
      acc.receipt += v.receipt || 0;
      acc.payment += v.payment || 0;
      return acc;
    },
    { receipt: 0, payment: 0 }
  );

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / parseInt(itemsPerPage));
  const paginatedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * parseInt(itemsPerPage);
    const endIndex = startIndex + parseInt(itemsPerPage);
    return filtered.slice(startIndex, endIndex);
  }, [filtered, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [q, fromDate, toDate]);

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
          <Title order={2}>Bank Book</Title>
          <Text size="sm" color="dimmed">
            All bank/online receipts and payments with running balance
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
        <Group justify="space-between" mb="md" p="sm">
          <Stack gap={0}>
            <Text fw={600}>Bank Book Entries</Text>
            <Text size="sm" c="dimmed">
              Showing {paginatedEntries.length} of {filtered.length} entries
            </Text>
          </Stack>
          <Select
            value={itemsPerPage}
            onChange={(value) => {
              setItemsPerPage(value || "25");
              setCurrentPage(1);
            }}
            data={[
              { value: "10", label: "10 per page" },
              { value: "25", label: "25 per page" },
              { value: "50", label: "50 per page" },
              { value: "100", label: "100 per page" },
            ]}
            style={{ width: 140 }}
          />
        </Group>
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
                {paginatedEntries.map((v, idx) => (
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

        {totalPages > 1 && (
          <Group justify="center" mt="md" pb="md">
            <Pagination
              value={currentPage}
              onChange={setCurrentPage}
              total={totalPages}
              size="sm"
              withEdges
            />
          </Group>
        )}
      </Card>
    </div>
  );
}
