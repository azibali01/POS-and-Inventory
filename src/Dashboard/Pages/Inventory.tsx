import { useState } from "react";
import {
  Card,
  Text,
  Group,
  Button,
  Badge,
  Table,
  TextInput,
  Select,
  Grid,
  Flex,
  Modal,
  NumberInput,
  Textarea,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconPlus,
  IconUpload,
  IconDownload,
  IconTrash,
  IconBox,
  IconAlertTriangle,
  IconGraph,
} from "@tabler/icons-react";

interface Item {
  id: string;
  name: string;
  code: string;
  sku: string;
  category: string;
  supplier: string;
  stock: number;
  unit: string;
  cost: number;
  price: number;
  status: "active" | "inactive";
}

const data: Item[] = [
  {
    id: "1",
    name: "Aluminium Sheet 4mm",
    code: "AS4",
    sku: "ALU-SHT-4MM-001",
    category: "Sheets",
    supplier: "Metro Metals",
    stock: 120,
    unit: "sq ft",
    cost: 380,
    price: 450,
    status: "active",
  },
  {
    id: "2",
    name: "Aluminium Pipe 2 inch",
    code: "AP2",
    sku: "ALU-PIP-2IN-001",
    category: "Pipes",
    supplier: "Steel World",
    stock: 85,
    unit: "ft",
    cost: 240,
    price: 280,
    status: "active",
  },
  {
    id: "3",
    name: "Aluminium Angle 25mm",
    code: "AA25",
    sku: "ALU-ANG-25MM-001",
    category: "Angles",
    supplier: "Prime Aluminium",
    stock: 15,
    unit: "ft",
    cost: 150,
    price: 180,
    status: "active",
  },
];

export default function Inventory() {
  const [items] = useState<Item[]>(data);

  const [opened, { open, close }] = useDisclosure(false);

  const rows = items.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>
        <Text fw={500}>{item.name}</Text>
        <Text size="xs" c="dimmed">
          {item.code} | {item.sku}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge color="gray">{item.category}</Badge>
      </Table.Td>
      <Table.Td>{item.supplier}</Table.Td>
      <Table.Td>
        <Text c={item.stock < 20 ? "orange" : "green"}>
          {item.stock} {item.unit}
        </Text>
      </Table.Td>
      <Table.Td>₹{item.cost}</Table.Td>
      <Table.Td>₹{item.price}</Table.Td>
      <Table.Td>
        <Badge color={item.status === "active" ? "#5E78D9" : "red"}>
          {item.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Button variant="subtle" size="xs">
          ...
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <div>
      <Text size="xl" fw={700} mb="md">
        Inventory
      </Text>

      {/* Top Stats */}
      <Grid mb="md">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card shadow="sm" p="md" radius="md" withBorder>
            <Group justify="space-between">
              <Text fw={600}>Total Items</Text>
              <IconBox size={20} />
            </Group>
            <Text size="xl" mt={10}>
              3
            </Text>
            <Text size="sm" c="dimmed">
              Active products
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card shadow="sm" p="md" radius="md" withBorder>
            <Group justify="space-between">
              <Text fw={600}>Low Stock</Text>

              <IconAlertTriangle size={20} color="#D79C2F" />
            </Group>
            <Text size="xl" c="#D79C2F" mt={10}>
              1
            </Text>
            <Text size="sm" c="dimmed">
              Items below minimum
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card shadow="sm" p="md" radius="md" withBorder>
            <Group justify="space-between">
              <Text fw={600}>Out of Stock</Text>
              <IconTrash color="red" size={20} />
            </Group>
            <Text size="xl" c="red" mt={10}>
              0
            </Text>
            <Text size="sm" c="dimmed">
              Zero stock items
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card shadow="sm" p="md" radius="md" withBorder>
            <Group justify="space-between">
              <Text fw={600}>Total Value</Text>
              <IconGraph color="green" size={20} />
            </Group>
            <Text size="xl" mt={10}>
              68,250
            </Text>
            <Text size="sm" c="dimmed">
              Inventory value
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Controls */}
      <Card withBorder bg={"#F5F5F5"} p={20}>
        <Group justify="space-between" mb="md" mt={10}>
          <Text fw={700}>Inventory Management</Text>
          <Group>
            <Button
              leftSection={<IconPlus size={16} />}
              color="#5E78D9"
              onClick={open}
            >
              Add Item
            </Button>
            <Button leftSection={<IconUpload size={16} />} variant="default">
              Bulk Update
            </Button>
            <Button leftSection={<IconDownload size={16} />} variant="default">
              Export
            </Button>
            <Button leftSection={<IconTrash size={16} />} color="red">
              Zero Out
            </Button>
          </Group>
        </Group>

        <Flex gap="sm" mb="md" mt={15}>
          <TextInput
            placeholder="Search items by name, code, or SKU..."
            flex={1}
          />
          <Select
            data={["All Categories", "Sheets", "Pipes", "Angles"]}
            defaultValue="All Categories"
          />
          <Select
            data={["All Status", "active", "inactive"]}
            defaultValue="All Status"
          />
        </Flex>

        {/* Table */}
        <Card withBorder shadow="xs" radius="md">
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Item Details</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Supplier</Table.Th>
                <Table.Th>Stock</Table.Th>
                <Table.Th>Cost Price</Table.Th>
                <Table.Th>Selling Price</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Card>
      </Card>

      {/* Add Item Modal */}
      <Modal opened={opened} onClose={close} title="Add New Item" size="lg">
        <Text size="sm" c="dimmed" mb="sm">
          Add a new item to your inventory
        </Text>
        <Grid>
          <Grid.Col span={6}>
            <TextInput label="Item Name" placeholder="Item Name" />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="Code" placeholder="Code" />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput label="SKU" placeholder="SKU" />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Category"
              data={["Sheets", "Pipes", "Angles"]}
              placeholder="Select category"
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <Select
              label="Supplier"
              data={["Metro Metals", "Steel World", "Prime Aluminium"]}
              placeholder="Select supplier"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Unit"
              data={["sq ft", "ft", "kg", "pcs"]}
              placeholder="Select unit"
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <NumberInput label="Weight (kg)" defaultValue={0} />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput label="Location" placeholder="Location" />
          </Grid.Col>

          <Grid.Col span={6}>
            <NumberInput label="Cost Price" defaultValue={0} />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput label="Selling Price" defaultValue={0} />
          </Grid.Col>

          <Grid.Col span={6}>
            <NumberInput label="Current Stock" defaultValue={0} />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput label="Minimum Stock" defaultValue={0} />
          </Grid.Col>

          <Grid.Col span={6}>
            <NumberInput label="Maximum Stock" defaultValue={0} />
          </Grid.Col>
          <Grid.Col span={12}>
            <Textarea
              label="Description"
              placeholder="Description"
              autosize
              minRows={2}
            />
          </Grid.Col>
        </Grid>

        <Group mt="md" justify="flex-end">
          <Button variant="default" onClick={close}>
            Cancel
          </Button>
          <Button color="#5E78D9">Add Item</Button>
        </Group>
      </Modal>
    </div>
  );
}
