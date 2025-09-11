import {
  Card,
  Group,
  Text,
  Title,
  Badge,
  SimpleGrid,
  Box,
} from "@mantine/core";
import {
  IconShoppingCart,
  IconPackage,
  IconChartBar,
  IconCalendarWeek,
  IconCalendar,
} from "@tabler/icons-react";

type Stat = {
  title: string;
  value: string;
  description: string;
  // icon removed
  trend: string;
};

const stats: Stat[] = [
  {
    title: "Total Sales",
    value: "2,45,680",
    description: "Today",
    trend: "+12.5%",
  },
  {
    title: "Inventory Items",
    value: "1,247",
    description: "Active products",
    trend: "+3.2%",
  },
  {
    title: "Monthly Revenue",
    value: "8,45,230",
    description: "This month",
    trend: "+15.3%",
  },
  {
    title: "Weekly Revenue",
    value: "1,95,000",
    description: "This week",
    trend: "+7.8%",
  },
  {
    title: "Daily Revenue",
    value: "28,500",
    description: "Today",
    trend: "+2.1%",
  },
];

export default function Dashboard() {
  return (
    <div>
      <Box mb="lg">
        <Title order={1}>Welcome to Aluminium POS</Title>
        <Text c="dimmed" size="md">
          Manage your aluminium business with our comprehensive POS and
          inventory system.
        </Text>
      </Box>

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
            <Text size="xs" c="blue" fw={500} mt={4}>
              {stat.trend} from last period
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={4}>Recent Sales</Title>
          <Text c="dimmed" size="sm" mb="md">
            Latest transactions from today
          </Text>
          <Box>
            {[
              {
                customer: "ABC Construction",
                amount: "12,450",
                time: "2 hours ago",
              },
              {
                customer: "XYZ Builders",
                amount: "8,750",
                time: "4 hours ago",
              },
              {
                customer: "PQR Industries",
                amount: "15,200",
                time: "6 hours ago",
              },
            ].map((sale, index) => (
              <Group key={index} justify="space-between" mb="sm">
                <Box>
                  <Text fw={500}>{sale.customer}</Text>
                  <Text size="xs" c="dimmed">
                    {sale.time}
                  </Text>
                </Box>
                <Text fw={600}>{sale.amount}</Text>
              </Group>
            ))}
          </Box>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={4}>Low Stock Alert</Title>
          <Text c="dimmed" size="sm" mb="md">
            Items running low in inventory
          </Text>
          <Box>
            {[
              { item: "Aluminium Sheet 4mm", stock: "12 units", status: "Low" },
              {
                item: "Aluminium Pipe 2 inch",
                stock: "8 units",
                status: "Critical",
              },
              {
                item: "Aluminium Angle 25mm",
                stock: "15 units",
                status: "Low",
              },
            ].map((item, index) => (
              <Group key={index} justify="space-between" mb="sm">
                <Box>
                  <Text fw={500}>{item.item}</Text>
                  <Text size="xs" c="dimmed">
                    {item.stock}
                  </Text>
                </Box>
                <Badge
                  color={item.status === "Critical" ? "yellow" : "red"}
                  variant={item.status === "Critical" ? "filled" : "filled"}
                  size="sm"
                >
                  {item.status}
                </Badge>
              </Group>
            ))}
          </Box>
        </Card>
      </SimpleGrid>
    </div>
  );
}
