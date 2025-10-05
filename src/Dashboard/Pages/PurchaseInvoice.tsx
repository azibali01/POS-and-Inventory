import { useState } from "react";
import { useDataContext } from "../Context/DataContext";
import {
  Title,
  Card,
  Group,
  TextInput,
  Button,
  Table,
  Notification,
  Divider,
  Stack,
} from "@mantine/core";

type Row = {
  item: string;
  qty: string;
  rate: string;
  amount: string;
};

type InventoryItem = {
  id: string | number;
  name: string;
  code: string;
  costPrice: number;
};

function calculateRow(row: Row): Row {
  const qty = parseFloat(row.qty) || 0;
  const rate = parseFloat(row.rate) || 0;
  const amount = qty * rate;
  return {
    ...row,
    amount: amount ? amount.toFixed(2) : "",
  };
}

export default function PurchaseInvoice() {
  const { inventory } = useDataContext();
  const [invoiceNo, setInvoiceNo] = useState(() => {
    const last = localStorage.getItem("lastPurchaseInvoiceNo");
    let next = 1;
    if (last && last.startsWith("PI-")) {
      next = parseInt(last.replace("PI-", "")) + 1;
    }
    return `PI-${next.toString().padStart(4, "0")}`;
  });
  const [supplierName, setSupplierName] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [rows, setRows] = useState<Row[]>([
    { item: "", qty: "", rate: "", amount: "" },
  ]);
  const [showNotif, setShowNotif] = useState(false);

  const totalAmount = rows.reduce(
    (sum, row) => sum + (parseFloat(row.amount) || 0),
    0
  );

  const handleAddRow = () => {
    setRows([...rows, { item: "", qty: "", rate: "", amount: "" }]);
  };
  const handleDeleteRow = (idx: number) => {
    setRows(rows.filter((_, i) => i !== idx));
  };
  const handleChange = (idx: number, field: keyof Row, value: string) => {
    const updated = [...rows];
    if (field === "item") {
      updated[idx][field] = value;
      // Auto-fill rate from inventory (cost price)
      const selected = inventory.find((item) => String(item.id) === value);
      if (selected) {
        updated[idx].rate = selected.costPrice.toString();
      }
    } else {
      updated[idx][field] = value;
    }
    updated[idx] = calculateRow(updated[idx]);
    setRows(updated);
  };
  const handleSave = () => {
    if (
      !supplierName ||
      !supplierPhone ||
      rows.length === 0 ||
      !rows.some((r) => r.item)
    ) {
      setShowNotif(true);
      setTimeout(() => setShowNotif(false), 2000);
      return;
    }
    // Increment invoice number for next entry
    const nextNo = parseInt(invoiceNo.replace("PI-", "")) + 1;
    const nextInvoice = `PI-${nextNo.toString().padStart(4, "0")}`;
    setInvoiceNo(nextInvoice);
    localStorage.setItem("lastPurchaseInvoiceNo", nextInvoice);
    setShowNotif(true);
    setTimeout(() => setShowNotif(false), 2000);
  };

  return (
    <Card withBorder shadow="sm" radius="md" p="xl">
      <Title order={2} mb="md">
        Purchase Invoice
      </Title>
      <Stack gap="md">
        <Group grow>
          <TextInput label="Invoice No." value={invoiceNo} readOnly />
          <TextInput
            label="Supplier Name"
            value={supplierName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSupplierName(e.currentTarget.value)
            }
            required
          />
          <TextInput
            label="Supplier Phone"
            value={supplierPhone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSupplierPhone(e.currentTarget.value.replace(/[^0-9]/g, ""))
            }
            required
            type="tel"
          />
          <TextInput
            label="Date"
            type="date"
            value={date}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDate(e.currentTarget.value)
            }
            required
          />
        </Group>
        <Divider />
        <Table withColumnBorders highlightOnHover striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Item</Table.Th>
              <Table.Th>Qty</Table.Th>
              <Table.Th>Rate</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row: Row, idx: number) => (
              <Table.Tr key={idx}>
                <Table.Td>
                  <select
                    value={row.item}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      handleChange(idx, "item", e.target.value)
                    }
                  >
                    <option value="">Select Item</option>
                    {inventory.map((inv: InventoryItem) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.name} ({inv.code})
                      </option>
                    ))}
                  </select>
                </Table.Td>
                <Table.Td>
                  <TextInput
                    value={row.qty}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange(idx, "qty", e.currentTarget.value)
                    }
                    placeholder="Qty"
                    size="xs"
                    type="number"
                    min={0}
                  />
                </Table.Td>
                <Table.Td>
                  <TextInput
                    value={row.rate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange(idx, "rate", e.currentTarget.value)
                    }
                    placeholder="Rate"
                    size="xs"
                    type="number"
                    min={0}
                  />
                </Table.Td>
                <Table.Td>
                  <TextInput
                    value={row.amount}
                    placeholder="Amount"
                    size="xs"
                    type="number"
                    min={0}
                    disabled
                  />
                </Table.Td>
                <Table.Td>
                  <Button
                    color="red"
                    size="xs"
                    variant="light"
                    onClick={() => handleDeleteRow(idx)}
                    disabled={rows.length === 1}
                  >
                    Delete
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        <Button onClick={handleAddRow} variant="light" color="blue" mt="xs">
          Add Item
        </Button>
        <Group justify="end" mt="md">
          <Title order={5} fw={700}>
            Total: {totalAmount.toFixed(2)}
          </Title>
        </Group>
        <Group gap="md" mt="md">
          <Button color="green" onClick={handleSave}>
            Save Invoice
          </Button>
          <Button color="blue" variant="outline">
            Print/Export
          </Button>
        </Group>
        {showNotif && (
          <Notification color="red" onClose={() => setShowNotif(false)} mt="md">
            Please fill all required fields and add at least one item.
          </Notification>
        )}
      </Stack>
    </Card>
  );
}
