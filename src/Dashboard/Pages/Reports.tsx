import { useState } from "react";
import {
  Card,
  Text,
  Group,
  Button,
  Grid,
  Flex,
  SegmentedControl,
  TextInput,
} from "@mantine/core";

import { IconDownload, IconShare } from "@tabler/icons-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

const salesData = [
  { date: "Jan 01", value: 45000 },
  { date: "Jan 02", value: 50000 },
  { date: "Jan 03", value: 38000 },
  { date: "Jan 04", value: 61000 },
  { date: "Jan 05", value: 47000 },
  { date: "Jan 06", value: 52000 },
  { date: "Jan 07", value: 42000 },
];

const profitData = [
  { date: "Jan 01", value: 12000 },
  { date: "Jan 02", value: 14000 },
  { date: "Jan 03", value: 9000 },
  { date: "Jan 04", value: 18000 },
  { date: "Jan 05", value: 11000 },
  { date: "Jan 06", value: 15000 },
  { date: "Jan 07", value: 10000 },
];

export default function Reports() {
  const [period, setPeriod] = useState("Daily");

  return (
    <div>
      <Text size="xl" fw={700} mb="xs">
        Reports
      </Text>
      <Text size="lg" fw={600} mb="sm">
        Reports & Analytics
      </Text>
      <Text size="sm" c="dimmed" mb="md">
        Comprehensive business insights and performance metrics
      </Text>

      {/* Top Controls */}
      <Group justify="space-between" mb="md">
        <Flex gap="sm" align="center" wrap="wrap">
          <TextInput type="date" label="Date Range" placeholder="Pick dates" />
          <SegmentedControl
            value={period}
            onChange={setPeriod}
            data={["Daily", "Weekly", "Monthly"]}
          />
        </Flex>
        <Group>
          <Button leftSection={<IconDownload size={16} />} variant="default">
            Export
          </Button>
          <Button leftSection={<IconShare size={16} />} color="blue">
            Share
          </Button>
        </Group>
      </Group>

      {/* Stats Cards */}
      <Grid mb="md">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder radius="md" p="md">
            <Text fw={600}>Total Sales</Text>
            <Text size="xl">₹341,000</Text>
            <Text size="sm" c="green">
              +12.5% from last period
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder radius="md" p="md">
            <Text fw={600}>Total Profit</Text>
            <Text size="xl">₹94,000</Text>
            <Text size="sm" c="green">
              +8.2% from last period
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder radius="md" p="md">
            <Text fw={600}>Total Orders</Text>
            <Text size="xl">194</Text>
            <Text size="sm" c="green">
              +15.3% from last period
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder radius="md" p="md">
            <Text fw={600}>Profit Margin</Text>
            <Text size="xl">27.6%</Text>
            <Text size="sm" c="green">
              +2.1% from last period
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Charts */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="md" p="md">
            <Text fw={600} mb="sm">
              Sales Trend
            </Text>
            <LineChart width={500} height={250} data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#7c3aed"
                strokeWidth={2}
              />
            </LineChart>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="md" p="md">
            <Text fw={600} mb="sm">
              Profit Analysis
            </Text>
            <BarChart width={500} height={250} data={profitData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </Card>
        </Grid.Col>
      </Grid>
    </div>
  );
}
