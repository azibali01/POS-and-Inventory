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
import { Plus } from "lucide-react";

const mockExpenses: ExpenseType[] = [
  {
    id: "1",
    expenseNumber: "EXP-2025-001",
    expenseDate: new Date().toISOString(),
    category: "Rent",
    description: "Office rent for May",
    amount: 1500,
    paymentMethod: "Cash",
    reference: "REF-001",
    remarks: "",
  },
  {
    id: "2",
    expenseNumber: "EXP-2025-002",
    expenseDate: new Date().toISOString(),
    category: "Utilities",
    description: "Electricity bill",
    amount: 230,
    paymentMethod: "Card",
    reference: "REF-002",
    remarks: "",
  },
];

import type {
  Expense as ExpenseType,
  ExpenseInput,
} from "../Context/DataContext";
import { useDataContext } from "../Context/DataContext";

function formatCurrency(value: number) {
  // format as currency using user's locale; change currency code if needed
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
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
  const [q, setQ] = useState("");
  const dataCtx = useDataContext();
  const { loadExpenses } = dataCtx;
  const expenses = useMemo(() => dataCtx.expenses ?? [], [dataCtx.expenses]);

  useEffect(() => {
    if (
      (!dataCtx.expenses || dataCtx.expenses.length === 0) &&
      typeof loadExpenses === "function"
    ) {
      loadExpenses().catch(() => {});
    }
  }, [loadExpenses]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseType | null>(null);

  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim();
    if (!t) return expenses.length ? expenses : mockExpenses;
    const source = expenses.length ? expenses : mockExpenses;
    return source.filter(
      (e) =>
        e.expenseNumber.toLowerCase().includes(t) ||
        e.category.toLowerCase().includes(t) ||
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

      <Table highlightOnHover striped verticalSpacing="sm">
        <thead>
          <tr>
            <th>Number</th>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th style={{ textAlign: "right" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((e: ExpenseType) => (
            <tr
              key={e.id}
              style={{ cursor: "pointer" }}
              onClick={() => setEditing(e)}
            >
              <td>{e.expenseNumber}</td>
              <td>{formatDate(e.expenseDate)}</td>
              <td>{e.category}</td>
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
              <td style={{ textAlign: "right" }}>{formatCurrency(e.amount)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <AddExpenseDialogMantine
        open={open}
        onOpenChange={setOpen}
        onSave={(payload: ExpenseInput) => {
          (dataCtx as { addExpense?: (p: ExpenseInput) => void }).addExpense?.(
            payload
          );
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
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (payload: ExpenseInput) => void;
}) {
  const [expenseNumber, setExpenseNumber] = useState("");
  const [expenseDate, setExpenseDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [category, setCategory] = useState<string>(categories[0]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] =
    useState<ExpenseType["paymentMethod"]>("Cash");
  const [reference, setReference] = useState("");
  const [remarks, setRemarks] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!expenseNumber.trim()) e.expenseNumber = "Expense number is required";
    if (!expenseDate) e.expenseDate = "Date is required";
    if (!(Number(amount) > 0)) e.amount = "Amount must be positive";
    setErrors(e);
    return Object.keys(e).length === 0;
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
            onSave({
              expenseNumber,
              expenseDate,
              category,
              description,
              amount: Number(amount),
              paymentMethod,
              reference,
              remarks,
            });
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
        value={String(payload.expenseDate ?? "").slice(0, 10)}
        onChange={(e) =>
          setPayload((p: Partial<ExpenseType>) => ({
            ...p,
            expenseDate: e.currentTarget.value,
          }))
        }
      />
      <Select
        label="Category"
        data={categories.map((c) => ({ value: c, label: c }))}
        value={String(payload.category ?? categories[0])}
        onChange={(v) =>
          setPayload((p) => ({ ...p, category: v ?? undefined }))
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
