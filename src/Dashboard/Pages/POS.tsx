// src/pages/POS.tsx
import {
  Card,
  Group,
  Text,
  TextInput,
  SimpleGrid,
  Badge,
  Button,
  Textarea,
  Select,
  NumberInput,
  Divider,
  Stack,
  ScrollArea,
} from "@mantine/core";
import {
  IconSearch,
  IconShoppingCart,
  IconFileInvoice,
} from "@tabler/icons-react";

export default function POS() {
  return (
    <div>
      <Text fw={700} fz="xl" mb="md">
        POS
      </Text>

      <SimpleGrid cols={2} spacing="md">
        {/* Left Side: Product Search + Product List */}
        <ScrollArea
          h={750}
          type="auto"
          scrollbarSize={12}
          scrollHideDelay={1500}
        >
          <Card withBorder radius="md" p="md" bg={"#F5F5F5"}>
            <Group mb="sm">
              <IconSearch size={18} />
              <Text fw={500}>Product Search</Text>
            </Group>
            <TextInput
              placeholder="Search products by name or code..."
              mb="md"
            />

            <SimpleGrid cols={2} spacing="md">
              <Card withBorder radius="md" p="md">
                <Text fw={600}>Aluminium Sheet 4mm</Text>
                <Text c="dimmed" fz="sm">
                  Code: AS4
                </Text>
                <Text fw={600} mt="sm">
                  450/sq ft
                </Text>
                <Text fz="sm" c="dimmed">
                  Stock: 120
                </Text>
                <Group justify="space-between" mt="sm">
                  <Badge color="gray">Sheets</Badge>
                  <Button size="xs" color="#5E78D9">
                    +
                  </Button>
                </Group>
              </Card>

              <Card withBorder radius="md" p="md">
                <Text fw={600}>Aluminium Pipe 2 inch</Text>
                <Text c="dimmed" fz="sm">
                  Code: AP2
                </Text>
                <Text fw={600} mt="sm">
                  280/ft
                </Text>
                <Text fz="sm" c="dimmed">
                  Stock: 85
                </Text>
                <Group justify="space-between" mt="sm">
                  <Badge color="gray">Pipes</Badge>
                  <Button size="xs" color="#5E78D9">
                    +
                  </Button>
                </Group>
              </Card>

              <Card withBorder radius="md" p="md">
                <Text fw={600}>Aluminium Angle 25mm</Text>
                <Text c="dimmed" fz="sm">
                  Code: AA25
                </Text>
                <Text fw={600} mt="sm">
                  180/ft
                </Text>
                <Text fz="sm" c="dimmed">
                  Stock: 200
                </Text>
                <Group justify="space-between" mt="sm">
                  <Badge color="gray">Angles</Badge>
                  <Button size="xs" color="#5E78D9">
                    +
                  </Button>
                </Group>
              </Card>

              <Card withBorder radius="md" p="md">
                <Text fw={600}>Aluminium Channel 50mm</Text>
                <Text c="dimmed" fz="sm">
                  Code: AC50
                </Text>
                <Text fw={600} mt="sm">
                  320/ft
                </Text>
                <Text fz="sm" c="dimmed">
                  Stock: 150
                </Text>
                <Group justify="space-between" mt="sm">
                  <Badge color="gray">Channels</Badge>
                  <Button size="xs" color="#5E78D9">
                    +
                  </Button>
                </Group>
              </Card>
              <Card withBorder radius="md" p="md">
                <Text fw={600}>Aluminium Channel 50mm</Text>
                <Text c="dimmed" fz="sm">
                  Code: AC50
                </Text>
                <Text fw={600} mt="sm">
                  320/ft
                </Text>
                <Text fz="sm" c="dimmed">
                  Stock: 150
                </Text>
                <Group justify="space-between" mt="sm">
                  <Badge color="gray">Channels</Badge>
                  <Button size="xs" color="#5E78D9">
                    +
                  </Button>
                </Group>
              </Card>
              <Card withBorder radius="md" p="md">
                <Text fw={600}>Aluminium Channel 50mm</Text>
                <Text c="dimmed" fz="sm">
                  Code: AC50
                </Text>
                <Text fw={600} mt="sm">
                  320/ft
                </Text>
                <Text fz="sm" c="dimmed">
                  Stock: 150
                </Text>
                <Group justify="space-between" mt="sm">
                  <Badge color="gray">Channels</Badge>
                  <Button size="xs" color="#5E78D9">
                    +
                  </Button>
                </Group>
              </Card>
              <Card withBorder radius="md" p="md">
                <Text fw={600}>Aluminium Channel 50mm</Text>
                <Text c="dimmed" fz="sm">
                  Code: AC50
                </Text>
                <Text fw={600} mt="sm">
                  320/ft
                </Text>
                <Text fz="sm" c="dimmed">
                  Stock: 150
                </Text>
                <Group justify="space-between" mt="sm">
                  <Badge color="gray">Channels</Badge>
                  <Button size="xs" color="#5E78D9">
                    +
                  </Button>
                </Group>
              </Card>
              <Card withBorder radius="md" p="md">
                <Text fw={600}>Aluminium Channel 50mm</Text>
                <Text c="dimmed" fz="sm">
                  Code: AC50
                </Text>
                <Text fw={600} mt="sm">
                  320/ft
                </Text>
                <Text fz="sm" c="dimmed">
                  Stock: 150
                </Text>
                <Group justify="space-between" mt="sm">
                  <Badge color="gray">Channels</Badge>
                  <Button size="xs" color="#5E78D9">
                    +
                  </Button>
                </Group>
              </Card>
            </SimpleGrid>
          </Card>
        </ScrollArea>
        {/* Right Side: Cart + Billing */}
        <Stack gap="md">
          {/* Cart */}
          <Card withBorder radius="md" p="md">
            <Group mb="sm">
              <IconShoppingCart size={18} />
              <Text fw={500}>Cart (0 items)</Text>
            </Group>
            <Text c="dimmed">Cart is empty</Text>
          </Card>

          {/* Billing */}
          <Card withBorder radius="md" p="md" bg={"#F5F5F5"}>
            <Group mb="sm">
              <IconFileInvoice size={18} />
              <Text fw={500}>Billing Details</Text>
            </Group>

            <Select
              label="Customer"
              placeholder="Select customer"
              data={["ABC Construction", "XYZ Builders", "PQR Industries"]}
              mb="sm"
            />

            <Group grow mb="sm">
              <NumberInput label="Discount (%)" value={0} min={0} max={100} />
              <NumberInput label="Tax (%)" value={18} min={0} max={100} />
            </Group>

            <NumberInput label="Delivery Charges" value={0} mb="sm" />
            <Textarea label="Notes" placeholder="Additional notes..." mb="md" />

            <Divider mb="sm" />

            <Stack gap={4}>
              <Text fz="sm">Subtotal: 0.00</Text>
              <Text fz="sm">Discount (0%): -0.00</Text>
              <Text fz="sm">Delivery: 0.00</Text>
              <Text fz="sm">Tax (18%): 0.00</Text>
              <Text fw={600}>Total: 0.00</Text>
            </Stack>

            <Group justify="space-between" mt="md">
              <Button variant="default">Gate Pass</Button>
              <Button color="#5E78D9">Payment</Button>
            </Group>
          </Card>
        </Stack>
      </SimpleGrid>
    </div>
  );
}
