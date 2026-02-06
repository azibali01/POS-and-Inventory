 
import { useState, useMemo, useEffect } from "react";
import {
  Title,
  Card,
  Button,
  Modal,
  TextInput,
  Group,
  ActionIcon,
  Text,
  Textarea,
  Pagination,
  Select,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import Table from "../../../lib/AppTable";
import { useDataContext } from "../../Context/DataContext";
import type { Color } from "../../Context/DataContext";

export default function ColorPage() {
  const {
    colors,
    colorsLoading,
    createColor,
    updateColor,
    deleteColor,
    refreshFromBackend,
  } = useDataContext();

  useEffect(() => {
    refreshFromBackend();
  }, []);

  const [opened, setOpened] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [colorToDelete, setColorToDelete] = useState<Color | null>(null);
  
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<string>("25");

  const totalColors = colors.length;

  // Pagination logic
  const totalPages = Math.ceil(colors.length / parseInt(itemsPerPage));
  const paginatedColors = useMemo(() => {
    const start = (currentPage - 1) * parseInt(itemsPerPage);
    const end = start + parseInt(itemsPerPage);
    return colors.slice(start, end);
  }, [colors, currentPage, itemsPerPage]);

  const handleOpenModal = (color?: Color) => {
    if (color) {
      setEditingColor(color);
      setForm({
        name: color.name || "",
        description: color.description || "",
      });
    } else {
      setEditingColor(null);
      setForm({
        name: "",
        description: "",
      });
    }
    setOpened(true);
  };

  const handleCloseModal = () => {
    setOpened(false);
    setEditingColor(null);
    setForm({
      name: "",
      description: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      showNotification({
        title: "Validation Error",
        message: "Color name is required",
        color: "red",
      });
      return;
    }

    try {
      if (editingColor && editingColor._id) {
        await updateColor(editingColor._id, {
          name: form.name.trim(),
          description: form.description.trim(),
        });
      } else {
        await createColor({
          name: form.name.trim(),
          description: form.description.trim(),
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error("Color operation failed:", error);
    }
  };

  const handleDeleteClick = (color: Color) => {
    setColorToDelete(color);
    setDeleteModalOpened(true);
  };

  const confirmDelete = async () => {
    if (!colorToDelete || !colorToDelete._id) return;

    try {
      await deleteColor(colorToDelete._id);
      setDeleteModalOpened(false);
      setColorToDelete(null);
    } catch (error) {
      console.error("Delete color failed:", error);
    }
  };

  return (
    <div>
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Colors</Title>
          <Text color="dimmed">
            Manage color options for products
          </Text>
          <Group gap="xs" mt="xs">
            <Text size="sm" color="dimmed">
              Showing {paginatedColors.length} of {totalColors} colors
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
            onClick={() => { handleOpenModal(); }}
          >
            Add Color
          </Button>
        </div>
      </Group>

      <Card>
        {colorsLoading ? (
          <Text>Loading colors...</Text>
        ) : (
          <Table highlightOnHover withColumnBorders withRowBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: "60px" }}>Sr No.</Table.Th>
                <Table.Th>Color Name</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th style={{ textAlign: "right" }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginatedColors.map((color, index) => (
                <Table.Tr key={color._id || color.id}>
                  <Table.Td>
                    {(currentPage - 1) * parseInt(itemsPerPage) + index + 1}
                  </Table.Td>
                  <Table.Td>{color.name}</Table.Td>
                  <Table.Td>
                    <Text color="dimmed" size="sm">
                      {color.description || "-"}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: "right" }}>
                    <Group justify="flex-end">
                      <ActionIcon
                        variant="subtle"
                        onClick={() => { handleOpenModal(color); }}
                      >
                        <IconEdit size={18} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        onClick={() => { handleDeleteClick(color); }}
                      >
                        <IconTrash size={18} color="red" />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
              {paginatedColors.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={4} style={{ textAlign: "center" }}>
                    <Text color="dimmed">No colors available</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        )}
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

      {/* Add/Edit Modal */}
      <Modal
        opened={opened}
        onClose={handleCloseModal}
        title={editingColor ? "Edit Color" : "Add New Color"}
        size="md"
      >
        <TextInput
          label="Color Name"
          placeholder="Enter color name"
          required
          value={form.name}
          onChange={(e) => { setForm({ ...form, name: e.currentTarget.value }); }}
          mb="sm"
        />
        <Textarea
          label="Description"
          placeholder="Optional description"
          value={form.description}
          onChange={(e) =>
            { setForm({ ...form, description: e.currentTarget.value }); }
          }
          rows={3}
          mb="md"
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editingColor ? "Update Color" : "Add Color"}
          </Button>
        </Group>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => { setDeleteModalOpened(false); }}
        title="Delete Color"
        size="sm"
      >
        <Text size="sm" mb="lg">
          Are you sure you want to delete the color "{colorToDelete?.name}"?
          This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button
            variant="default"
            onClick={() => { setDeleteModalOpened(false); }}
          >
            Cancel
          </Button>
          <Button color="red" onClick={confirmDelete}>
            Delete
          </Button>
        </Group>
      </Modal>
    </div>
  );
}
