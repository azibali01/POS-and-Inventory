import { useState, useMemo } from "react";
import {
  Button,
  Table,
  TextInput,
  Group,
  Stack,
  Notification,
  Paper,
  Title,
  Divider,
  Card,
} from "@mantine/core";
import {
  IconTrash,
  IconCheck,
  IconPlus,
  IconPrinter,
  IconDeviceFloppy,
  IconCopy,
} from "@tabler/icons-react";
import { POSPrint } from "./POSPrint";
import { GatePassPrint } from "./GatePassPrint";
import React from "react";

const columns = [
  "Sr.#",
  "Section",
  "Color",
  "Thick",
  "Size ft",
  "No. of Lengths",
  "Total Feet",
  "Rate",
  "Gross Amount",
  "Discount",
  "Amount",
  "Action",
];

type Row = {
  section: string;
  color: string;
  thick: string;
  size: string;
  lengths: string;
  totalFeet: string;
  rate: string;
  grossAmount: string;
  discount: string;
  amount: string;
};

function calculateRow(row: Row): Row {
  // Auto-calculate grossAmount, amount
  const totalFeet = parseFloat(row.totalFeet) || 0;
  const rate = parseFloat(row.rate) || 0;
  const grossAmount = totalFeet * rate;
  const discount = parseFloat(row.discount) || 0;
  const amount = grossAmount - discount;
  return {
    ...row,
    grossAmount: grossAmount ? grossAmount.toFixed(2) : "",
    amount: amount ? amount.toFixed(2) : "",
  };
}

