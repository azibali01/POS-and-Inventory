import { useMemo, useState, useEffect } from "react";
import {
  Button,
  Modal,
  TextInput,
  Select,
  NumberInput,
  Group,
  LoadingOverlay,
} from "@mantine/core";
import Table from "../../lib/AppTable";
import { Plus, Trash2 } from "lucide-react";
import { useExpenses } from "../../lib/hooks/useExpenses";

import type { ExpensePayload } from "../../lib/api";

// Helper types derived from payload to match existing component expectations
export interface ExpenseType {
  id?: string;
  _id?: string;
  expenseNumber: string;
  amount: number;
  date?: string | Date;
  categoryType: string;
  description?: string;
  reference?: string;
  paymentMethod?: "Cash" | "Card";
  remarks?: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "PKR",
  }).format(value);
}

function formatDate(value?: string | Date) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
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
  const {
    expenses: rawExpenses,
    isLoading,
    createExpense,
    deleteExpense,
    updateExpense,
  } = useExpenses();

  // Cast raw expenses types if needed (or ensure hook returns compatible types)
  const expenses = (rawExpenses || []) as unknown as ExpenseType[];

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Find the next expense number in the format EXP-0001
  function getNextExpenseNumber() {
    const numbers = expenses
      .map((e) => {
        const match = String(e.expenseNumber || "").match(/EXP-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const max = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `EXP-${String(max + 1).padStart(4, "0")}`;
  }

  // Handle delete
  async function handleDelete(expenseNumber: string) {
    // We need the ID to delete, usually. But the old code used expenseNumber?
    // Let's find the ID first.
    const expense = expenses.find((e) => e.expenseNumber === expenseNumber);
    if (!expense) return;
    const id = expense._id || expense.id;
    if (!id) return;

    setDeletingId(expenseNumber);
    try {
      deleteExpense(id, {
        onSettled: () => { setDeletingId(null); },
      });
    } catch (err) {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim();
    if (!t) return expenses;
    return expenses.filter(
      (e) =>
        (e.expenseNumber || "").toLowerCase().includes(t) ||
        (e.categoryType || "").toLowerCase().includes(t) ||
        (e.description || "").toLowerCase().includes(t)
    );
  }, [q, expenses]);

  if (isLoading) {
    return <LoadingOverlay visible={true} />;
  }

  return (
    <div>
      <Group justify="space-between" mb="md">
        <TextInput
          placeholder="Search expenses..."
          value={q}
          onChange={(e) => { setQ((e.target as HTMLInputElement)?.value ?? ""); }}
          style={{ flex: 1, maxWidth: 420 }}
        />
        <Button leftSection={<Plus />} onClick={() => { setOpen(true); }}>
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
          {filtered.map((e, idx) => (
            <tr
              key={e.id || e.expenseNumber || `exp-${idx}`}
              style={{ cursor: "pointer" }}
              onClick={(event) => {
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
          createExpense({
            ...payload,
            date: payload.date || new Date().toISOString(),
            // ensure required fields for API
            expenseNumber: payload.expenseNumber || "",
            amount: payload.amount,
            categoryType: payload.categoryType || "Other",
            description: payload.description || "",
            paymentMethod: payload.paymentMethod || "Cash",
            reference: payload.reference || "",
            remarks: payload.remarks || "",
          });
          setOpen(false);
        }}
      />
      {editing && (
        <EditExpenseDialogMantine
          expense={editing}
          onClose={() => { setEditing(null); }}
          onSave={(patch) => {
            const id = editing.id || editing._id;
            if (id) {
              updateExpense({
                id,
                payload: patch as unknown as Partial<ExpensePayload>,
              });
            }
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
      onClose={() => { onOpenChange(false); }}
      title="Add Expense"
    >
      <TextInput
        label="Expense No"
        value={expenseNumber}
        onChange={(e) =>
          { setExpenseNumber((e.target as HTMLInputElement)?.value ?? ""); }
        }
        placeholder="EXP-2025-001"
      />
      {errors.expenseNumber && (
        <div style={{ color: "#e03131" }}>{errors.expenseNumber}</div>
      )}

      <TextInput
        label="Date"
        type="date"
        value={expenseDate}
        onChange={(e) =>
          { setExpenseDate((e.target as HTMLInputElement)?.value ?? ""); }
        }
      />
      {errors.expenseDate && (
        <div style={{ color: "#e03131" }}>{errors.expenseDate}</div>
      )}

      <Select
        label="Category"
        data={categories.map((c) => ({ value: c, label: c }))}
        value={category}
        onChange={(v) => { setCategory(v ?? categories[0]); }}
      />

      <TextInput
        label="Description"
        value={description}
        onChange={(e) =>
          { setDescription((e.target as HTMLInputElement)?.value ?? ""); }
        }
      />

      <NumberInput
        label="Amount"
        value={amount}
        onChange={(v) =>
          { setAmount(
            typeof v === "number"
              ? v
              : v === "" || v == null
              ? undefined
              : Number(v)
          ); }
        }
        hideControls
      />
      {errors.amount && <div style={{ color: "#e03131" }}>{errors.amount}</div>}

      <Select
        label="Payment Method"
        data={["Cash", "Card"].map((v) => ({ value: v, label: v }))}
        value={paymentMethod}
        onChange={(v) => { setPaymentMethod(v as ExpenseType["paymentMethod"]); }}
      />

      <TextInput
        label="Reference"
        value={reference}
        onChange={(e) =>
          { setReference((e.target as HTMLInputElement)?.value ?? ""); }
        }
      />
      <TextInput
        label="Remarks"
        value={remarks}
        onChange={(e) =>
          { setRemarks((e.target as HTMLInputElement)?.value ?? ""); }
        }
      />

      <Group justify="flex-end" mt="md">
        <Button variant="outline" onClick={() => { onOpenChange(false); }}>
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
          { setPayload((p: Partial<ExpenseType>) => ({
            ...p,
            expenseNumber: (e.target as HTMLInputElement)?.value ?? "",
          })); }
        }
      />
      <TextInput
        label="Date"
        type="date"
        value={String(payload.date ?? "").slice(0, 10)}
        onChange={(e) =>
          { setPayload((p: Partial<ExpenseType>) => ({
            ...p,
            date: (e.target as HTMLInputElement)?.value ?? "",
          })); }
        }
      />
      <Select
        label="Category"
        data={categories.map((c) => ({ value: c, label: c }))}
        value={String(payload.categoryType ?? categories[0])}
        onChange={(v) =>
          { setPayload((p) => ({ ...p, categoryType: v ?? undefined })); }
        }
      />
      <TextInput
        label="Description"
        value={String(payload.description ?? "")}
        onChange={(e) =>
          { setPayload((p: Partial<ExpenseType>) => ({
            ...p,
            description: (e.target as HTMLInputElement)?.value ?? "",
          })); }
        }
      />
      <NumberInput
        label="Amount"
        value={Number(payload.amount ?? 0)}
        onChange={(v) =>
          { setPayload((p: Partial<ExpenseType>) => ({ ...p, amount: Number(v) })); }
        }
        hideControls
      />
      <Select
        label="Payment Method"
        data={["Cash", "Card"].map((v) => ({ value: v, label: v }))}
        value={String(payload.paymentMethod ?? "Cash")}
        onChange={(v) =>
          { setPayload((p: Partial<ExpenseType>) => ({
            ...p,
            paymentMethod: v as ExpenseType["paymentMethod"],
          })); }
        }
      />
      <TextInput
        label="Reference"
        value={String(payload.reference ?? "")}
        onChange={(e) =>
          { setPayload((p: Partial<ExpenseType>) => ({
            ...p,
            reference: (e.target as HTMLInputElement)?.value ?? "",
          })); }
        }
      />
      <TextInput
        label="Remarks"
        value={String(payload.remarks ?? "")}
        onChange={(e) =>
          { setPayload((p: Partial<ExpenseType>) => ({
            ...p,
            remarks: (e.target as HTMLInputElement)?.value ?? "",
          })); }
        }
      />
      <Group justify="flex-end" mt="md">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => { onSave(payload); }}>Save</Button>
      </Group>
    </Modal>
  );
}
