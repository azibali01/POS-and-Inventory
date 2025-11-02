import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Group,
  Input,
  Modal,
  ScrollArea,
  Text,
  Title,
} from "@mantine/core";
import Table from "../../../lib/AppTable";
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconEye,
  IconTrash,
} from "@tabler/icons-react";
import SupplierForm from "../../../components/purchase/SupplierForm";
import type { Supplier } from "../../../components/purchase/SupplierForm";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../../../lib/api";
import { showNotification } from "@mantine/notifications";

function formatCurrency(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 0 });
}

function formatDate(iso?: string | Date) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

export default function SuppliersPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Fetch suppliers from API on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getSuppliers();
        setSuppliers(data || []);
      } catch {
        showNotification({
          title: "Error",
          message: "Failed to fetch suppliers",
          color: "red",
        });
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return suppliers.filter((s) =>
      [s.name, s.city, s.phone].some((v) => (v || "").toLowerCase().includes(q))
    );
  }, [suppliers, search]);

  const handleDeleteConfirm = async () => {
    if (!supplierToDelete) return;
    if (
      !supplierToDelete._id ||
      supplierToDelete._id === "undefined" ||
      String(supplierToDelete._id).includes("undefined")
    ) {
      showNotification({
        title: "Error",
        message: "Cannot delete supplier: Invalid ID",
        color: "red",
      });
      setOpenDelete(false);
      setSupplierToDelete(null);
      return;
    }
    setDeleting(true);
    try {
      await deleteSupplier(supplierToDelete._id);
      setSuppliers((prev) =>
        prev.filter((x) => x._id !== supplierToDelete._id)
      );
      showNotification({
        title: "Success",
        message: "Supplier deleted successfully",
        color: "green",
      });
    } catch {
      showNotification({
        title: "Error",
        message: "Failed to delete supplier",
        color: "red",
      });
    } finally {
      setDeleting(false);
      setOpenDelete(false);
      setSupplierToDelete(null);
    }
  };

  async function handleSave(next: Supplier) {
    // If _id exists in list, update, else create
    const exists = suppliers.some((s) => s._id === next._id);
    try {
      let saved: Supplier;
      if (exists) {
        saved = await updateSupplier(next._id, next);
        setSuppliers((prev) =>
          prev.map((s) => (s._id === next._id ? saved : s))
        );
        showNotification({
          title: "Updated",
          message: "Supplier updated",
          color: "green",
        });
      } else {
        // Remove _id before create to let MongoDB generate it
        const rest = { ...next } as Partial<Supplier>;
        if (rest._id) delete rest._id;
        saved = await createSupplier(rest);
        setSuppliers((prev) => [saved, ...prev]);
        showNotification({
          title: "Created",
          message: "Supplier added",
          color: "green",
        });
      }
    } catch {
      showNotification({
        title: "Error",
        message: "Failed to save supplier",
        color: "red",
      });
    }
  }

  return (
    <div>
      <Box mb="md">
        <Group justify="space-between">
          <div>
            <Title order={2}>Suppliers</Title>
            <Text c="dimmed">Manage purchase suppliers</Text>
          </div>
          <div>
            <Button onClick={() => setOpenAdd(true)}>
              <IconPlus size={16} style={{ marginRight: 8 }} />
              Add Supplier
            </Button>
          </div>
        </Group>
      </Box>

      <Card>
        <Card.Section>
          <Group justify="space-between" p="md">
            <div>
              <Text fw={600}>All Suppliers</Text>
              <Text c="dimmed" size="sm">
                {filtered.length} found
              </Text>
            </div>
            <div style={{ width: 320 }}>
              <Group justify="flex-start" gap="xs">
                <IconSearch size={16} />
                <Input
                  placeholder="Search suppliers..."
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
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>City</Table.Th>
                  <Table.Th>Phone</Table.Th>
                  <Table.Th>Opening Balance</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtered.map((s, index) => (
                  <Table.Tr key={s._id || `supplier-fallback-${index}`}>
                    <Table.Td style={{ fontWeight: 600 }}>{s.name}</Table.Td>
                    <Table.Td style={{ color: "#666" }}>{s.city}</Table.Td>
                    <Table.Td>{s.phone}</Table.Td>
                    <Table.Td>
                      <span
                        style={{
                          color: (s.openingBalance ?? 0) < 0 ? "red" : "green",
                        }}
                      >
                        {(s.openingBalance ?? 0) < 0 ? "Debit" : "Credit"}{" "}
                        {formatCurrency(Math.abs(s.openingBalance || 0))}
                      </span>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Button
                          variant="subtle"
                          size="xs"
                          onClick={() => {
                            setSelected(s);
                            setOpenView(true);
                          }}
                        >
                          <IconEye size={14} />
                        </Button>
                        <Button
                          variant="subtle"
                          size="xs"
                          onClick={() => {
                            setSelected(s);
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
                            setSupplierToDelete(s);
                            setOpenDelete(true);
                          }}
                        >
                          <IconTrash size={14} />
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Card.Section>
      </Card>

      {/* View Supplier Modal */}
      <Modal opened={openView} onClose={() => setOpenView(false)} size="lg">
        <Box p="md">
          {selected && (
            <div style={{ display: "grid", gap: 8 }}>
              <Text fw={600} size="lg">
                {selected.name}
              </Text>
              <Text>City: {selected.city || "-"}</Text>
              <Text>Phone: {selected.phone || "-"}</Text>
              <Text>Email: {selected.email || "-"}</Text>
              <Text>Address: {selected.address || "-"}</Text>
              <Text>
                Opening Balance:{" "}
                <span
                  style={{
                    color: (selected.openingBalance ?? 0) < 0 ? "red" : "green",
                  }}
                >
                  {(selected.openingBalance ?? 0) < 0 ? "Debit" : "Credit"}{" "}
                  {formatCurrency(Math.abs(selected.openingBalance || 0))}
                </span>
              </Text>
              {/* Current Balance removed from view as per request */}
              <Text>Created: {formatDate(selected.createdAt)}</Text>
            </div>
          )}
        </Box>
      </Modal>

      {/* Edit Supplier Modal */}
      <Modal opened={openEdit} onClose={() => setOpenEdit(false)} size="lg">
        <Box p="md">
          {selected && (
            <SupplierForm
              open={openEdit}
              initial={selected}
              onClose={() => setOpenEdit(false)}
              onSave={handleSave}
            />
          )}
        </Box>
      </Modal>

      {/* Add Supplier Modal */}
      <Modal opened={openAdd} onClose={() => setOpenAdd(false)} size="lg">
        <Box p="md">
          <SupplierForm
            open={openAdd}
            onClose={() => setOpenAdd(false)}
            onSave={handleSave}
          />
        </Box>
      </Modal>

      {/* Delete Supplier Modal */}
      <Modal
        opened={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setSupplierToDelete(null);
        }}
        size="sm"
        title="Delete Supplier"
      >
        <Box p="md">
          <Text mb="md">
            Are you sure you want to delete supplier "{supplierToDelete?.name}"?
            This action cannot be undone.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="default"
              onClick={() => {
                setOpenDelete(false);
                setSupplierToDelete(null);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDeleteConfirm}
              loading={deleting}
            >
              Delete
            </Button>
          </Group>
        </Box>
      </Modal>
    </div>
  );
}
