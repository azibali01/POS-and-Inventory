import { useMemo, useState, useEffect } from "react";
import {
  Button,
  Modal,
  TextInput,
  Select,
  NumberInput,
  Group,
} from "@mantine/core";
import Table from "../../lib/AppTable";
import { Plus, Trash2 } from "lucide-react";
// import { deleteExpense } from "../../lib/api";

import type {
  Expense as ExpenseType,
  ExpenseInput,
} from "../Context/DataContext";

// Use the provided ExpensePayload interface for backend API
export interface ExpensePayload {
  expenseNumber?: string;
  amount: number;
  date?: string;
  categoryType?:
    | "Rent"
    | "Utilities"
    | "Transportation"
    | "Salary"
    | "Maintenance"
    | "Other";
  description?: string;
  reference?: string;
  paymentMethod?: string;
  remarks?: string;
  metadata?: Record<string, unknown>;
}
import { useDataContext } from "../Context/DataContext";

function formatCurrency(value: number) {
  // format as currency using user's locale; change currency code if needed
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "PKR",
  }).format(value);
}

function formatDate(value?: string | Date) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  // produce a short locale date string; adjust options for different formats
  return d.toLocaleDateString();
}

const categories = [
  "Rent",
  "Utilities",
  "Transportation",
  "Salary",
  "Stationery",
  "Misc",
] as const;

