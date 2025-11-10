import { useMemo, useState, useEffect } from "react";
import {
  Card,
  Title,
  Text,
  Group,
  Button,
  Modal,
  TextInput,
  ActionIcon,
  Pagination,
  Select,
} from "@mantine/core";
import Table from "../../../lib/AppTable";
import { showNotification } from "@mantine/notifications";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import { useDataContext } from "../../Context/DataContext";

export default function CategoryPage() {
  const {
    inventory,
    categories = [],
    addCategory,
    renameCategory,
    deleteCategory,
    refreshFromBackend,
  } = useDataContext();

  useEffect(() => {
    refreshFromBackend();
  }, []);

  const [addOpen, setAddOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  const [addValue, setAddValue] = useState("");
  const [renameValue, setRenameValue] = useState("");
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<string>("25");

  const categoriesList = useMemo(() => {
    const s = new Set<string>();
    for (const it of inventory || []) {
      const c = (it.category || "").trim();
      if (c) s.add(c);
    }
    for (const c of categories || []) {
      if (typeof c === "string" && c.trim()) s.add(c.trim());
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [inventory, categories]);

  const totalCategories = categoriesList.length;
  // test
  // Pagination logic
  const totalPages = Math.ceil(categoriesList.length / parseInt(itemsPerPage));
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * parseInt(itemsPerPage);
    const end = start + parseInt(itemsPerPage);
    return categoriesList.slice(start, end);
  }, [categoriesList, currentPage, itemsPerPage]);

  function handleAdd() {
    const v = addValue.trim();
    if (!v)
      return showNotification({
        title: "Invalid",
        message: "Category name required",
        color: "yellow",
      });
    if (categoriesList.includes(v))
      return showNotification({
        title: "Exists",
        message: "Category already exists",
        color: "orange",
      });
    addCategory(v);
    setAddValue("");
    setAddOpen(false);
    showNotification({
      title: "Added",
      message: `Category '${v}' added`,
      color: "green",
    });
  }

  function handleRename(oldName: string) {
    const v = renameValue.trim();
    if (!v)
      return showNotification({
        title: "Invalid",
        message: "New name required",
        color: "yellow",
      });
    if (oldName === v) return setRenameOpen(false);
    renameCategory(oldName, v);
    setRenameOpen(false);
    setEditing(null);
    setRenameValue("");
    showNotification({
      title: "Renamed",
      message: `'${oldName}' → '${v}'`,
      color: "green",
    });
  }

  function handleDelete(delName: string) {
    // open local confirm modal
    setConfirmTarget(delName);
    setConfirmOpen(true);
    setAddValue("");
    setRenameValue("");
  }

  return (
    <div>
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Categories</Title>
          <Text color="dimmed">
            Manage product categories used across inventory
          </Text>
          <Group gap="xs" mt="xs">
            <Text size="sm" color="dimmed">
              Showing {paginatedCategories.length} of {totalCategories}{" "}
              categories
            </Text>
            <Select
              label="Per page"
              value={itemsPerPage}
              onChange={(val) => {
                setItemsPerPage(val || "25");
                setCurrentPage(1);
              }}
              data={["10", "25", "50", "100"]}
              w={100}
            />
          </Group>
        </div>
        <div>
          <Button
            leftSection={<IconPlus />}
            onClick={() => {
              setAddValue("");
              setAddOpen(true);
            }}
          >
            Add Category
          </Button>
        </div>
      </Group>

      <Card>
        <Table highlightOnHover withColumnBorders withRowBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: "60px" }}>Sr No.</Table.Th>
              <Table.Th>Category</Table.Th>

              <Table.Th style={{ textAlign: "right" }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedCategories.map((name, index) => (
              <Table.Tr key={name}>
                <Table.Td>
                  {(currentPage - 1) * parseInt(itemsPerPage) + index + 1}
                </Table.Td>
                <Table.Td>{name}</Table.Td>
                <Table.Td style={{ textAlign: "right" }}>
                  <Group justify="flex-end">
                    <ActionIcon
                      variant="subtle"
                      onClick={() => {
                        setEditing(name);
                        setRenameValue(name);
                        setRenameOpen(true);
                      }}
                    >
                      <IconEdit size={18} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      onClick={() => handleDelete(name)}
                    >
                      <IconTrash size={18} color="red" />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {paginatedCategories.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={3} style={{ textAlign: "center" }}>
                  <Text color="dimmed">No categories available</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
        {totalPages > 1 && (
          <Group justify="center" mt="md" pb="md">
            <Pagination
              value={currentPage}
              onChange={setCurrentPage}
              total={totalPages}
              size="sm"
              withEdges
            />
          </Group>
        )}
      </Card>

      <Modal
        opened={addOpen}
        onClose={() => {
          setAddOpen(false);
          setAddValue("");
        }}
        title="Add Category"
      >
        <TextInput
          placeholder="Category name"
          value={addValue}
          onChange={(e) => setAddValue(e.currentTarget.value)}
        />
        <Group justify="flex-end" mt="md">
          <Button onClick={() => setAddOpen(false)} variant="default">
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add</Button>
        </Group>
      </Modal>

      <Modal
        opened={renameOpen}
        onClose={() => {
          setRenameOpen(false);
          setRenameValue("");
        }}
        title={editing ? `Rename '${editing}'` : "Rename Category"}
      >
        <TextInput
          placeholder="New name"
          value={renameValue}
          onChange={(e) => setRenameValue(e.currentTarget.value)}
        />
        <Group justify="flex-end" mt="md">
          <Button onClick={() => setRenameOpen(false)} variant="default">
            Cancel
          </Button>
          <Button onClick={() => editing && handleRename(editing)}>
            Rename
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setConfirmTarget(null);
        }}
        title="Delete category"
      >
        <Text>
          Delete category '{confirmTarget}' and clear it from inventory items?
        </Text>
        <Group justify="flex-end" mt="md">
          <Button
            onClick={() => {
              setConfirmOpen(false);
              setConfirmTarget(null);
            }}
            variant="default"
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => {
              if (confirmTarget) {
                deleteCategory(confirmTarget);
                showNotification({
                  title: "Deleted",
                  message: `Category '${confirmTarget}' removed`,
                  color: "orange",
                });
              }
              setConfirmOpen(false);
              setConfirmTarget(null);
              setAddValue("");
              setRenameValue("");
            }}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </div>
  );
}
