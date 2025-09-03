import { Card, Grid, Group, Text, Title, Badge, Stack } from "@mantine/core";
import {
  IconShoppingCart,
  IconPackage,
  IconChartBar,
} from "@tabler/icons-react";

export default function Dashboard() {
  return (
    <Stack>
      {/* Page Title */}
      <div>
        <Title order={2}>Welcome to Aluminium POS</Title>
        <Text size="sm" c="dimmed">
          Manage your aluminium business with our comprehensive POS and
          inventory system.
        </Text>
      </div>

      {/* Stats Cards */}
      <Grid>
        <Grid.Col span={{ base: 12, sm: 8, md: 4 }}>
          <Card shadow="sm" radius="md" withBorder bg={"#F5F5F5"}>
            <Group justify="space-between">
              <Text fw={500}>Total Sales</Text>
              <IconShoppingCart size={18} />
            </Group>
            <Title order={3} mt={10}>
              2,45,680
            </Title>
            <Text size="sm" c="dimmed">
              Today
            </Text>
            <Text size="sm" c="#5E78D9">
              +12.5% from last period
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 8, md: 4 }}>
          <Card shadow="sm" radius="md" withBorder bg={"#F5F5F5"}>
            <Group justify="space-between">
              <Text fw={500}>Inventory Items</Text>
              <IconPackage size={18} />
            </Group>
            <Title order={3} mt={10}>
              1,247
            </Title>
            <Text size="sm" c="dimmed">
              Active products
            </Text>
            <Text size="xs" c="#5E78D9">
              +3.2% from last period
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 8, md: 4 }}>
          <Card shadow="sm" radius="md" withBorder bg={"#F5F5F5"}>
            <Group justify="space-between">
              <Text fw={500}>Monthly Revenue</Text>
              <IconChartBar size={18} />
            </Group>
            <Title order={3} mt={10}>
              8,45,230
            </Title>
            <Text size="sm" c="dimmed">
              This month
            </Text>
            <Text size="xs" c="#5E78D9">
              +15.3% from last period
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Bottom Cards */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" radius="md" withBorder bg={"#F5F5F5"}>
            <Text fw={700}>Recent Sales</Text>
            <Text size="sm" c="dimmed">
              Latest transactions from today
            </Text>

            <Group justify="space-between" mt="sm">
              <Text fw={600}>ABC Construction</Text>
              <Text fw={500}>12,450</Text>
            </Group>
            <Text size="xs" c="dimmed">
              2 hours ago
            </Text>

            <Group justify="space-between" mt="sm">
              <Text fw={600}>XYZ Builders</Text>
              <Text fw={500}>8,750</Text>
            </Group>
            <Text size="xs" c="dimmed">
              4 hours ago
            </Text>

            <Group justify="space-between" mt="sm">
              <Text fw={600}>PQR Industries</Text>
              <Text fw={500}>15,200</Text>
            </Group>
            <Text size="xs" c="dimmed">
              6 hours ago
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" radius="md" withBorder bg={"#F5F5F5"}>
            <Text fw={700}>Low Stock Alert</Text>
            <Text size="sm" c="dimmed">
              Items running low in inventory
            </Text>

            <Group justify="space-between" mt="sm">
              <Stack gap={0}>
                <Text fw={600}>Aluminium Sheet 4mm</Text>
                <Text c={"dimmed"}>12 units</Text>
              </Stack>
              <Badge color="yellow">Low</Badge>
            </Group>

            <Group justify="space-between" mt="sm">
              <Stack gap={0}>
                <Text fw={600}>Aluminium Pipe 2 inch</Text>
                <Text c={"dimmed"}>8 units</Text>
              </Stack>
              <Badge color="red">Critical</Badge>
            </Group>

            <Group justify="space-between" mt="sm">
              <Stack gap={0}>
                <Text fw={600}>Aluminium Angle 25mm</Text>
                <Text c={"dimmed"}>15 units</Text>
              </Stack>

              <Badge color="yellow">Low</Badge>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
