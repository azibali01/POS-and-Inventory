import { useMemo, useState } from "react";
import {
  Card,
  TextInput,
  Button,
  ScrollArea,
  Text,
  Title,
} from "@mantine/core";
import Table from "../../../lib/AppTable";
import SupplierForm from "../../../components/purchase/SupplierForm";
import type { Supplier } from "../../../components/purchase/SupplierForm";
import { formatCurrency } from "../../../lib/format-utils";

function formatDate(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

const mockSuppliers: Supplier[] = [
  {
    id: "s1",
    supplierCode: "SUP-001",
    name: "Aluminium Co",
    city: "Lahore",
    gstNumber: "GST-111",
    phone: "0300123456",
    createdAt: new Date().toISOString(),
    openingBalance: 1000,
    currentBalance: -2500,
  },
];

export default function SuppliersPage() {
  const [q, setQ] = useState("");
  const [data, setData] = useState<Supplier[]>(mockSuppliers);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Supplier | undefined>(undefined);

  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim();
    if (!term) return data;
    return data.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        String(s.city ?? "")
          .toLowerCase()
          .includes(term) ||
        s.supplierCode.toLowerCase().includes(term)
    );
  }, [q, data]);

  function handleSave(next: Supplier) {
    setData((prev) => {
      const existing = prev.findIndex((s) => s.id === next.id);
      if (existing >= 0) {
        const copy = [...prev];
        copy[existing] = next;
        return copy;
      }
      return [next, ...prev];
    });
  }

  return (
    <div>
      <Card>
        <Card.Section
          style={{
            padding: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Title order={2}>Suppliers</Title>
            <Text c="dimmed">Manage purchase suppliers</Text>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <TextInput
              placeholder="Search suppliers..."
              value={q}
              onChange={(e) => setQ(e.currentTarget.value)}
            />
            <Button
              onClick={() => {
                setEdit(undefined);
                setOpen(true);
              }}
            >
              Add Supplier
            </Button>
          </div>
        </Card.Section>

        <Card.Section>
          <ScrollArea>
            <Table
              striped
              highlightOnHover
              verticalSpacing="sm"
              style={{
                width: "100%",
                marginTop: 12,
                border: "1px solid rgba(0,0,0,0.06)",
                borderCollapse: "collapse",
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Code</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>City</Table.Th>
                  <Table.Th>GST</Table.Th>
                  <Table.Th>Phone</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th style={{ textAlign: "right" }}>Balance</Table.Th>
                  <Table.Th style={{ textAlign: "right" }}>Action</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtered.map((s) => (
                  <Table.Tr key={s.id}>
                    <Table.Td style={{ fontFamily: "monospace" }}>
                      {s.supplierCode}
                    </Table.Td>
                    <Table.Td>{s.name}</Table.Td>
                    <Table.Td>{s.city}</Table.Td>
                    <Table.Td>{s.gstNumber}</Table.Td>
                    <Table.Td>{s.phone}</Table.Td>
                    <Table.Td>
                      {formatDate(
                        typeof s.createdAt === "string"
                          ? s.createdAt
                          : s.createdAt?.toString()
                      )}
                    </Table.Td>
                    <Table.Td style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700 }}>
                        {formatCurrency(s.currentBalance ?? 0)}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: (s.currentBalance ?? 0) < 0 ? "red" : "green",
                        }}
                      >
                        {Math.abs(s.currentBalance ?? 0) > 0
                          ? `${
                              (s.currentBalance ?? 0) < 0 ? "Debit" : "Credit"
                            } ${formatCurrency(
                              Math.abs(s.currentBalance ?? 0)
                            )}`
                          : "Nil"}
                      </div>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "right" }}>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEdit(s);
                          setOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Card.Section>
      </Card>

      <SupplierForm
        open={open}
        initial={edit}
        onClose={() => setOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
