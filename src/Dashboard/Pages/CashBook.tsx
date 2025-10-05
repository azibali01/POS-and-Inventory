import { useState } from "react";
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
  Select,
} from "@mantine/core";

// Simple cashbook entry type
export type CashBookEntry = {
  date: string;
  description: string;
  type: "debit" | "credit";
  amount: string;
  user: string;
};

export default function CashBook() {
  const [entries, setEntries] = useState<CashBookEntry[]>([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"debit" | "credit">("debit");
  const [amount, setAmount] = useState("");
  const [user, setUser] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  // Filter states
  const [filterUser, setFilterUser] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const handleAdd = () => {
    if (!date || !description || !amount || !user) {
      setShowNotif(true);
      setTimeout(() => setShowNotif(false), 2000);
      return;
    }
    setEntries([...entries, { date, description, type, amount, user }]);
    setDescription("");
    setAmount("");
    setUser("");
  };

  // Filtered entries
  const filteredEntries = entries.filter((e) => {
    const userMatch = filterUser
      ? e.user.toLowerCase().includes(filterUser.toLowerCase())
      : true;
    const typeMatch = filterType ? e.type === filterType : true;
    const dateFromMatch = filterDateFrom ? e.date >= filterDateFrom : true;
    const dateToMatch = filterDateTo ? e.date <= filterDateTo : true;
    return userMatch && typeMatch && dateFromMatch && dateToMatch;
  });
  const totalDebit = filteredEntries
    .filter((e) => e.type === "debit")
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const totalCredit = filteredEntries
    .filter((e) => e.type === "credit")
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const balance = totalDebit - totalCredit;

  return (
    <Card withBorder shadow="sm" radius="md" p="xl">
      <Title order={2} mb="md">
        Cash Book
      </Title>
      <Stack gap="md">
        <Group grow>
          <TextInput
            label="User"
            value={user}
            onChange={(e) => setUser(e.currentTarget.value)}
            required
          />
          <Select
            label="Type"
            value={type}
            onChange={(value) => setType(value as "debit" | "credit")}
            data={[
              { value: "debit", label: "Debit" },
              { value: "credit", label: "Credit" },
            ]}
            required
          />
          <TextInput
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(e.currentTarget.value)}
            type="number"
            min={0}
            required
          />
          <TextInput
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            required
          />
        </Group>
        <Button onClick={handleAdd} color="blue" variant="light">
          Add Entry
        </Button>
        <Divider />
        {/* Filters */}
        <Group grow mb="xs">
          <TextInput
            label="Filter by User"
            value={filterUser}
            onChange={(e) => setFilterUser(e.currentTarget.value)}
            placeholder="User name"
          />
          <Select
            label="Filter by Type"
            value={filterType}
            onChange={(value) =>
              setFilterType((value as "debit" | "credit") || "")
            }
            data={[
              { value: "", label: "All Types" },
              { value: "debit", label: "Debit (Cash In)" },
              { value: "credit", label: "Credit (Cash Out)" },
            ]}
            placeholder="All Types"
            clearable
          />
          <TextInput
            label="From Date"
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.currentTarget.value)}
          />
          <TextInput
            label="To Date"
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.currentTarget.value)}
          />
        </Group>
        <Table withColumnBorders highlightOnHover striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>User</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Debit</Table.Th>
              <Table.Th>Credit</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredEntries.map((entry, idx) => (
              <Table.Tr key={idx}>
                <Table.Td>{entry.user}</Table.Td>
                <Table.Td style={{ textTransform: "capitalize" }}>
                  {entry.type}
                </Table.Td>
                <Table.Td>{entry.amount}</Table.Td>
                <Table.Td>{entry.date}</Table.Td>
                <Table.Td>{entry.description}</Table.Td>
                <Table.Td>
                  {entry.type === "debit" ? entry.amount : ""}
                </Table.Td>
                <Table.Td>
                  {entry.type === "credit" ? entry.amount : ""}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        <Group justify="end" mt="md">
          <Title order={5} fw={700}>
            Total Debit: {totalDebit.toFixed(2)}
          </Title>
          <Title order={5} fw={700}>
            Total Credit: {totalCredit.toFixed(2)}
          </Title>
          <Title order={5} fw={700}>
            Balance: {balance.toFixed(2)}
          </Title>
        </Group>
        {showNotif && (
          <Notification color="red" onClose={() => setShowNotif(false)} mt="md">
            Please fill all fields correctly.
          </Notification>
        )}
      </Stack>
    </Card>
  );
}
