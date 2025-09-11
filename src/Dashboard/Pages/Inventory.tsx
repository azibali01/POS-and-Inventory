import { useState } from "react";
import {
  Card,
  Group,
  Text,
  TextInput,
  NumberInput,
  Select,
  Button,
  Badge,
  Modal,
  Table,
  Stack,
  Textarea,
  ActionIcon,
  Menu,
  TableThead,
} from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconUpload,
  IconDownload,
  IconPackage,
  IconTrendingUp,
  IconTrendingDown,
  IconAlertTriangle,
  IconDotsVertical,
} from "@tabler/icons-react";

interface InventoryItem {
  id: number;
  name: string;
  code: string;
  sku: string;
  category: string;
  supplier: string;
  unit: string;
  weight?: number;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  maxStock: number;
  location: string;
  description: string;
  status: "active" | "inactive";
  lastUpdated: string;
}

const initialInventory: InventoryItem[] = [
  {
    id: 1,
    name: "Aluminium Sheet 4mm",
    code: "AS4",
    sku: "ALU-SHT-4MM-001",
    category: "Sheets",
    supplier: "Metro Metals",
    unit: "sq ft",
    weight: 2.5,
    costPrice: 380,
    sellingPrice: 450,
    stock: 120,
    minStock: 50,
    maxStock: 500,
    location: "A-1-01",
    description: "High quality aluminium sheet 4mm thickness",
    status: "active",
    lastUpdated: "2024-01-15",
  },
  {
    id: 2,
    name: "Aluminium Pipe 2 inch",
    code: "AP2",
    sku: "ALU-PIP-2IN-001",
    category: "Pipes",
    supplier: "Steel World",
    unit: "ft",
    weight: 1.8,
    costPrice: 240,
    sellingPrice: 280,
    stock: 85,
    minStock: 30,
    maxStock: 200,
    location: "B-2-03",
    description: "Standard aluminium pipe 2 inch diameter",
    status: "active",
    lastUpdated: "2024-01-14",
  },
  {
    id: 3,
    name: "Aluminium Angle 25mm",
    code: "AA25",
    sku: "ALU-ANG-25MM-001",
    category: "Angles",
    supplier: "Prime Aluminium",
    unit: "ft",
    weight: 0.8,
    costPrice: 150,
    sellingPrice: 180,
    stock: 15,
    minStock: 25,
    maxStock: 300,
    location: "C-1-05",
    description: "L-shaped aluminium angle 25mm",
    status: "active",
    lastUpdated: "2024-01-13",
  },
];

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [modal, setModal] = useState<"add" | "edit" | "stock" | "bulk" | null>(
    null
  );
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [stockAction, setStockAction] = useState<"in" | "out">("in");
  const [stockQuantity, setStockQuantity] = useState<string>("");
  const [stockReason, setStockReason] = useState<string>("");
  const [stockReference, setStockReference] = useState<string>("");
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: "",
    code: "",
    sku: "",
    category: "",
    supplier: "",
    unit: "",
    weight: 0,
    costPrice: 0,
    sellingPrice: 0,
    stock: 0,
    minStock: 0,
    maxStock: 0,
    location: "",
    description: "",
    status: "active",
  });

  const categories = [
    "all",
    ...Array.from(new Set(inventory.map((item) => item.category))),
  ];
  const suppliers = Array.from(new Set(inventory.map((item) => item.supplier)));

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const lowStockItems = inventory.filter((item) => item.stock <= item.minStock);
  const outOfStockItems = inventory.filter((item) => item.stock === 0);

  // Handlers
  const handleAddItem = () => {
    const id = Math.max(...inventory.map((item) => item.id)) + 1;
    const item: InventoryItem = {
      ...newItem,
      id,
      lastUpdated: new Date().toISOString().split("T")[0],
    } as InventoryItem;
    setInventory([...inventory, item]);
    setNewItem({
      name: "",
      code: "",
      sku: "",
      category: "",
      supplier: "",
      unit: "",
      weight: 0,
      costPrice: 0,
      sellingPrice: 0,
      stock: 0,
      minStock: 0,
      maxStock: 0,
      location: "",
      description: "",
      status: "active",
    });
    setModal(null);
  };

  const handleEditItem = () => {
    if (!selectedItem) return;
    setInventory(
      inventory.map((item) =>
        item.id === selectedItem.id
          ? {
              ...selectedItem,
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : item
      )
    );
    setModal(null);
    setSelectedItem(null);
  };

  const handleDeleteItem = (id: number) => {
    setInventory(inventory.filter((item) => item.id !== id));
  };

  const handleStockUpdate = () => {
    if (!selectedItem || !stockQuantity) return;
    const quantity = Number.parseInt(stockQuantity);
    const newStock =
      stockAction === "in"
        ? selectedItem.stock + quantity
        : selectedItem.stock - quantity;
    setInventory(
      inventory.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              stock: Math.max(0, newStock),
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : item
      )
    );
    setModal(null);
    setSelectedItem(null);
    setStockQuantity("");
    setStockReason("");
    setStockReference("");
  };

  const handleBulkPriceUpdate = () => {
    setModal(null);
  };

  const handleZeroOutItems = () => {
    setInventory(
      inventory.map((item) => ({
        ...item,
        stock: 0,
        lastUpdated: new Date().toISOString().split("T")[0],
      }))
    );
  };

  const exportInventory = () => {
    // Placeholder for export logic
    alert("Exporting inventory data");
  };

  return (
    <Stack gap={32} p={24} bg="#F8F9FB">
      {/* Stats Cards */}
      <Group grow mb="md">
        <Card
          withBorder
          radius="md"
          p="md"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <Group justify="space-between">
            <Text fw={500}>Total Items</Text>
            <IconPackage size={16} />
          </Group>
          <Text size="lg" fw={700} mt={4}>
            {inventory.length}
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            Active products
          </Text>
        </Card>
        <Card
          withBorder
          radius="md"
          p="md"
          style={{
            boxShadow: "0 2px 8px rgba(255, 193, 7, 0.08)",
          }}
        >
          <Group justify="space-between">
            <Text fw={500}>Low Stock</Text>
            <IconAlertTriangle size={16} color="#FFC107" />
          </Group>
          <Text size="lg" fw={700} c="#FFC107" mt={4}>
            {lowStockItems.length}
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            Items below minimum
          </Text>
        </Card>
        <Card
          withBorder
          radius="md"
          p={"md"}
          style={{
            boxShadow: "0 2px 8px rgba(255, 0, 0, 0.08)",
          }}
        >
          <Group justify="space-between">
            <Text fw={500}>Out of Stock</Text>
            <IconTrash size={16} color="#FF3B30" />
          </Group>
          <Text size="lg" fw={700} c="#FF3B30" mt={4}>
            {outOfStockItems.length}
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            Zero stock items
          </Text>
        </Card>
        <Card
          withBorder
          radius="md"
          p="md"
          style={{
            boxShadow: "0 2px 8px rgba(76, 175, 80, 0.08)",
          }}
        >
          <Group justify="space-between">
            <Text fw={500}>Total Value</Text>
            <IconTrendingUp size={16} color="#4CAF50" />
          </Group>
          <Text size="lg" fw={700} c="#4CAF50" mt={4}>
            {inventory
              .reduce((sum, item) => sum + item.stock * item.costPrice, 0)
              .toLocaleString()}
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            Inventory value
          </Text>
        </Card>
      </Group>

      {/* Main Inventory Management */}
      <Card
        withBorder
        radius="md"
        p="md"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
      >
        <Group justify="space-between" mb={10}>
          <Text fw={700} mb={0}>
            Inventory Management
          </Text>
          <Group gap={12}>
            <Button
              color="#5E78D9"
              leftSection={<IconPlus size={16} />}
              radius="md"
              onClick={() => setModal("add")}
            >
              Add Item
            </Button>
            <Button
              variant="default"
              leftSection={<IconUpload size={16} />}
              radius="md"
              onClick={() => setModal("bulk")}
            >
              Bulk Update
            </Button>
            <Button
              color="#DBE8F3"
              c={"#000"}
              leftSection={<IconDownload size={16} />}
              radius="md"
              onClick={exportInventory}
            >
              Export
            </Button>
            <Button
              color="red"
              leftSection={<IconTrash size={16} />}
              radius="md"
              onClick={handleZeroOutItems}
            >
              Zero Out
            </Button>
          </Group>
        </Group>
        <Group mb={20} gap={16} wrap="wrap">
          <TextInput
            label="Search"
            placeholder="Search items by name, code, or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            style={{ minWidth: 300 }}
            radius="md"
          />
          <Select
            label="Category"
            data={categories.map((cat) => ({
              value: cat,
              label: cat === "all" ? "All Categories" : cat,
            }))}
            value={selectedCategory}
            onChange={(value) => setSelectedCategory(value || "all")}
            style={{ minWidth: 160 }}
            radius="md"
          />
          <Select
            label="Status"
            data={[
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value || "all")}
            style={{ minWidth: 120 }}
            radius="md"
          />
        </Group>

        <Table
          highlightOnHover
          withTableBorder
          style={{ borderRadius: 12, overflow: "hidden" }}
        >
          <TableThead style={{ background: "#F4F6FA" }}>
            <Table.Tr>
              <Table.Th style={{ padding: "12px 16px", fontWeight: 600 }}>
                Item Details
              </Table.Th>
              <Table.Th style={{ padding: "12px 16px", fontWeight: 600 }}>
                Category
              </Table.Th>
              <Table.Th style={{ padding: "12px 16px", fontWeight: 600 }}>
                Supplier
              </Table.Th>
              <Table.Th style={{ padding: "12px 16px", fontWeight: 600 }}>
                Stock
              </Table.Th>
              <Table.Th style={{ padding: "12px 16px", fontWeight: 600 }}>
                Cost Price
              </Table.Th>
              <Table.Th style={{ padding: "12px 16px", fontWeight: 600 }}>
                Selling Price
              </Table.Th>
              <Table.Th style={{ padding: "12px 16px", fontWeight: 600 }}>
                Status
              </Table.Th>
              <Table.Th style={{ padding: "12px 16px", fontWeight: 600 }}>
                Actions
              </Table.Th>
            </Table.Tr>
          </TableThead>
          <Table.Tbody>
            {filteredInventory.map((item) => (
              <Table.Tr
                key={item.id}
                style={{ borderBottom: "1px solid #F0F1F3" }}
              >
                <Table.Td style={{ padding: "10px 8px", verticalAlign: "top" }}>
                  <Text fw={600} size="sm" mb={1}>
                    {item.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {item.code} | {item.sku}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {item.location}
                  </Text>
                </Table.Td>
                <Table.Td style={{ padding: "10px 8px", verticalAlign: "top" }}>
                  <Badge color="gray" variant="filled" radius="sm" size="sm">
                    {item.category}
                  </Badge>
                </Table.Td>
                <Table.Td style={{ padding: "10px 8px", verticalAlign: "top" }}>
                  {item.supplier}
                </Table.Td>
                <Table.Td style={{ padding: "10px 8px", verticalAlign: "top" }}>
                  <Group gap={4}>
                    <Text
                      fw={600}
                      c={
                        item.stock === 0
                          ? "red"
                          : item.stock <= item.minStock
                          ? "#FFC107"
                          : "#4CAF50"
                      }
                      size="sm"
                    >
                      {item.stock}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {item.unit}
                    </Text>
                    {item.stock <= item.minStock && (
                      <IconAlertTriangle size={12} color="#FFC107" />
                    )}
                  </Group>
                </Table.Td>
                <Table.Td style={{ padding: "10px 8px", verticalAlign: "top" }}>
                  {item.costPrice}
                </Table.Td>
                <Table.Td style={{ padding: "10px 8px", verticalAlign: "top" }}>
                  {item.sellingPrice}
                </Table.Td>
                <Table.Td style={{ padding: "10px 8px", verticalAlign: "top" }}>
                  <Badge
                    color={item.status === "active" ? "blue" : "gray"}
                    radius="sm"
                    size="sm"
                  >
                    {item.status.toUpperCase()}
                  </Badge>
                </Table.Td>
                <Table.Td style={{ padding: "10px 8px", verticalAlign: "top" }}>
                  <Menu shadow="md" width={180}>
                    <Menu.Target>
                      <ActionIcon color="#5E78D9" variant="subtle">
                        <IconDotsVertical size={14} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconEdit size={16} />}
                        onClick={() => {
                          setSelectedItem(item);
                          setModal("edit");
                        }}
                      >
                        Edit
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconTrendingUp size={16} />}
                        onClick={() => {
                          setSelectedItem(item);
                          setStockAction("in");
                          setModal("stock");
                        }}
                      >
                        Stock In
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconTrendingDown size={16} />}
                        onClick={() => {
                          setSelectedItem(item);
                          setStockAction("out");
                          setModal("stock");
                        }}
                      >
                        Stock Out
                      </Menu.Item>
                      <Menu.Item
                        color="red"
                        leftSection={<IconTrash size={16} />}
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      {/* Add/Edit Item Modal */}
      <Modal
        opened={modal === "add" || modal === "edit"}
        onClose={() => {
          setModal(null);
          setSelectedItem(null);
        }}
        title={
          modal === "add" ? (
            <strong>Add New Item</strong>
          ) : (
            <strong>Edit Item</strong>
          )
        }
        size="lg"
        centered
      >
        <Stack>
          <Group grow>
            <TextInput
              label="Item Name"
              value={modal === "add" ? newItem.name : selectedItem?.name || ""}
              onChange={(e) =>
                modal === "add"
                  ? setNewItem({ ...newItem, name: e.currentTarget.value })
                  : setSelectedItem(
                      selectedItem && {
                        ...selectedItem,
                        name: e.currentTarget.value,
                      }
                    )
              }
            />
            <TextInput
              label="Code"
              value={modal === "add" ? newItem.code : selectedItem?.code || ""}
              onChange={(e) =>
                modal === "add"
                  ? setNewItem({ ...newItem, code: e.currentTarget.value })
                  : setSelectedItem(
                      selectedItem && {
                        ...selectedItem,
                        code: e.currentTarget.value,
                      }
                    )
              }
            />
            <TextInput
              label="SKU"
              value={modal === "add" ? newItem.sku : selectedItem?.sku || ""}
              onChange={(e) =>
                modal === "add"
                  ? setNewItem({ ...newItem, sku: e.currentTarget.value })
                  : setSelectedItem(
                      selectedItem && {
                        ...selectedItem,
                        sku: e.currentTarget.value,
                      }
                    )
              }
            />
          </Group>
          <Group grow>
            <Select
              label="Category"
              data={["Sheets", "Pipes", "Angles", "Channels", "Rods", "Wires"]}
              value={
                modal === "add"
                  ? newItem.category
                  : selectedItem?.category || ""
              }
              onChange={(value) =>
                modal === "add"
                  ? setNewItem({ ...newItem, category: value || "" })
                  : setSelectedItem(
                      selectedItem && { ...selectedItem, category: value || "" }
                    )
              }
            />
            <Select
              label="Supplier"
              data={suppliers}
              value={
                modal === "add"
                  ? newItem.supplier
                  : selectedItem?.supplier || ""
              }
              onChange={(value) =>
                modal === "add"
                  ? setNewItem({ ...newItem, supplier: value || "" })
                  : setSelectedItem(
                      selectedItem && { ...selectedItem, supplier: value || "" }
                    )
              }
            />
            <Select
              label="Unit"
              data={["sq ft", "ft", "kg", "pcs", "meter"]}
              value={modal === "add" ? newItem.unit : selectedItem?.unit || ""}
              onChange={(value) =>
                modal === "add"
                  ? setNewItem({ ...newItem, unit: value || "" })
                  : setSelectedItem(
                      selectedItem && { ...selectedItem, unit: value || "" }
                    )
              }
            />
          </Group>
          <Group grow>
            <NumberInput
              label="Weight (kg)"
              value={
                modal === "add"
                  ? Number(newItem.weight)
                  : Number(selectedItem?.weight) || 0
              }
              onChange={(value) =>
                modal === "add"
                  ? setNewItem({
                      ...newItem,
                      weight: typeof value === "number" ? value : 0,
                    })
                  : setSelectedItem(
                      selectedItem && {
                        ...selectedItem,
                        weight: typeof value === "number" ? value : 0,
                      }
                    )
              }
            />
            <TextInput
              label="Location"
              value={
                modal === "add"
                  ? newItem.location
                  : selectedItem?.location || ""
              }
              onChange={(e) =>
                modal === "add"
                  ? setNewItem({ ...newItem, location: e.currentTarget.value })
                  : setSelectedItem(
                      selectedItem && {
                        ...selectedItem,
                        location: e.currentTarget.value,
                      }
                    )
              }
            />
          </Group>
          <Group grow>
            <NumberInput
              label="Cost Price"
              value={
                modal === "add"
                  ? Number(newItem.costPrice)
                  : Number(selectedItem?.costPrice) || 0
              }
              onChange={(value) =>
                modal === "add"
                  ? setNewItem({
                      ...newItem,
                      costPrice: typeof value === "number" ? value : 0,
                    })
                  : setSelectedItem(
                      selectedItem && {
                        ...selectedItem,
                        costPrice: typeof value === "number" ? value : 0,
                      }
                    )
              }
            />
            <NumberInput
              label="Selling Price"
              value={
                modal === "add"
                  ? Number(newItem.sellingPrice)
                  : Number(selectedItem?.sellingPrice) || 0
              }
              onChange={(value) =>
                modal === "add"
                  ? setNewItem({
                      ...newItem,
                      sellingPrice: typeof value === "number" ? value : 0,
                    })
                  : setSelectedItem(
                      selectedItem && {
                        ...selectedItem,
                        sellingPrice: typeof value === "number" ? value : 0,
                      }
                    )
              }
            />
          </Group>
          <Group grow>
            <NumberInput
              label="Current Stock"
              value={
                modal === "add"
                  ? Number(newItem.stock)
                  : Number(selectedItem?.stock) || 0
              }
              onChange={(value) =>
                modal === "add"
                  ? setNewItem({
                      ...newItem,
                      stock: typeof value === "number" ? value : 0,
                    })
                  : setSelectedItem(
                      selectedItem && {
                        ...selectedItem,
                        stock: typeof value === "number" ? value : 0,
                      }
                    )
              }
            />
            <NumberInput
              label="Minimum Stock"
              value={
                modal === "add"
                  ? Number(newItem.minStock)
                  : Number(selectedItem?.minStock) || 0
              }
              onChange={(value) =>
                modal === "add"
                  ? setNewItem({
                      ...newItem,
                      minStock: typeof value === "number" ? value : 0,
                    })
                  : setSelectedItem(
                      selectedItem && {
                        ...selectedItem,
                        minStock: typeof value === "number" ? value : 0,
                      }
                    )
              }
            />
            <NumberInput
              label="Maximum Stock"
              value={
                modal === "add"
                  ? Number(newItem.maxStock)
                  : Number(selectedItem?.maxStock) || 0
              }
              onChange={(value) =>
                modal === "add"
                  ? setNewItem({
                      ...newItem,
                      maxStock: typeof value === "number" ? value : 0,
                    })
                  : setSelectedItem(
                      selectedItem && {
                        ...selectedItem,
                        maxStock: typeof value === "number" ? value : 0,
                      }
                    )
              }
            />
          </Group>
          <Textarea
            label="Description"
            value={
              modal === "add"
                ? newItem.description
                : selectedItem?.description || ""
            }
            onChange={(e) =>
              modal === "add"
                ? setNewItem({ ...newItem, description: e.currentTarget.value })
                : setSelectedItem(
                    selectedItem && {
                      ...selectedItem,
                      description: e.currentTarget.value,
                    }
                  )
            }
          />
          <Select
            label="Status"
            data={["active", "inactive"]}
            value={
              modal === "add"
                ? newItem.status
                : selectedItem?.status || "active"
            }
            onChange={(value) =>
              modal === "add"
                ? setNewItem({
                    ...newItem,
                    status: value as "active" | "inactive",
                  })
                : setSelectedItem(
                    selectedItem && {
                      ...selectedItem,
                      status: value as "active" | "inactive",
                    }
                  )
            }
          />
          <Group justify="flex-end" gap={8} mt={16}>
            <Button variant="default" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button onClick={modal === "add" ? handleAddItem : handleEditItem}>
              {modal === "add" ? "Add Item" : "Update Item"}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Stock Update Modal */}
      <Modal
        opened={modal === "stock"}
        onClose={() => {
          setModal(null);
          setSelectedItem(null);
        }}
        title={`Stock ${stockAction === "in" ? "In" : "Out"}${
          selectedItem ? ` - ${selectedItem.name}` : ""
        }`}
        size="md"
        centered
      >
        <Stack>
          <Text>
            Current stock: {selectedItem?.stock} {selectedItem?.unit}
          </Text>
          <NumberInput
            label="Quantity"
            value={Number(stockQuantity)}
            onChange={(value) => setStockQuantity(value?.toString() || "")}
          />
          <Select
            label="Reason"
            data={
              stockAction === "in"
                ? ["Purchase", "Customer Return", "Stock Adjustment"]
                : [
                    "Sale",
                    "Damage/Loss",
                    "Return to Supplier",
                    "Stock Adjustment",
                  ]
            }
            value={stockReason}
            onChange={(value) => setStockReason(value || "")}
          />
          <TextInput
            label="Reference"
            value={stockReference}
            onChange={(e) => setStockReference(e.currentTarget.value)}
            placeholder="PO number, Invoice number, etc."
          />
          <Group justify="flex-end" gap={8} mt={16}>
            <Button variant="default" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button onClick={handleStockUpdate}>Update Stock</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Bulk Update Modal */}
      <Modal
        opened={modal === "bulk"}
        onClose={() => setModal(null)}
        title={<strong>Bulk Update Inventory</strong>}
        size="md"
        centered
      >
        <Stack>
          <Text>Upload a file to update multiple items at once</Text>
          <TextInput type="file" accept=".csv,.xlsx,.xls" />
          <Text fz={12} c="dimmed">
            File should contain columns: SKU, Cost Price, Selling Price, Stock
          </Text>
          <Group justify="flex-end" gap={8} mt={16}>
            <Button variant="default" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button onClick={handleBulkPriceUpdate}>Update Prices</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
