import { useState, useEffect } from "react";
import { Modal, TextInput, Button, NumberInput, Select } from "@mantine/core";

type paymentType = "Credit" | "Debit";
export type Supplier = {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  openingBalance?: number;
  paymentType?: paymentType;
  currentBalance?: number;
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
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    openingBalance: 0,
    currentBalance: 0,

    ...initial,
  });
  const [openingType, setOpeningType] = useState<paymentType>(
    initial && initial.paymentType
      ? initial.paymentType
      : initial && (initial.openingBalance ?? 0) < 0
      ? "Debit"
      : "Credit"
  );

  useEffect(() => {
    setForm((f) => ({ ...f, ...initial }));
    setOpeningType(
      initial && initial.paymentType
        ? initial.paymentType
        : initial && (initial.openingBalance ?? 0) < 0
        ? "Debit"
        : "Credit"
    );
  }, [initial]);

  function close(v = false) {
    if (onOpenChange) onOpenChange(v);
    if (!v && onClose) onClose();
  }

  function handleSave() {
    const payload: Partial<Supplier> = {
      name: (form.name as string) || "",
      phone: (form.phone as string) || "",
      email: (form.email as string) || "",
      address: (form.address as string) || "",
      city: (form.city as string) || "",
      openingBalance: Number(form.openingBalance || 0),
      paymentType: openingType,
    };
    // Only include _id if editing (i.e. initial has _id)
    if (initial && initial._id) {
      payload._id = initial._id;
    }
    onSave?.(payload as Supplier);
    close(false);
  }

  return (
    <Modal
      opened={open}
      onClose={() => close(false)}
      title={initial?._id ? <strong>Edit Supplier</strong> : "Add Supplier"}
    >
      <div style={{ display: "grid", gap: 12 }}>
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
                  openingBalance: openingType === "Debit" ? -val : val,
                });
              }}
              hideControls
            />
            <Select
              label="Type"
              value={openingType}
              data={[
                { value: "Credit", label: "Credit" },
                { value: "Debit", label: "Debit" },
              ]}
              onChange={(v) => {
                const newType = (v ?? "Credit") as paymentType;
                setOpeningType(newType);
                const abs = Math.abs(Number(form.openingBalance ?? 0));
                setForm({
                  ...form,
                  openingBalance: newType === "Debit" ? -abs : abs,
                });
              }}
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
