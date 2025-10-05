import { useState } from "react";
import {
  Title,
  Card,
  Group,
  TextInput,
  Select,
  Button,
  Table,
  Notification,
  Divider,
  Stack,
} from "@mantine/core";

const invoiceTypes = [
  { value: "sales", label: "Sales Invoice" },
  { value: "purchase", label: "Purchase Invoice" },
  { value: "sales-return", label: "Sales Return" },
  { value: "purchase-return", label: "Purchase Return" },
];

type LedgerRow = {
  date: string;
  type: string;
  party: string;
  amount: number;
  balance: number;
};

const mockLedger: LedgerRow[] = [
  {
    date: "2025-09-01",
    type: "sales",
    party: "Ali Traders",
    amount: 12000,
    balance: 12000,
  },
  {
    date: "2025-09-02",
    type: "purchase",
    party: "Metro Metals",
    amount: -8000,
    balance: 4000,
  },
  {
    date: "2025-09-03",
    type: "sales-return",
    party: "Ali Traders",
    amount: -2000,
    balance: 2000,
  },
  {
    date: "2025-09-04",
    type: "purchase-return",
    party: "Metro Metals",
    amount: 1000,
    balance: 3000,
  },
];

export default function Ledger() {
  const [type, setType] = useState<string | null>(null);
  const [party, setParty] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showNotif, setShowNotif] = useState(false);

  // Filter logic
  const filtered = mockLedger.filter((row) => {
    if (type && row.type !== type) return false;
    if (party && !row.party.toLowerCase().includes(party.toLowerCase()))
      return false;
    if (fromDate && row.date < fromDate) return false;
    if (toDate && row.date > toDate) return false;
    return true;
  });

  const handleExport = () => {
    // TODO: Export logic
    setShowNotif(true);
    setTimeout(() => setShowNotif(false), 2000);
  };

  return (
    <Card withBorder shadow="sm" radius="md" p="xl">
      <Title order={2} mb="md">
        Ledger
      </Title>
      <Stack gap="md">
        <Group grow>
          <Select
            label="Invoice Type"
            data={invoiceTypes}
            value={type}
            onChange={setType}
            placeholder="All Types"
            clearable
          />
          <TextInput
            label="Party Name"
            value={party}
            onChange={(e) => setParty(e.currentTarget.value)}
            placeholder="Customer/Supplier"
          />
          <TextInput
            label="From Date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.currentTarget.value)}
          />
          <TextInput
            label="To Date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.currentTarget.value)}
          />
        </Group>
        <Divider />
        <Table withColumnBorders highlightOnHover striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Party</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Balance</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filtered.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5} style={{ textAlign: "center" }}>
                  No ledger entries found.
                </Table.Td>
              </Table.Tr>
            ) : (
              filtered.map((row, idx) => (
                <Table.Tr key={idx}>
                  <Table.Td>{row.date}</Table.Td>
                  <Table.Td>
                    {invoiceTypes.find((t) => t.value === row.type)?.label ||
                      row.type}
                  </Table.Td>
                  <Table.Td>{row.party}</Table.Td>
                  <Table.Td>{row.amount.toLocaleString()}</Table.Td>
                  <Table.Td>{row.balance.toLocaleString()}</Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
        <Group justify="end" mt="md">
          <Button color="blue" variant="outline" onClick={handleExport}>
            Export/Print
          </Button>
        </Group>
        {showNotif && (
          <Notification
            color="blue"
            onClose={() => setShowNotif(false)}
            mt="md"
          >
            Export/Print feature coming soon.
          </Notification>
        )}
      </Stack>
    </Card>
  );
}
