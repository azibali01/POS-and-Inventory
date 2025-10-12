import { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  Button,
  NumberInput,
  Switch,
  Select,
} from "@mantine/core";

export type Supplier = {
  id: string;
  supplierCode: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  gstNumber?: string;
  openingBalance?: number;
  currentBalance?: number;
  isActive?: boolean;
  createdAt?: string | Date;
};

export default function SupplierForm({
  // keep both prop styles supported for compatibility
  open,
  onOpenChange,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  onOpenChange?: (v: boolean) => void;
  initial?: Partial<Supplier> | undefined;
  onClose?: () => void;
  onSave?: (s: Supplier) => void;
}) {
  const [form, setForm] = useState<Partial<Supplier>>({
    supplierCode: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    gstNumber: "",
    openingBalance: 0,
    currentBalance: 0,
    isActive: true,
    ...initial,
  });
  const [openingType, setOpeningType] = useState<"credit" | "debit">(
    initial && (initial.openingBalance ?? 0) < 0 ? "debit" : "credit"
  );

  useEffect(() => {
    setForm((f) => ({ ...f, ...initial }));
    setOpeningType(
      initial && (initial.openingBalance ?? 0) < 0 ? "debit" : "credit"
    );
  }, [initial]);

  function close(v = false) {
    if (onOpenChange) onOpenChange(v);
    if (!v && onClose) onClose();
  }

  function handleSave() {
    const payload: Supplier = {
      id: (form.id as string) || `s-${Date.now()}`,
      supplierCode: (form.supplierCode as string) || "",
      name: (form.name as string) || "",
      phone: (form.phone as string) || "",
      email: (form.email as string) || "",
      address: (form.address as string) || "",
      city: (form.city as string) || "",
      gstNumber: (form.gstNumber as string) || "",
      openingBalance: Number(form.openingBalance || 0),
      currentBalance: Number(form.currentBalance || 0),
      isActive: Boolean(form.isActive ?? true),
      createdAt: form.createdAt
        ? String(form.createdAt)
        : new Date().toISOString(),
    };
    onSave?.(payload);
    close(false);
  }

  return (
    <Modal
      opened={open}
      onClose={() => close(false)}
      title={initial?.id ? "Edit Supplier" : "Add Supplier"}
    >
      <div style={{ display: "grid", gap: 12 }}>
        <TextInput
          label="Supplier Code"
          value={String(form.supplierCode ?? "")}
          onChange={(e) =>
            setForm({ ...form, supplierCode: e.currentTarget.value })
          }
        />
        <TextInput
          label="Name"
          value={String(form.name ?? "")}
          onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
        />

        <div
          style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}
        >
          <TextInput
            label="Phone"
            value={String(form.phone ?? "")}
            onChange={(e) => setForm({ ...form, phone: e.currentTarget.value })}
          />
          <TextInput
            label="Email"
            value={String(form.email ?? "")}
            onChange={(e) => setForm({ ...form, email: e.currentTarget.value })}
          />
        </div>

        <TextInput
          label="Address"
          value={String(form.address ?? "")}
          onChange={(e) => setForm({ ...form, address: e.currentTarget.value })}
        />

        <div
          style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}
        >
          <TextInput
            label="City"
            value={String(form.city ?? "")}
            onChange={(e) => setForm({ ...form, city: e.currentTarget.value })}
          />
          <TextInput
            label="GST Number"
            value={String(form.gstNumber ?? "")}
            onChange={(e) =>
              setForm({ ...form, gstNumber: e.currentTarget.value })
            }
          />
        </div>

        <div
          style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr auto" }}
        >
          <div style={{ display: "grid", gap: 8 }}>
            <NumberInput
              label="Opening Balance"
              value={Math.abs(Number(form.openingBalance ?? 0))}
              onChange={(v) => {
                const val = Number(v || 0);
                setForm({
                  ...form,
                  openingBalance: openingType === "debit" ? -val : val,
                });
              }}
            />
            <Select
              label="Type"
              value={openingType}
              data={[
                { value: "credit", label: "Credit" },
                { value: "debit", label: "Debit" },
              ]}
              onChange={(v) => {
                const newType = (v ?? "credit") as "credit" | "debit";
                setOpeningType(newType);
                const abs = Math.abs(Number(form.openingBalance ?? 0));
                setForm({
                  ...form,
                  openingBalance: newType === "debit" ? -abs : abs,
                });
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 12, color: "#666" }}>Active</div>
            <Switch
              checked={Boolean(form.isActive)}
              onChange={(e) =>
                setForm({ ...form, isActive: e.currentTarget.checked })
              }
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="outline" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Supplier</Button>
        </div>
      </div>
    </Modal>
  );
}
