import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Group,
  Input,
  Modal,
  ScrollArea,
  Table,
  Text,
  Title,
  Badge,
} from "@mantine/core";
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconEye,
  IconTrash,
} from "@tabler/icons-react";
import { CustomerForm } from "../../../components/sales/CustomerForm";
import { CustomerDetails } from "../../../components/sales/CustomerDetails";
import { useDataContext } from "../../Context/DataContext";
import type { Customer } from "../../Context/DataContext";
// local helpers
function formatCurrency(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 0 });
}

// Local Customer interface is provided by DataContext; the page reads data from context

export default function CustomersPage() {
  // Read customers from DataContext
  const { customers, setCustomers } = useDataContext();

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter((c) =>
      [c.name, c.customerCode, c.city, c.phone, c.email, c.gstNumber].some(
        (v) => (v || "").toLowerCase().includes(q)
      )
    );
  }, [customers, search]);

  return (
    <div>
      <Box mb="md">
        <Group justify="space-between">
          <div>
            <Title order={2}>Customers</Title>
            <Text c="dimmed">Manage customer directory and balances</Text>
          </div>
          <div>
            <Button onClick={() => setOpenAdd(true)}>
              <IconPlus size={16} style={{ marginRight: 8 }} />
              Add Customer
            </Button>
          </div>
        </Group>
      </Box>

      <Card>
        <Card.Section>
          <Group justify="space-between" p="md">
            <div>
              <Text fw={600}>All Customers</Text>
              <Text c="dimmed" size="sm">
                {filtered.length} found
              </Text>
            </div>
            <div style={{ width: 320 }}>
              <Group justify="flex-start" gap="xs">
                <IconSearch size={16} />
                <Input
                  placeholder="Search customers..."
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                />
              </Group>
            </div>
          </Group>
        </Card.Section>

        <Card.Section>
          <ScrollArea>
            <Table verticalSpacing="sm">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>City</th>
                  <th>Phone</th>
                  <th>GST</th>
                  <th style={{ textAlign: "right" }}>Balance</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c: Customer) => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: "monospace" }}>
                      {c.customerCode}
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ color: "#666" }}>{c.city}</td>
                    <td>{c.phone}</td>
                    <td style={{ fontSize: 12 }}>{c.gstNumber}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>
                      {c.currentBalance && c.currentBalance < 0 ? (
                        <span style={{ color: "red" }}>
                          Debit {formatCurrency(Math.abs(c.currentBalance))}
                        </span>
                      ) : (
                        <span style={{ color: "green" }}>
                          Credit{" "}
                          {formatCurrency(Math.abs(c.currentBalance || 0))}
                        </span>
                      )}
                    </td>
                    <td>
                      <Badge color={c.isActive ? "teal" : "gray"}>
                        {c.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Group gap="xs">
                        <Button
                          variant="subtle"
                          size="xs"
                          onClick={() => {
                            setSelected(c);
                            setOpenView(true);
                          }}
                        >
                          <IconEye size={14} />
                        </Button>
                        <Button
                          variant="subtle"
                          size="xs"
                          onClick={() => {
                            setSelected(c);
                            setOpenEdit(true);
                          }}
                        >
                          <IconEdit size={14} />
                        </Button>
                        <Button
                          variant="subtle"
                          color="red"
                          size="xs"
                          onClick={() => {
                            // delete
                            setCustomers((prev) =>
                              prev.filter((x) => x.id !== c.id)
                            );
                          }}
                        >
                          <IconTrash size={14} />
                        </Button>
                      </Group>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ScrollArea>
        </Card.Section>
      </Card>

      <Modal opened={openView} onClose={() => setOpenView(false)} size="lg">
        <Box p="md">{selected && <CustomerDetails customer={selected} />}</Box>
      </Modal>

      <Modal opened={openEdit} onClose={() => setOpenEdit(false)} size="lg">
        <Box p="md">
          {selected && (
            <CustomerForm
              customer={selected}
              onClose={() => setOpenEdit(false)}
            />
          )}
        </Box>
      </Modal>

      <Modal opened={openAdd} onClose={() => setOpenAdd(false)} size="lg">
        <Box p="md">
          <CustomerForm onClose={() => setOpenAdd(false)} />
        </Box>
      </Modal>
    </div>
  );
}
