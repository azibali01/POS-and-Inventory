import React, { useMemo } from "react";
import { Card, Group, Text, Title, SimpleGrid, Box } from "@mantine/core";
import {
  IconShoppingCart,
  IconPackage,
  IconChartBar,
  IconCalendar,
  IconUsers,
  IconFileInvoice,
  IconReportAnalytics,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useDataContext, type SaleRecord } from "../Context/DataContext";
import { formatCurrency } from "../../lib/format-utils";
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

export default function Dashboard() {
  const {
    inventory = [],
    sales,
    purchases = [],
    customers = [],
    categories = [],
    expenses = [],
    grns = [],
  } = useDataContext();

  const salesArray: SaleRecord[] = useMemo(() => {
    if (Array.isArray(sales)) return sales as SaleRecord[];
    const maybe = sales as unknown as { data?: unknown } | undefined;
    if (maybe && Array.isArray(maybe.data)) return maybe.data as SaleRecord[];
    return [];
  }, [sales]);

  const totalSales = useMemo(
    () => salesArray.reduce((s, it) => s + (it.total || 0), 0),
    [salesArray]
  );
  const inventoryCount = inventory.length;

  const todayRevenue = useMemo(() => {
    return salesArray
      .filter((s) => dayjs(s.date).isSame(dayjs(), "day"))
      .reduce((sum, s) => sum + (s.total || 0), 0);
  }, [salesArray]);

  const monthlyRevenue = useMemo(() => {
    const byMonth: Record<string, number> = {};
    salesArray.forEach((s) => {
      const m = dayjs(s.date).format("MMM YYYY");
      byMonth[m] = (byMonth[m] || 0) + (s.total || 0);
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
  }, [salesArray]);

  const monthlyPurchases = useMemo(() => {
    const byMonth: Record<string, number> = {};
    purchases.forEach((p) => {
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

  const monthlyProfit = useMemo(
    () =>
      monthlyRevenue.map((r, idx) => ({
        month: r.month,
        amount: r.amount - (monthlyPurchases[idx]?.amount || 0),
      })),
    [monthlyRevenue, monthlyPurchases]
  );

  const purchasesTotal = useMemo(
    () => purchases.reduce((s, p) => s + (p.total || 0), 0),
    [purchases]
  );
  const customersCount = customers.length;
  const categoriesCount = categories.length;
  const expensesTotal = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const grnCount = grns.length;

  const lowStock = inventory.filter((i) => (i.stock ?? 0) <= 15);

  const stats = [
    {
      title: "Total Sales",
      value: formatCurrency(totalSales),
      icon: <IconShoppingCart size={20} color="#868e96" />,
    },
    {
      title: "Inventory Items",
      value: String(inventoryCount),
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

  type CardDef = {
    label: string;
    path: string;
    icon: React.ReactNode;
    meta?: string;
  };

  const quickLinks: CardDef[] = [
    {
      label: "Products",
      path: "/products",
      icon: <IconPackage size={18} />,
      meta: `${inventoryCount} items`,
    },
    {
      label: "Categories",
      path: "/products/categories",
      icon: <IconReportAnalytics size={18} />,
      meta: `${categoriesCount} categories`,
    },
    {
      label: "Stock Report",
      path: "/products/stock-report",
      icon: <IconChartBar size={18} />,
      meta: `${lowStock.length} low`,
    },
    {
      label: "Customers",
      path: "/sales/customers",
      icon: <IconUsers size={18} />,
      meta: `${customersCount} customers`,
    },
    {
      label: "Sales Invoices",
      path: "/sales/invoices",
      icon: <IconFileInvoice size={18} />,
      meta: `${salesArray.length} · ${formatCurrency(totalSales)}`,
    },
    {
      label: "GRN",
      path: "/purchase/grn",
      icon: <IconFileInvoice size={18} />,
      meta: `${grnCount} GRNs`,
    },
    {
      label: "Purchase Invoices",
      path: "/purchase/invoices",
      icon: <IconFileInvoice size={18} />,
      meta: `${purchases.length} · ${formatCurrency(purchasesTotal)}`,
    },
    {
      label: "Expenses",
      path: "/expenses",
      icon: <IconReportAnalytics size={18} />,
      meta: `${expenses.length} · ${formatCurrency(expensesTotal)}`,
    },
  ];

  return (
    <div>
      <Box mb="lg">
        <Title order={1}>Welcome to Aluminium POS</Title>
        <Text c="dimmed" size="md">
          Manage your aluminium business with our POS and inventory system.
        </Text>
      </Box>

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

      <Box mb="lg">
        <Title order={3} mb="sm">
          Quick Links
        </Title>
        <SimpleGrid cols={{ base: 1, md: 3, lg: 4 }} spacing="md">
          {quickLinks.map((p) => (
            <Card
              key={p.path}
              component={Link}
              to={p.path}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{ cursor: "pointer", textDecoration: "none" }}
            >
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={600}>
                  {p.label}
                </Text>
                {p.icon}
              </Group>
              {p.meta ? (
                <Text size="lg" fw={700} mb="xs">
                  {p.meta}
                </Text>
              ) : (
                <Text size="sm" c="dimmed">
                  Open {p.label}
                </Text>
              )}
            </Card>
          ))}
        </SimpleGrid>
      </Box>

      {/* Low stock/negative stock alerts and Recent Sales removed per user request */}

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
        <Title order={4}>Profit / Loss</Title>
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
    </div>
  );
}
