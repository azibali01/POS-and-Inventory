"use client";

import { useState } from "react";
import {
  Modal,
  TextInput,
  NumberInput,
  Select,
  Group,
  Button,
} from "@mantine/core";

interface ReceiptVoucher {
  id: string;
  voucherNumber: string;
  voucherDate: Date;
  receivedFrom: string;
  amount: number;
  paymentMode: "Cash" | "Card" | "UPI" | "Cheque";
  reference: string;
  remarks: string;
  createdAt: Date;
}

export function ReceiptForm({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (payload: ReceiptVoucher) => void;
}) {
  const [voucherNumber, setVoucherNumber] = useState("");
  const [voucherDate, setVoucherDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [receivedFrom, setReceivedFrom] = useState("");
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [paymentMode, setPaymentMode] =
    useState<ReceiptVoucher["paymentMode"]>("Cash");
  const [reference, setReference] = useState("");
  const [remarks, setRemarks] = useState("");

  function save() {
    onSave({
      id:
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `rv-${Date.now()}`,
      voucherNumber,
      voucherDate: new Date(voucherDate),
      receivedFrom,
      amount: Number(amount ?? 0),
      paymentMode,
      reference,
      remarks,
      createdAt: new Date(),
    });
    onOpenChange(false);
  }

  return (
    <Modal
      opened={open}
      onClose={() => onOpenChange(false)}
      title="Receipt Voucher"
    >
      <TextInput
        label="Voucher No"
        value={voucherNumber}
        onChange={(e) => setVoucherNumber(e.currentTarget.value)}
        placeholder="RV-2025-001"
      />
      <TextInput
        label="Date"
        type="date"
        value={voucherDate}
        onChange={(e) => setVoucherDate(e.currentTarget.value)}
      />

      <TextInput
        label="Received From"
        value={receivedFrom}
        onChange={(e) => setReceivedFrom(e.currentTarget.value)}
        placeholder="Customer Name"
      />

      <Group grow>
        <NumberInput
          label="Amount"
          value={amount}
          onChange={(v) => setAmount(typeof v === "number" ? v : undefined)}
        />
        <Select
          label="Payment Mode"
          data={["Cash", "Card", "UPI", "Cheque"].map((v) => ({
            value: v,
            label: v,
          }))}
          value={paymentMode}
          onChange={(v) => setPaymentMode(v as ReceiptVoucher["paymentMode"])}
        />
        <TextInput
          label="Reference"
          value={reference}
          onChange={(e) => setReference(e.currentTarget.value)}
          placeholder="INV-2025-001"
        />
      </Group>

      <TextInput
        label="Remarks"
        value={remarks}
        onChange={(e) => setRemarks(e.currentTarget.value)}
        placeholder="Optional notes"
      />

      <Group justify="flex-end" mt="md">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={save}>Save Receipt</Button>
      </Group>
    </Modal>
  );
}