export default function ExpensesPage() {
  // Find the next expense number in the format EXP-0001
  function getNextExpenseNumber() {
    const numbers = expenses
      .map((e) => {
        const match = String(e.expenseNumber || e.expenseNumber || "").match(
          /EXP-(\d+)/
        );
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const max = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `EXP-${String(max + 1).padStart(4, "0")}`;
  }
  const [q, setQ] = useState("");
  const dataCtx = useDataContext();
  const { loadExpenses } = dataCtx;
  const expenses = useMemo(() => dataCtx.expenses ?? [], [dataCtx.expenses]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Handle delete API call
  async function handleDelete(expenseNumber: string) {
    setDeletingId(expenseNumber);
    try {
      await dataCtx.deleteExpense?.(expenseNumber);
      // No need to setLastSaved, DataContext will update state
    } catch (err) {
      // Optionally show error
    } finally {
      setDeletingId(null);
    }
  }
  // Track when a save occurs to trigger refetch
  const [lastSaved, setLastSaved] = useState(0);

  // Always fetch all expenses from backend on mount and when opened
  useEffect(() => {
    if (typeof loadExpenses === "function") {
      loadExpenses().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // (Optional) Also keep the original effect for empty context, if needed
  // useEffect(() => {
  //   if (
  //     (!dataCtx.expenses || dataCtx.expenses.length === 0) &&
  //     typeof loadExpenses === "function"
  //   ) {
  //     loadExpenses().catch(() => {});
  //   }
  // }, [loadExpenses]);

  // Refetch expenses after a save
  useEffect(() => {
    if (lastSaved > 0 && typeof loadExpenses === "function") {
      loadExpenses().catch(() => {});
    }
  }, [lastSaved, loadExpenses]);

  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim();
    if (!t) return expenses;
    return expenses.filter(
      (e: ExpenseType) =>
        e.expenseNumber.toLowerCase().includes(t) ||
        e.categoryType.toLowerCase().includes(t) ||
        (e.description || "").toLowerCase().includes(t)
    );
  }, [q, expenses]);

  return (
    <div>
      <Group justify="space-between" mb="md">
        <TextInput
          placeholder="Search expenses..."
          value={q}
          onChange={(e) => setQ(e.currentTarget.value)}
          style={{ flex: 1, maxWidth: 420 }}
        />
        <Button leftSection={<Plus />} onClick={() => setOpen(true)}>
          Add Expense
        </Button>
      </Group>

      <Table
        highlightOnHover
        withColumnBorders
        withRowBorders
        withTableBorder
        bg={"gray.1"}
      >
        <thead>
          <tr>
            <th>Number</th>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Payment Method</th>
            <th style={{ textAlign: "right" }}>Amount</th>
            <th style={{ textAlign: "center" }}>Delete</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((e: ExpenseType) => (
            <tr
              key={e.id}
              style={{ cursor: "pointer" }}
              onClick={(event) => {
                // Prevent row click if delete icon is clicked
                if (
                  (event.target as HTMLElement).closest(".delete-expense-btn")
                )
                  return;
                setEditing(e);
              }}
            >
              <td>{e.expenseNumber}</td>
              <td>{formatDate(e.date)}</td>
              <td>{e.categoryType}</td>
              <td
                style={{
                  maxWidth: 420,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {e.description}
              </td>
              <td>{e.paymentMethod}</td>
              <td style={{ textAlign: "right" }}>{formatCurrency(e.amount)}</td>
              <td style={{ textAlign: "center" }}>
                <Button
                  color="red"
                  size="xs"
                  variant="subtle"
                  className="delete-expense-btn"
                  loading={deletingId === e.expenseNumber}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    handleDelete(e.expenseNumber);
                  }}
                  title="Delete Expense"
                >
                  <Trash2 size={16} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <AddExpenseDialogMantine
        open={open}
        onOpenChange={setOpen}
        nextExpenseNumber={getNextExpenseNumber()}
        onSave={(payload: ExpensePayload) => {
          // Convert ExpensePayload to ExpenseInput for addExpense
          const expenseInput: ExpenseInput = {
            expenseNumber: payload.expenseNumber ?? "",
            date: payload.date ?? "",
            categoryType:
              payload.categoryType === "Maintenance"
                ? "Stationery"
                : payload.categoryType === "Other"
                ? "Misc"
                : (payload.categoryType as ExpenseInput["categoryType"]),
            description: payload.description ?? "",
            amount: payload.amount,
            paymentMethod:
              payload.paymentMethod as ExpenseInput["paymentMethod"],
            reference: payload.reference ?? "",
            remarks: payload.remarks ?? "",
          };
          (dataCtx as { addExpense?: (p: ExpenseInput) => void }).addExpense?.(
            expenseInput
          );
          setLastSaved(Date.now()); // trigger refetch
        }}
      />
      {editing && (
        <EditExpenseDialogMantine
          expense={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            dataCtx.updateExpense?.(editing.id, patch as Partial<ExpenseType>);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function AddExpenseDialogMantine({
  open,
  onOpenChange,
  onSave,
  nextExpenseNumber,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (payload: ExpensePayload) => void;
  nextExpenseNumber: string;
}) {
  const [expenseNumber, setExpenseNumber] = useState("");

  const [expenseDate, setExpenseDate] = useState<string>("");
  const [category, setCategory] = useState<string>(categories[0]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] =
    useState<ExpenseType["paymentMethod"]>("Cash");
  const [reference, setReference] = useState("");
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // When modal opens, set all fields, including the next expense number
  useEffect(() => {
    if (open) {
      setExpenseNumber(nextExpenseNumber);
      setExpenseDate(new Date().toISOString().slice(0, 10));
      setCategory(categories[0]);
      setDescription("");
      setAmount(undefined);
      setPaymentMethod("Cash");
      setReference("");
      setRemarks("");
      setErrors({});
    }
  }, [open, nextExpenseNumber]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!expenseNumber.trim()) e.expenseNumber = "Expense number is required";
    if (!expenseDate) e.expenseDate = "Date is required";
    if (!(Number(amount) > 0)) e.amount = "Amount must be positive";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // Map UI category to ExpensePayload categoryType
  function mapCategoryToPayload(cat: string): ExpensePayload["categoryType"] {
    switch (cat) {
      case "Rent":
      case "Utilities":
      case "Transportation":
      case "Salary":
        return cat;
      case "Stationery":
        return "Maintenance";
      case "Misc":
        return "Other";
      default:
        return "Other";
    }
  }

  return (
    <Modal
      opened={open}
      onClose={() => onOpenChange(false)}
      title="Add Expense"
    >
      <TextInput
        label="Expense No"
        value={expenseNumber}
        onChange={(e) => setExpenseNumber(e.currentTarget.value)}
        placeholder="EXP-2025-001"
      />
      {errors.expenseNumber && (
        <div style={{ color: "#e03131" }}>{errors.expenseNumber}</div>
      )}

      <TextInput
        label="Date"
        type="date"
        value={expenseDate}
        onChange={(e) => setExpenseDate(e.currentTarget.value)}
      />
      {errors.expenseDate && (
        <div style={{ color: "#e03131" }}>{errors.expenseDate}</div>
      )}

      <Select
        label="Category"
        data={categories.map((c) => ({ value: c, label: c }))}
        value={category}
        onChange={(v) => setCategory(v ?? categories[0])}
      />

      <TextInput
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.currentTarget.value)}
      />

      <NumberInput
        label="Amount"
        value={amount}
        onChange={(v) =>
          setAmount(
            typeof v === "number"
              ? v
              : v === "" || v == null
              ? undefined
              : Number(v)
          )
        }
        hideControls
      />
      {errors.amount && <div style={{ color: "#e03131" }}>{errors.amount}</div>}

      <Select
        label="Payment Method"
        data={["Cash", "Card", "UPI", "Cheque"].map((v) => ({
          value: v,
          label: v,
        }))}
        value={paymentMethod}
        onChange={(v) => setPaymentMethod(v as ExpenseType["paymentMethod"])}
      />

      <TextInput
        label="Reference"
        value={reference}
        onChange={(e) => setReference(e.currentTarget.value)}
      />
      <TextInput
        label="Remarks"
        value={remarks}
        onChange={(e) => setRemarks(e.currentTarget.value)}
      />

      <Group justify="flex-end" mt="md">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (!validate()) return;
            // Compose ExpensePayload for backend
            const payload: ExpensePayload = {
              expenseNumber,
              amount: Number(amount),
              date: expenseDate,
              categoryType: mapCategoryToPayload(category),
              description,
              reference,
              paymentMethod,
              remarks,
            };
            onSave(payload);
            onOpenChange(false);
          }}
        >
          Save Expense
        </Button>
      </Group>
    </Modal>
  );
}

function EditExpenseDialogMantine({
  expense,
  onClose,
  onSave,
}: {
  expense: ExpenseType;
  onClose: () => void;
  onSave: (patch: Partial<ExpenseType>) => void;
}) {
  const [payload, setPayload] = useState<Partial<ExpenseType>>(expense);
  return (
    <Modal opened={true} onClose={onClose} title="Edit Expense">
      <TextInput
        label="Expense No"
        value={String(payload.expenseNumber ?? "")}
        onChange={(e) =>
          setPayload((p: Partial<ExpenseType>) => ({
            ...p,
            expenseNumber: e.currentTarget.value,
          }))
        }
      />
      <TextInput
        label="Date"
        type="date"
        value={String(payload.date ?? "").slice(0, 10)}
        onChange={(e) =>
          setPayload((p: Partial<ExpenseType>) => ({
            ...p,
            date: e.currentTarget.value,
          }))
        }
      />
      <Select
        label="Category"
        data={categories.map((c) => ({ value: c, label: c }))}
        value={String(payload.categoryType ?? categories[0])}
        onChange={(v) =>
          setPayload((p) => ({ ...p, categoryType: v ?? undefined }))
        }
      />
      <TextInput
        label="Description"
        value={String(payload.description ?? "")}
        onChange={(e) =>
          setPayload((p: Partial<ExpenseType>) => ({
            ...p,
            description: e.currentTarget.value,
          }))
        }
      />
      <NumberInput
        label="Amount"
        value={Number(payload.amount ?? 0)}
        onChange={(v) =>
          setPayload((p: Partial<ExpenseType>) => ({ ...p, amount: Number(v) }))
        }
        hideControls
      />
      <Select
        label="Payment Method"
        data={["Cash", "Card", "UPI", "Cheque"].map((v) => ({
          value: v,
          label: v,
        }))}
        value={String(payload.paymentMethod ?? "Cash")}
        onChange={(v) =>
          setPayload((p: Partial<ExpenseType>) => ({
            ...p,
            paymentMethod: v as ExpenseType["paymentMethod"],
          }))
        }
      />
      <TextInput
        label="Reference"
        value={String(payload.reference ?? "")}
        onChange={(e) =>
          setPayload((p: Partial<ExpenseType>) => ({
            ...p,
            reference: e.currentTarget.value,
          }))
        }
      />
      <TextInput
        label="Remarks"
        value={String(payload.remarks ?? "")}
        onChange={(e) =>
          setPayload((p: Partial<ExpenseType>) => ({
            ...p,
            remarks: e.currentTarget.value,
          }))
        }
      />
      <Group justify="flex-end" mt="md">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => onSave(payload)}>Save</Button>
      </Group>
    </Modal>
  );
}
