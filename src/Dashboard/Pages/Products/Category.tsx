import { useMemo, useState } from "react";
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
  LoadingOverlay,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import Table from "../../../lib/AppTable";
import { useInventory, useCategories } from "../../../lib/hooks/useInventory";

export default function CategoryPage() {
  const { inventory, isLoading: invLoading } = useInventory();
  const {
    categories: categoryObjects,
    isLoading: catLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCategories();

  // Combine loading states
  const isLoading =
    invLoading || catLoading || isCreating || isUpdating || isDeleting;

  const [addOpen, setAddOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null); // Name of category to delete
  const [editing, setEditing] = useState<string | null>(null); // Name of category being edited

  const [addValue, setAddValue] = useState("");
  const [renameValue, setRenameValue] = useState("");
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<string>("25");

  // Derive unique category names from both Inventory items and Categories collection
  const categoriesList = useMemo(() => {
    const s = new Set<string>();
    // From inventory items (legacy string categories)
    for (const it of inventory || []) {
      const c = (it.category || "").trim();
      if (c) s.add(c);
    }
    // From explicit categories collection (objects)
    for (const c of categoryObjects || []) {
      if (c.name && typeof c.name === "string" && c.name.trim()) {
        s.add(c.name.trim());
      }
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [inventory, categoryObjects]);

  const totalCategories = categoriesList.length;

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
    if (categoriesList.some((c) => c.toLowerCase() === v.toLowerCase()))
      return showNotification({
        title: "Exists",
        message: "Category already exists",
        color: "orange",
      });

    createCategory(v, {
      onSuccess: () => {
        setAddValue("");
        setAddOpen(false);
      },
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

    // Find the category object to update
    const catObj = categoryObjects.find((c: any) => c.name === oldName);

    if (catObj && (catObj.id || catObj._id)) {
      updateCategory(
        { id: catObj.id || catObj._id, name: v },
        {
          onSuccess: () => {
            setRenameOpen(false);
            setEditing(null);
            setRenameValue("");
          },
        }
      );
    } else {
      showNotification({
        title: "Cannot Rename",
        message:
          "This category is derived from product items and does not exist as a standalone category record yet.",
        color: "orange",
      });
    }
  }

  function handleDelete(delName: string) {
    // open local confirm modal
    setConfirmTarget(delName);
    setConfirmOpen(true);
    setAddValue("");
    setRenameValue("");
  }

  function confirmDelete() {
    if (confirmTarget) {
      const catObj = categoryObjects.find((c: any) => c.name === confirmTarget);
      if (catObj && (catObj.id || catObj._id)) {
        deleteCategory(catObj.id || catObj._id, {
          onSuccess: () => {
            setConfirmOpen(false);
            setConfirmTarget(null);
          },
        });
      } else {
        showNotification({
          title: "Cannot Delete",
          message:
            "This category is in use by products or not a managed category record.",
          color: "orange",
        });
        setConfirmOpen(false);
      }
    }
  }

  return (
    <div>
      <LoadingOverlay visible={isLoading} />
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Categories</Title>
          <Text c="dimmed">
            Manage product categories used across inventory
          </Text>
          <Group gap="xs" mt="xs">
            <Text size="sm" c="dimmed">
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
                  <Text c="dimmed">No categories available</Text>
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
          <Button onClick={handleAdd} loading={isCreating}>
            Add
          </Button>
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
          <Button
            onClick={() => editing && handleRename(editing)}
            loading={isUpdating}
          >
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
        <Text>Delete category '{confirmTarget}'?</Text>
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
          <Button color="red" onClick={confirmDelete} loading={isDeleting}>
            Delete
          </Button>
        </Group>
      </Modal>
    </div>
  );
}
