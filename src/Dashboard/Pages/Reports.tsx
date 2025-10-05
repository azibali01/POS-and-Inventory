import { useState } from "react";
import { useDataContext } from "../Context/DataContext";
import {
  Card,
  Group,
  Text,
  Badge,
  Button,
  Select,
  Tabs,
  Table,
  Modal,
  Stack,
  ActionIcon,
  Menu,
  Pagination,
} from "@mantine/core";
import {
  IconCurrencyDollar,
  IconShoppingCart,
  IconTrendingUp,
  IconMessage,
  IconMail,
  IconChartBar,
  IconEdit,
  IconTrash,
  IconDotsVertical,
  IconDownload,
  IconFileText,
  IconShare,
} from "@tabler/icons-react";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import { TextInput } from "@mantine/core";
// Type definitions
// Removed unused interfaces

// Use real data from context

export default function ReportsPage() {
  const { inventory, sales } = useDataContext();
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerPageSize, setLedgerPageSize] = useState(10);
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<string>("sales");
  const [fromDate, setFromDate] = useState<Date | null>(new Date(2024, 0, 1));
  const [toDate, setToDate] = useState<Date | null>(new Date(2024, 0, 15));
  const [reportPeriod, setReportPeriod] = useState<string>("daily");

  // Helper: filter by date range
  function isWithinRange(dateStr: string) {
    const date = dayjs(dateStr);
    return (
      (!fromDate || date.isSameOrAfter(dayjs(fromDate), "day")) &&
      (!toDate || date.isSameOrBefore(dayjs(toDate), "day"))
    );
  }

  // Transform sales data for charts
  const filteredSalesData = sales.filter((row) => isWithinRange(row.date));

  // Stock valuation from inventory
  // (Duplicate declaration removed)

  // Stock valuation from inventory
  const categoryTotals: { [cat: string]: { quantity: number; value: number } } =
    {};
  inventory.forEach((item) => {
    if (!categoryTotals[item.category]) {
      categoryTotals[item.category] = { quantity: 0, value: 0 };
    }
    categoryTotals[item.category].quantity += item.stock;
    categoryTotals[item.category].value += item.stock * item.costPrice;
  });
  const totalValue = Object.values(categoryTotals).reduce(
    (sum, cat) => sum + cat.value,
    0
  );
  const filteredStockValuation = Object.entries(categoryTotals).map(
    ([category, { quantity, value }]) => ({
      category,
      quantity,
      value,
      percentage: totalValue ? Math.round((value / totalValue) * 100) : 0,
    })
  );

  // Prepare category data for Products tab (PieChart)
  const pieColors = [
    "#6366f1",
    "#10b981",
    "#f59e42",
    "#ef4444",
    "#3b82f6",
    "#a855f7",
    "#f43f5e",
  ];
  const categoryData = filteredStockValuation.map((row, idx) => ({
    name: row.category,
    value: row.percentage,
    color: pieColors[idx % pieColors.length],
  }));

  // Invoice ledger from sales
  const filteredInvoiceData = sales
    .filter((row) => isWithinRange(row.date))
    .filter((row) => {
      if (!ledgerSearch.trim()) return true;
      const search = ledgerSearch.trim().toLowerCase();
      return (
        row.id.toLowerCase().includes(search) ||
        row.customer.toLowerCase().includes(search) ||
        row.status.toLowerCase().includes(search)
      );
    });
  const paginatedInvoiceData = filteredInvoiceData.slice(
    (ledgerPage - 1) * ledgerPageSize,
    ledgerPage * ledgerPageSize
  );
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Export PDF handler
  function handleExportPDF() {
    const doc = new jsPDF();
    doc.text("Report Export", 10, 10);
    doc.text("This is a sample PDF export for the report.", 10, 20);
    doc.save("report.pdf");
  }

  // Key metrics from sales
  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  // For profit, you may need to add profit field to SaleRecord or calculate from items
  const totalProfit = sales.reduce(
    (sum, s) =>
      sum + (s.items?.reduce((p, i) => p + i.price * i.quantity * 0.2, 0) || 0),
    0
  ); // Example: 20% margin
  const totalOrders = sales.length;
  const profitMargin = totalSales
    ? ((totalProfit / totalSales) * 100).toFixed(1)
    : "0";

  return (
    <Stack gap={24}>
      {/* Header */}
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="xl" fw={700}>
            Reports & Analytics
          </Text>
          <Text c="dimmed" size="md">
            Comprehensive business insights and performance metrics
          </Text>
        </div>
        <Group gap={8}>
          {/* Export button removed as requested */}
          <Button
            leftSection={<IconShare size={18} />}
            onClick={() => setIsShareModalOpen(true)}
          >
            Share
          </Button>
        </Group>
      </Group>

      {/* From Date & To Date & Period */}
      <Group gap={16} align="flex-end">
        <TextInput
          label="From Date"
          type="date"
          value={fromDate ? dayjs(fromDate).format("YYYY-MM-DD") : ""}
          onChange={(e) =>
            setFromDate(e.target.value ? new Date(e.target.value) : null)
          }
          style={{ minWidth: 180 }}
        />
        <TextInput
          label="To Date"
          type="date"
          value={toDate ? dayjs(toDate).format("YYYY-MM-DD") : ""}
          onChange={(e) =>
            setToDate(e.target.value ? new Date(e.target.value) : null)
          }
          style={{ minWidth: 180 }}
        />
        <Select
          label="Period"
          data={["daily", "weekly", "monthly", "yearly"]}
          value={reportPeriod}
          onChange={(value) => {
            if (value) setReportPeriod(value);
          }}
          style={{ minWidth: 120 }}
        />
        <Button
          variant="subtle"
          color="#5E78D9"
          style={{ minWidth: 80 }}
          onClick={() => {
            setFromDate(new Date(2024, 0, 1));
            setToDate(new Date(2024, 0, 15));
            setReportPeriod("daily");
          }}
        >
          Clear
        </Button>
      </Group>

      {/* Key Metrics */}
      <Group gap={16} grow>
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Group justify="space-between">
            <Text size="sm" fw={500}>
              Total Sales
            </Text>
            <IconCurrencyDollar size={18} color="#888" />
          </Group>
          <Text size="xl" fw={700}>
            {totalSales.toLocaleString()}
          </Text>
          <Text size="xs" c="green">
            +12.5% from last period
          </Text>
        </Card>
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Group justify="space-between">
            <Text size="sm" fw={500}>
              Total Profit
            </Text>
            <IconTrendingUp size={18} color="#888" />
          </Group>
          <Text size="xl" fw={700}>
            {totalProfit.toLocaleString()}
          </Text>
          <Text size="xs" c="green">
            +8.2% from last period
          </Text>
        </Card>
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Group justify="space-between">
            <Text size="sm" fw={500}>
              Total Orders
            </Text>
            <IconShoppingCart size={18} color="#888" />
          </Group>
          <Text size="xl" fw={700}>
            {totalOrders}
          </Text>
          <Text size="xs" c="green">
            +15.3% from last period
          </Text>
        </Card>
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Group justify="space-between">
            <Text size="sm" fw={500}>
              Profit Margin
            </Text>
            <IconChartBar size={18} color="#888" />
          </Group>
          <Text size="xl" fw={700}>
            {profitMargin}%
          </Text>
          <Text size="xs" c="green">
            +2.1% from last period
          </Text>
        </Card>
      </Group>

      {/* Tabs for Reports */}
      <Tabs
        value={selectedReport}
        onChange={(value) => {
          if (value) setSelectedReport(value);
        }}
        keepMounted
      >
        <Tabs.List grow>
          <Tabs.Tab value="sales">Sales</Tabs.Tab>
          <Tabs.Tab value="products">Products</Tabs.Tab>
          <Tabs.Tab value="inventory">Inventory</Tabs.Tab>
          <Tabs.Tab value="ledger">Ledger</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="sales">
          <Group align="flex-start" gap={24}>
            <Card shadow="sm" padding="md" radius="md" style={{ flex: 1 }}>
              <Text fw={600} mb={8}>
                Sales Trend
              </Text>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={filteredSalesData}
                  margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => dayjs(date).format("MMM DD")}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => `${value.toLocaleString()}`}
                    labelFormatter={(date) => dayjs(date).format("MMM DD")}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <Card shadow="sm" padding="md" radius="md" style={{ flex: 1 }}>
              <Text fw={600} mb={8}>
                Profit Analysis
              </Text>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={filteredSalesData}
                  margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => dayjs(date).format("MMM DD")}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => `${value.toLocaleString()}`}
                    labelFormatter={(date) => dayjs(date).format("MMM DD")}
                  />
                  <Bar dataKey="profit" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Group>
        </Tabs.Panel>
        <Tabs.Panel value="products">
          <Card shadow="sm" padding="md" radius="md">
            <Text fw={600} mb={8}>
              Sales by Category
            </Text>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={(props) => {
                    const name = props.name ?? "";
                    const value = props.value ?? 0;
                    return `${name}: ${value}%`;
                  }}
                  labelLine={true}
                >
                  {categoryData.map(
                    (entry: { color: string }, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    )
                  )}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Tabs.Panel>
        <Tabs.Panel value="inventory">
          <Card shadow="sm" padding="md" radius="md">
            <Text fw={600} mb={16}>
              Stock Valuation Report
            </Text>
            <Table highlightOnHover withTableBorder striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Category</Table.Th>
                  <Table.Th>Quantity</Table.Th>
                  <Table.Th>Value</Table.Th>
                  <Table.Th>Percentage</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredStockValuation.map((row) => (
                  <Table.Tr key={row.category}>
                    <Table.Td>{row.category}</Table.Td>
                    <Table.Td>{row.quantity} units</Table.Td>
                    <Table.Td>{row.value.toLocaleString()}</Table.Td>
                    <Table.Td>
                      <Group gap={8}>
                        <div
                          style={{
                            width: 60,
                            height: 8,
                            background: "#e5e7eb",
                            borderRadius: 4,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${row.percentage}%`,
                              height: "100%",
                              background: "#6366f1",
                              borderRadius: 4,
                            }}
                          />
                        </div>
                        <Text size="sm">{row.percentage}%</Text>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        </Tabs.Panel>
        <Tabs.Panel value="ledger">
          <Card shadow="sm" padding="md" radius="md">
            <Text fw={600} mb={16}>
              Invoice Ledger
            </Text>

            <Group mb={16} w={"100%"}>
              <TextInput
                placeholder="Search by Invoice ID, Customer, or Status"
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                w={"30%"}
              />
              <Button
                leftSection={<IconDownload size={16} />}
                color="#5E78D9"
                onClick={handleExportPDF}
              >
                Export
              </Button>
              <Group justify="flex-end">
                <Select
                  label={null}
                  placeholder="Rows per page"
                  data={["5", "10", "20"]}
                  value={ledgerPageSize.toString()}
                  onChange={(value) => {
                    setLedgerPageSize(Number(value));
                    setLedgerPage(1);
                  }}
                  style={{ width: 120 }}
                />
              </Group>
            </Group>

            <Table highlightOnHover withTableBorder striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Invoice ID</Table.Th>
                  <Table.Th>Customer</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginatedInvoiceData.map((row) => (
                  <Table.Tr key={row.id}>
                    <Table.Td>{row.id}</Table.Td>
                    <Table.Td>{row.customer}</Table.Td>
                    <Table.Td>
                      {dayjs(row.date).format("MMM DD, YYYY")}
                    </Table.Td>
                    <Table.Td>{row.total?.toLocaleString()}</Table.Td>
                    <Table.Td>
                      {row.status === "paid" && (
                        <Badge
                          color="blue"
                          variant="filled"
                          radius="sm"
                          style={{ textTransform: "lowercase" }}
                        >
                          paid
                        </Badge>
                      )}
                      {row.status === "pending" && (
                        <Badge
                          color="gray"
                          variant="filled"
                          radius="sm"
                          style={{ textTransform: "lowercase" }}
                        >
                          pending
                        </Badge>
                      )}
                      {row.status === "overdue" && (
                        <Badge
                          color="red"
                          variant="filled"
                          radius="sm"
                          style={{ textTransform: "lowercase" }}
                        >
                          overdue
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Menu shadow="md" width={160}>
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="#5E78D9">
                            <IconDotsVertical size={18} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item leftSection={<IconEdit size={16} />}>
                            Edit
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconTrash size={16} />}
                            color="red"
                          >
                            Delete
                          </Menu.Item>
                          <Menu.Item leftSection={<IconDownload size={16} />}>
                            Download PDF
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            <Group justify="center" mt={16}>
              <Pagination
                value={ledgerPage}
                onChange={setLedgerPage}
                total={Math.ceil(filteredInvoiceData.length / ledgerPageSize)}
                siblings={1}
                boundaries={1}
              />
            </Group>
          </Card>
        </Tabs.Panel>
        {/* Add closing Tabs tag here */}
      </Tabs>

      {/* Export Modal */}
      <Modal
        opened={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Report"
        centered
      >
        <Stack gap={12}>
          <Button
            leftSection={<IconFileText size={18} />}
            onClick={handleExportPDF}
          >
            Export as PDF
          </Button>
        </Stack>
      </Modal>
      {/* Share Modal */}
      <Modal
        opened={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Share Report"
        centered
      >
        <Stack gap={12}>
          <Button leftSection={<IconMessage size={18} />}>
            Share via WhatsApp
          </Button>
          <Button leftSection={<IconMail size={18} />}>Share via Email</Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
