import { useEffect } from "react";
import {
  Modal,
  Button,
  Group,
  TextInput,
  NumberInput,
  Select,
  Textarea,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";

export interface JournalVoucherFormValues {
  voucherNumber: string;
  voucherDate: string | Date;
  particulars: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  remarks?: string;
}

interface JournalVoucherFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<JournalVoucherFormValues>;
  onSave: (values: JournalVoucherFormValues) => Promise<void>;
}

const accountOptions = [
  { value: "Cash", label: "Cash" },
  { value: "Bank", label: "Bank" },
  { value: "Sales", label: "Sales" },
  { value: "Purchases", label: "Purchases" },
  { value: "Expenses", label: "Expenses" },
  { value: "Other", label: "Other" },
];

export function JournalVoucherForm({
  open,
  onOpenChange,
  initialValues,
  onSave,
}: JournalVoucherFormProps) {
  const form = useForm<JournalVoucherFormValues>({
    initialValues: {
      voucherNumber: initialValues?.voucherNumber || "",
      voucherDate: initialValues?.voucherDate || new Date(),
      particulars: initialValues?.particulars || "",
      debitAccount: initialValues?.debitAccount || "",
      creditAccount: initialValues?.creditAccount || "",
      amount: initialValues?.amount || 0,
      remarks: initialValues?.remarks || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.setValues({
        voucherNumber: initialValues?.voucherNumber || "",
        voucherDate: initialValues?.voucherDate || new Date(),
        particulars: initialValues?.particulars || "",
        debitAccount: initialValues?.debitAccount || "",
        creditAccount: initialValues?.creditAccount || "",
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
      title="Journal Voucher"
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
        <DateInput
          label="Date"
          value={form.values.voucherDate}
          onChange={(date) =>
            form.setFieldValue("voucherDate", date || new Date())
          }
          required
        />
        <TextInput
          label="Particulars"
          placeholder="Description of transaction"
          {...form.getInputProps("particulars")}
          required
        />
        <Select
          label="Debit Account"
          data={accountOptions}
          {...form.getInputProps("debitAccount")}
          required
        />
        <Select
          label="Credit Account"
          data={accountOptions}
          {...form.getInputProps("creditAccount")}
          required
        />
        <NumberInput
          label="Amount"
          min={0}
          step={1}
          {...form.getInputProps("amount")}
          required
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
