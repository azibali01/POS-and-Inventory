import {
  Card,
  Group,
  Text,
  Title,
  Badge,
  SimpleGrid,
  Box,
  Button,
} from "@mantine/core";
import {
  IconShoppingCart,
  IconPackage,
  IconChartBar,
  IconCalendarWeek,
  IconCalendar,
  IconPlus,
  IconDownload,
} from "@tabler/icons-react";
import { useDataContext } from "../Context/DataContext";
import dayjs from "dayjs";
export default function Dashboard() {
  const { inventory, sales } = useDataContext();

  // Stats calculations
  const totalSales = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const inventoryCount = inventory.length;
  const today = dayjs().format("YYYY-MM-DD");
  const todaySales = sales.filter((s) => s.date === today);
  const todayRevenue = todaySales.reduce((sum, s) => sum + (s.total || 0), 0);
  const monthlySales = sales.filter((s) =>
    dayjs(s.date).isSame(dayjs(), "month")
  );
  const monthlyRevenue = monthlySales.reduce(
    (sum, s) => sum + (s.total || 0),
    0
  );
  const weeklySales = sales.filter((s) =>
    dayjs(s.date).isSame(dayjs(), "week")
  );
  const weeklyRevenue = weeklySales.reduce((sum, s) => sum + (s.total || 0), 0);

  // Recent sales (last 5)
  const recentSales = [...sales]
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
    .slice(0, 5);

  // Low stock alerts
  const lowStock = inventory.filter((item) => item.stock <= 15);

  // Stats array for cards
  const stats = [
    {
      title: "Total Sales",
      value: totalSales.toLocaleString(),
      description: "All time",
      trend: "",
    },
    {
      title: "Inventory Items",
      value: inventoryCount.toLocaleString(),
      description: "Active products",
      trend: "",
    },
    {
      title: "Monthly Revenue",
      value: monthlyRevenue.toLocaleString(),
      description: "This month",
      trend: "",
    },
    {
      title: "Weekly Revenue",
      value: weeklyRevenue.toLocaleString(),
      description: "This week",
      trend: "",
    },
    {
      title: "Today's Revenue",
      value: todayRevenue.toLocaleString(),
      description: "Today",
      trend: "",
    },
  ];

  return (
    <div>
      <Box mb="lg">
        <Title order={1}>Welcome to Aluminium POS</Title>
        <Text c="dimmed" size="md">
          Manage your aluminium business with our comprehensive POS and
          inventory system.
        </Text>
      </Box>

      {/* Quick Actions */}
      <Group mb="xl" gap={16}>
        <Button
          leftSection={<IconPlus size={18} />}
          color="indigo"
          variant="filled"
        >
          Add Sale
        </Button>
        <Button
          leftSection={<IconPlus size={18} />}
          color="teal"
          variant="filled"
        >
          Add Inventory
        </Button>
        <Button
          leftSection={<IconDownload size={18} />}
          color="gray"
          variant="outline"
        >
          Export Data
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 3, lg: 5 }} spacing="lg" mb="xl">
        {stats.map((stat, idx) => (
          <Card
            key={stat.title}
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
          >
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>
                {stat.title}
              </Text>
              {idx === 0 && <IconShoppingCart size={20} color="#868e96" />}
              {idx === 1 && <IconPackage size={20} color="#868e96" />}
              {idx === 2 && <IconChartBar size={20} color="#868e96" />}
              {idx === 3 && <IconCalendarWeek size={20} color="#868e96" />}
              {idx === 4 && <IconCalendar size={20} color="#868e96" />}
            </Group>
            <Text size="xl" fw={700}>
              {stat.value}
            </Text>
            <Text size="xs" c="dimmed">
              {stat.description}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={4}>Recent Sales</Title>
          <Text c="dimmed" size="sm" mb="md">
            Latest transactions
          </Text>
          <Box>
            {recentSales.length === 0 ? (
              <Text c="dimmed">No sales yet.</Text>
            ) : (
              recentSales.map((sale, index) => (
                <Group key={index} justify="space-between" mb="sm">
                  <Box>
                    <Text fw={500}>{sale.customer}</Text>
                    <Text size="xs" c="dimmed">
                      {dayjs(sale.date).format("MMM DD, YYYY")}
                    </Text>
                  </Box>
                  <Text fw={600}>{sale.total?.toLocaleString()}</Text>
                </Group>
              ))
            )}
          </Box>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={4}>Low Stock Alert</Title>
          <Text c="dimmed" size="sm" mb="md">
            Items running low in inventory
          </Text>
          <Box>
            {lowStock.length === 0 ? (
              <Text c="dimmed">No low stock items.</Text>
            ) : (
              lowStock.map((item, index) => (
                <Group key={index} justify="space-between" mb="sm">
                  <Box>
                    <Text fw={500}>{item.name}</Text>
                    <Text size="xs" c="dimmed">
                      {item.stock} units
                    </Text>
                  </Box>
                  <Badge
                    color={item.stock <= 8 ? "yellow" : "red"}
                    variant="filled"
                    size="sm"
                  >
                    {item.stock <= 8 ? "Critical" : "Low"}
                  </Badge>
                </Group>
              ))
            )}
          </Box>
        </Card>
      </SimpleGrid>

      {/* Analytics placeholder (add charts here if needed) */}
      {/* <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
          <Title order={4}>Sales Analytics</Title>
          <Text c="dimmed" size="sm" mb="md">Charts and trends coming soon.</Text>
        </Card> */}
    </div>
  );
}
