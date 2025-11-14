import { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Group,
  TextInput,
  NumberInput,
  Autocomplete,
  Textarea,
} from "@mantine/core";
import { getSuppliers } from "../../lib/api";

import { useForm } from "@mantine/form";

interface PaymentVoucherFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<PaymentVoucherFormValues>;
  onSave: (values: PaymentVoucherFormValues) => Promise<void>;
}

export interface PaymentVoucherFormValues {
  voucherNumber: string;
  voucherDate: string | Date;
  paidTo: string;
  paymentMode: string;
  reference?: string;
  amount: number;
  remarks?: string;
}

const paymentModes = [
  { value: "Cash", label: "Cash" },
  { value: "Bank/Online", label: "Bank/Online" },
  { value: "Other", label: "Other" },
];

export function PaymentVoucherForm({
  open,
  onOpenChange,
  initialValues,
  onSave,
}: PaymentVoucherFormProps) {
  const [suppliers, setSuppliers] = useState<
    { value: string; label: string }[]
  >([]);
  const form = useForm<PaymentVoucherFormValues>({
    initialValues: {
      voucherNumber: initialValues?.voucherNumber || "",
      voucherDate: initialValues?.voucherDate || new Date(),
      paidTo: initialValues?.paidTo || "",
      paymentMode: initialValues?.paymentMode || "Cash",
      reference: initialValues?.reference || "",
      amount: initialValues?.amount || 0,
      remarks: initialValues?.remarks || "",
    },
  });

  // Fetch suppliers when modal opens
  useEffect(() => {
    if (open) {
      getSuppliers().then((data: { name: string }[]) => {
        if (Array.isArray(data)) {
          setSuppliers(
            data.map((s: { name: string }) => ({
              value: s.name,
              label: s.name,
            }))
          );
        }
      });
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      form.setValues({
        voucherNumber: initialValues?.voucherNumber || "",
        voucherDate: initialValues?.voucherDate || new Date(),
        paidTo: initialValues?.paidTo || "",
        paymentMode: initialValues?.paymentMode || "Cash",
        reference: initialValues?.reference || "",
        amount: initialValues?.amount || 0,
        remarks: initialValues?.remarks || "",
      });
    }
    // eslint-disable-next-line
  }, [open, initialValues]);

  return (
    <Modal
      opened={open}
      onClose={() => onOpenChange(false)}
      title="Payment Voucher"
      centered
    >
      <form
        onSubmit={form.onSubmit(async (values) => {
          await onSave(values);
          onOpenChange(false);
        })}
      >
        <TextInput
          label="Voucher Number"
          {...form.getInputProps("voucherNumber")}
          readOnly
          required
        />
        <TextInput
          type="date"
          label="Date"
          value={
            typeof form.values.voucherDate === "string"
              ? form.values.voucherDate
              : form.values.voucherDate.toISOString().slice(0, 10)
          }
          onChange={(event) =>
            form.setFieldValue("voucherDate", event.currentTarget.value)
          }
          required
        />
        <Autocomplete
          label="Paid To"
          placeholder="Supplier or person name"
          data={suppliers.map((s) => s.value)}
          {...form.getInputProps("paidTo")}
          required
          clearable
        />
        <Autocomplete
          label="Payment Mode"
          data={paymentModes.map((m) => m.value)}
          {...form.getInputProps("paymentMode")}
          required
          clearable
        />
        <TextInput
          label="Reference"
          placeholder="Reference number (optional)"
          {...form.getInputProps("reference")}
        />
        <NumberInput
          label="Amount"
          min={0}
          step={1}
          {...form.getInputProps("amount")}
          required
          hideControls
        />
        <Textarea
          label="Remarks"
          placeholder="Remarks (optional)"
          {...form.getInputProps("remarks")}
        />
        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </Group>
      </form>
    </Modal>
  );
}
