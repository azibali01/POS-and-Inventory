import React, { useState } from "react";
import {
  Button,
  Group,
  TextInput,
  Textarea,
  NumberInput,
  Switch,
  Select,
} from "@mantine/core";
import { useDataContext } from "../../Dashboard/Context/DataContext";
import type { Customer } from "../../Dashboard/Context/DataContext";

export function CustomerForm({
  customer,
  onClose,
}: {
  customer?: Customer;
  onClose: () => void;
}) {
  const { setCustomers } = useDataContext();

  const [form, setForm] = useState<Customer>(() => ({
    id: customer?.id || Date.now(),
    customerCode: customer?.customerCode || `CUST-${Date.now()}`,
    name: customer?.name || "",
    phone: customer?.phone || "",
    email: customer?.email || "",
    address: customer?.address || "",
    city: customer?.city || "",
    gstNumber: customer?.gstNumber || "",
    openingBalance: customer?.openingBalance ?? 0,
    creditLimit: customer?.creditLimit ?? 0,
    currentBalance: customer?.currentBalance ?? customer?.openingBalance ?? 0,
    isActive: customer?.isActive ?? true,
    createdAt: customer?.createdAt || new Date().toISOString(),
  }));

  // Local UI state: keep opening amount positive and a type (credit/debit)
  const initialOpening = customer?.openingBalance ?? 0;
  const [openingAmount, setOpeningAmount] = useState<number>(
    Math.abs(initialOpening)
  );
  const [balanceType, setBalanceType] = useState<"credit" | "debit">(
    initialOpening < 0 ? "debit" : "credit"
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // compute signed balance according to type
    const signed =
      balanceType === "debit"
        ? -Math.abs(openingAmount)
        : Math.abs(openingAmount);
    const toSave = {
      ...form,
      openingBalance: signed,
      currentBalance: signed,
    } as Customer;
    if (customer) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === toSave.id ? toSave : c))
      );
    } else {
      setCustomers((prev) => [toSave, ...prev]);
    }
    onClose();
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
      <Group grow>
        <TextInput
          label="Customer Code"
          value={form.customerCode}
          onChange={(e) =>
            setForm({ ...form, customerCode: e.currentTarget.value })
          }
          placeholder="Auto/Manual"
        />
        <TextInput
          label="Name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
          placeholder="Customer name"
        />
      </Group>

      <Group grow>
        <TextInput
          label="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.currentTarget.value })}
          placeholder="+91 ..."
        />
        <TextInput
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.currentTarget.value })}
          placeholder="email@company.com"
        />
      </Group>

      <Textarea
        label="Address"
        minRows={2}
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.currentTarget.value })}
      />

      <Group grow>
        <TextInput
          label="City"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.currentTarget.value })}
        />
        <TextInput
          label="GST Number"
          value={form.gstNumber}
          onChange={(e) =>
            setForm({ ...form, gstNumber: e.currentTarget.value })
          }
          placeholder="27ABCDE1234F1Z5"
        />
      </Group>

      <Group grow>
        <NumberInput
          label="Opening Amount"
          value={openingAmount}
          min={0}
          onChange={(value: string | number) => {
            const num =
              typeof value === "number"
                ? value
                : Number(String(value).replace(/[^0-9.]/g, ""));
            setOpeningAmount(Number.isFinite(num) ? num : 0);
          }}
        />
        <Select
          label="Type"
          value={balanceType}
          data={[
            { value: "credit", label: "Credit" },
            { value: "debit", label: "Debit" },
          ]}
          onChange={(v) =>
            setBalanceType((v as "credit" | "debit") || "credit")
          }
          style={{ width: 150 }}
        />
        <NumberInput
          label="Credit Limit"
          value={form.creditLimit}
          onChange={(value: number | string) =>
            setForm({ ...form, creditLimit: Number(value) || 0 })
          }
        />
      </Group>

      <Group style={{ alignItems: "center" }}>
        <Switch
          checked={!!form.isActive}
          onChange={(e) =>
            setForm({ ...form, isActive: e.currentTarget.checked })
          }
        />
        <div>Active</div>
      </Group>

      <Group style={{ justifyContent: "flex-end" }}>
        <Button variant="outline" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button type="submit">{customer ? "Update" : "Save"}</Button>
      </Group>
    </form>
  );
}