export default function POS() {
  const [rows, setRows] = useState<Row[]>([
    {
      section: "",
      color: "",
      thick: "",
      size: "",
      lengths: "",
      totalFeet: "",
      rate: "",
      grossAmount: "",
      discount: "",
      amount: "",
    },
  ]);
  const [showNotification, setShowNotification] = useState(false);

  // Invoice fields
  const [invoiceNo, setInvoiceNo] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [gpNo, setGpNo] = useState("");
  const [ms, setMs] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [receivedAmount, setReceivedAmount] = useState("");

  // Auto-generate invoice number on mount, but only increment on save
  React.useEffect(() => {
    const lastInvoice = localStorage.getItem("lastInvoiceNo");
    let nextNumber = 1;
    if (lastInvoice && lastInvoice.startsWith("INV-")) {
      nextNumber = parseInt(lastInvoice.replace("INV-", ""));
    }
    const nextInvoice = `INV-${nextNumber.toString().padStart(3, "0")}`;
    setInvoiceNo(nextInvoice);
  }, []);

  // Print dialog state
  const [printMode, setPrintMode] = useState(false);
  const [gatePassPrintMode, setGatePassPrintMode] = useState(false);

  // Calculate total amount
  const totalAmount = useMemo(
    () =>
      rows.reduce((sum, row) => {
        const amt = parseFloat(row.amount) || 0;
        return sum + amt;
      }, 0),
    [rows]
  );

  const changeAmount = useMemo(() => {
    const received = parseFloat(receivedAmount) || 0;
    return received > totalAmount
      ? (received - totalAmount).toFixed(2)
      : "0.00";
  }, [receivedAmount, totalAmount]);

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        section: "",
        color: "",
        thick: "",
        size: "",
        lengths: "",
        totalFeet: "",
        rate: "",
        grossAmount: "",
        discount: "",
        amount: "",
      },
    ]);
  };

  const handleDeleteRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleDuplicateRow = (index: number) => {
    setRows([
      ...rows.slice(0, index + 1),
      { ...rows[index] },
      ...rows.slice(index + 1),
    ]);
  };

  const handleChange = (index: number, field: keyof Row, value: string) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    updatedRows[index] = calculateRow(updatedRows[index]);
    setRows(updatedRows);
  };

  const handleSaveInvoice = () => {
    // Validation: at least one filled row
    if (!rows.some((row) => row.section || row.amount)) {
      setShowNotification(false);
      alert("Please add at least one item to the invoice.");
      return;
    }
    // Increment invoice number and save to localStorage
    const lastInvoice = localStorage.getItem("lastInvoiceNo");
    let nextNumber = 1;
    if (lastInvoice && lastInvoice.startsWith("INV-")) {
      nextNumber = parseInt(lastInvoice.replace("INV-", "")) + 1;
    }
    const nextInvoice = `INV-${nextNumber.toString().padStart(3, "0")}`;
    setInvoiceNo(nextInvoice);
    localStorage.setItem("lastInvoiceNo", nextInvoice);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2500);
  };

  const handlePrintInvoice = () => {
    document.body.classList.add("print-active");
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
      document.body.classList.remove("print-active");
    }, 100);
  };

  const handlePrintGatePass = () => {
    document.body.classList.add("print-active");
    setGatePassPrintMode(true);
    setTimeout(() => {
      window.print();
      setGatePassPrintMode(false);
      document.body.classList.remove("print-active");
    }, 100);
  };

  // Only show header/footer in print mode
  if (printMode) {
    return (
      <div className="print-area">
        <POSPrint
          invoiceNo={invoiceNo}
          customerName={customerName}
          customerPhone={customerPhone}
          gpNo={gpNo}
          ms={ms}
          date={date}
          rows={rows}
          totalAmount={totalAmount}
          receivedAmount={receivedAmount}
        />
      </div>
    );
  }
  if (gatePassPrintMode) {
    return (
      <div className="print-area">
        <GatePassPrint
          invoiceNo={invoiceNo}
          customerName={customerName}
          customerPhone={customerPhone}
          gpNo={gpNo}
          ms={ms}
          date={date}
          rows={rows.map((row) => ({
            section: row.section,
            color: row.color,
            thick: row.thick,
            size: row.size,
            lengths: row.lengths,
            totalFeet: row.totalFeet,
          }))}
        />
      </div>
    );
  }

  // POS Display Page (no header/footer)
  return (
    <Paper shadow="md" p="xl" radius="lg" withBorder>
      <Stack gap="md">
        <Card
          withBorder
          radius="md"
          mb="md"
          shadow="xs"
          style={{ background: "#f8faff" }}
        >
          <Group grow>
            <TextInput
              label="Invoice No"
              value={invoiceNo}
              readOnly
              size="sm"
            />
            <TextInput
              label="Customer Name"
              placeholder="Enter Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.currentTarget.value)}
              size="sm"
            />
            <TextInput
              label="Customer Phone No."
              placeholder="Enter Customer Phone No."
              value={customerPhone}
              onChange={(e) =>
                setCustomerPhone(e.currentTarget.value.replace(/[^0-9]/g, ""))
              }
              size="sm"
              type="tel"
            />
            <TextInput
              label="G.P No"
              placeholder="Enter G.P No"
              value={gpNo}
              onChange={(e) => setGpNo(e.currentTarget.value)}
              size="sm"
            />
            <TextInput
              label="M/S"
              placeholder="Enter M/S"
              value={ms}
              onChange={(e) => setMs(e.currentTarget.value)}
              size="sm"
            />
            <TextInput
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.currentTarget.value)}
              size="sm"
            />
          </Group>
        </Card>

        <Group justify="space-between" mb={0}>
          <Title order={3} fw={700} c="blue">
            Invoice Items
          </Title>
          <Group gap="xs">
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleAddRow}
              variant="light"
            >
              Add Item
            </Button>
            <Button
              leftSection={<IconPrinter size={16} />}
              color="blue"
              variant="filled"
              onClick={handlePrintInvoice}
            >
              Print Invoice
            </Button>
            <Button
              color="orange"
              variant="filled"
              style={{ fontWeight: 600 }}
              onClick={handlePrintGatePass}
            >
              Gate Pass
            </Button>
            <Button
              leftSection={<IconDeviceFloppy size={16} />}
              color="green"
              variant="filled"
              onClick={handleSaveInvoice}
            >
              Save Invoice
            </Button>
          </Group>
        </Group>
        <Divider />

        <Table withColumnBorders highlightOnHover striped>
          <Table.Thead>
            <Table.Tr>
              {columns.map((col) => (
                <Table.Th key={col}>{col}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row, idx) => (
              <Table.Tr key={idx}>
                <Table.Td>{idx + 1}</Table.Td>
                <Table.Td style={{ minWidth: 180 }}>
                  <TextInput
                    value={row.section}
                    onChange={(e) =>
                      handleChange(idx, "section", e.currentTarget.value)
                    }
                    placeholder="Section"
                    size="xs"
                    style={{ width: 230 }}
                  />
                </Table.Td>
                <Table.Td>
                  <TextInput
                    value={row.color}
                    onChange={(e) =>
                      handleChange(idx, "color", e.currentTarget.value)
                    }
                    placeholder="Color"
                    size="xs"
                  />
                </Table.Td>
                <Table.Td>
                  <TextInput
                    value={row.thick}
                    onChange={(e) =>
                      handleChange(idx, "thick", e.currentTarget.value)
                    }
                    placeholder="Thick"
                    size="xs"
                  />
                </Table.Td>
                <Table.Td>
                  <TextInput
                    value={row.size}
                    onChange={(e) =>
                      handleChange(idx, "size", e.currentTarget.value)
                    }
                    placeholder="Size ft"
                    size="xs"
                  />
                </Table.Td>
                <Table.Td>
                  <TextInput
                    value={row.lengths}
                    onChange={(e) =>
                      handleChange(idx, "lengths", e.currentTarget.value)
                    }
                    placeholder="No. of Lengths"
                    size="xs"
                    type="number"
                    min={0}
                  />
                </Table.Td>
                <Table.Td>
                  <TextInput
                    value={row.totalFeet}
                    onChange={(e) =>
                      handleChange(idx, "totalFeet", e.currentTarget.value)
                    }
                    placeholder="Total Feet"
                    size="xs"
                    type="number"
                    min={0}
                  />
                </Table.Td>
                <Table.Td>
                  <TextInput
                    value={row.rate}
                    onChange={(e) =>
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
                    value={row.grossAmount}
                    onChange={(e) =>
                      handleChange(idx, "grossAmount", e.currentTarget.value)
                    }
                    placeholder="Gross Amount"
                    size="xs"
                    type="number"
                    min={0}
                    disabled
                  />
                </Table.Td>
                <Table.Td>
                  <TextInput
                    value={row.discount}
                    onChange={(e) =>
                      handleChange(
                        idx,
                        "discount",
                        e.currentTarget.value.replace(/[^0-9.]/g, "")
                      )
                    }
                    placeholder="Discount"
                    size="xs"
                    type="number"
                    min={0}
                  />
                </Table.Td>
                <Table.Td>
                  <TextInput
                    value={row.amount}
                    onChange={(e) =>
                      handleChange(idx, "amount", e.currentTarget.value)
                    }
                    placeholder="Amount"
                    size="xs"
                    type="number"
                    min={0}
                    disabled
                  />
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Button
                      color="red"
                      size="xs"
                      variant="light"
                      onClick={() => handleDeleteRow(idx)}
                      disabled={rows.length === 1}
                    >
                      <IconTrash size={16} />
                    </Button>
                    <Button
                      color="gray"
                      size="xs"
                      variant="light"
                      onClick={() => handleDuplicateRow(idx)}
                    >
                      <IconCopy size={16} />
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {/* Totals and Received Amount below table */}
        <Group mt="md" align="center" justify="end" gap="xl">
          <Group align="center">
            <Title order={5} fw={700} mb={0}>
              Total Amount:
            </Title>
            <Title order={5} fw={700} mb={0} c="blue">
              {totalAmount.toFixed(2)}
            </Title>
          </Group>
          <Group align="center">
            <Title order={5} fw={700} mb={0}>
              Received Amount:
            </Title>
            <TextInput
              placeholder="Enter Received Amount"
              value={receivedAmount}
              onChange={(e) =>
                setReceivedAmount(e.currentTarget.value.replace(/[^0-9.]/g, ""))
              }
              style={{ maxWidth: 200 }}
              size="md"
              type="number"
              min={0}
            />
          </Group>
          <Group align="center">
            <Title order={5} fw={700} mb={0}>
              Change:
            </Title>
            <Title
              order={5}
              fw={700}
              mb={0}
              c={parseFloat(receivedAmount) >= totalAmount ? "green" : "red"}
            >
              {changeAmount}
            </Title>
          </Group>
        </Group>
      </Stack>
      {showNotification && (
        <Notification
          icon={<IconCheck size={18} />}
          color="green"
          title="Invoice Saved"
          withCloseButton={false}
          mt="md"
        >
          Your invoice has been saved successfully!
        </Notification>
      )}
    </Paper>
  );
}
