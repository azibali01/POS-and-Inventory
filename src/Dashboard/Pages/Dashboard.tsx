import { useMemo } from "react";
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
  IconCalendar,
  IconPlus,
  IconDownload,
} from "@tabler/icons-react";
import { useDataContext } from "../Context/DataContext";
import dayjs from "dayjs";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import { Alert } from "@mantine/core";

function formatCurrency(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 0 });
}

// formatDate helper removed (not used) — using dayjs directly where needed

export default function Dashboard() {
  const { inventory, sales, purchases } = useDataContext();

  const totalSales = useMemo(
    () => sales.reduce((s, it) => s + (it.total || 0), 0),
    [sales]
  );
  const inventoryCount = inventory.length;

  const today = dayjs().format("YYYY-MM-DD");
  const todaySales = sales.filter((s) => s.date === today);
  const todayRevenue = todaySales.reduce((sum, s) => sum + (s.total || 0), 0);

  const monthlyRevenue = useMemo(() => {
    const byMonth: Record<string, number> = {};
    sales.forEach((s) => {
      const m = dayjs(s.date).format("MMM YYYY");
      byMonth[m] = (byMonth[m] || 0) + (s.total || 0);
    });
    // return last 7 months
    const months = Array.from({ length: 7 }).map((_, i) =>
      dayjs()
        .subtract(6 - i, "month")
        .format("MMM YYYY")
    );
    return months.map((m) => ({
      month: m,
      amount: Math.round(byMonth[m] || 0),
    }));
  }, [sales]);

  const monthlyPurchases = useMemo(() => {
    const byMonth: Record<string, number> = {};
    (purchases || []).forEach((p) => {
      const m = dayjs(p.date).format("MMM YYYY");
      byMonth[m] = (byMonth[m] || 0) + (p.total || 0);
    });
    const months = Array.from({ length: 7 }).map((_, i) =>
      dayjs()
        .subtract(6 - i, "month")
        .format("MMM YYYY")
    );
    return months.map((m) => ({
      month: m,
      amount: Math.round(byMonth[m] || 0),
    }));
  }, [purchases]);

  const monthlyProfit = useMemo(() => {
    return monthlyRevenue.map((r, idx) => ({
      month: r.month,
      amount: r.amount - (monthlyPurchases[idx]?.amount || 0),
    }));
  }, [monthlyRevenue, monthlyPurchases]);

  const recentSales = [...sales]
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
    .slice(0, 5);
  const recentPurchases = [...(purchases || [])]
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
    .slice(0, 5);
  const lowStock = inventory.filter((item) => item.stock <= 15);
  const negativeStock = inventory.filter((item) => item.stock < 0);

  const stats = [
    {
      title: "Total Sales",
      value: formatCurrency(totalSales),
      icon: <IconShoppingCart size={20} color="#868e96" />,
    },
    {
      title: "Inventory Items",
      value: inventoryCount.toString(),
      icon: <IconPackage size={20} color="#868e96" />,
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(monthlyRevenue.reduce((s, m) => s + m.amount, 0)),
      icon: <IconChartBar size={20} color="#868e96" />,
    },
    {
      title: "Today's Revenue",
      value: formatCurrency(todayRevenue),
      icon: <IconCalendar size={20} color="#868e96" />,
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

      <SimpleGrid cols={{ base: 1, md: 3, lg: 4 }} spacing="lg" mb="xl">
        {stats.map((stat) => (
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
              {stat.icon}
            </Group>
            <Text size="xl" fw={700}>
              {stat.value}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {/* Alerts */}
        <div>
          <Alert title="Low Stock Alert" color="red" mb="md">
            {lowStock.length} items are running low on stock.
          </Alert>
          <Alert title="Negative Stock Alert" color="red">
            {negativeStock.length} items have negative stock balance.
          </Alert>
        </div>
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
                  <Text fw={600}>{(sale.total || 0).toLocaleString()}</Text>
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

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mt="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={4}>Monthly Sales Trend</Title>
          <Text c="dimmed" size="sm" mb="md">
            Last 7 months sales performance
          </Text>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#5E78D9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={4}>Monthly Purchases</Title>
          <Text c="dimmed" size="sm" mb="md">
            Purchase trends over last 7 months
          </Text>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyPurchases}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#4caf50" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </SimpleGrid>

      <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
        <Title order={4}>Monthly Sales Trend</Title>
        <Text c="dimmed" size="sm" mb="md">
          Profit / Loss over last 7 months
        </Text>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyProfit}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#ff9800"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Purchases + Negative Stock */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mt="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={4}>Recent Purchases</Title>
          <Text c="dimmed" size="sm" mb="md">
            Latest purchase transactions
          </Text>
          <Box>
            {recentPurchases.length === 0 ? (
              <Text c="dimmed">No purchases yet.</Text>
            ) : (
              recentPurchases.map((purch, index) => (
                <Group key={index} justify="space-between" mb="sm">
                  <Box>
                    <Text fw={500}>{purch.supplier}</Text>
                    <Text size="xs" c="dimmed">
                      {dayjs(purch.date).format("MMM DD, YYYY")}
                    </Text>
                  </Box>
                  <Text fw={600}>{(purch.total || 0).toLocaleString()}</Text>
                </Group>
              ))
            )}
          </Box>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={4}>Negative Stock Items</Title>
          <Text c="dimmed" size="sm" mb="md">
            Items with minus stock balance
          </Text>
          <Box>
            {negativeStock.length === 0 ? (
              <Text c="dimmed">No negative stock items.</Text>
            ) : (
              negativeStock.map((item, index) => (
                <Group key={index} justify="space-between" mb="sm">
                  <Box>
                    <Text fw={500}>{item.name}</Text>
                    <Text size="xs" c="dimmed">
                      {item.code}
                    </Text>
                  </Box>
                  <Badge variant="filled" color="red">
                    {item.stock}
                  </Badge>
                </Group>
              ))
            )}
          </Box>
        </Card>
      </SimpleGrid>
    </div>
  );
}
