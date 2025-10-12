"use client";

import { useMemo } from "react";
import {
  Title,
  Text,
  Table,
  Divider,
  ScrollArea,
  Grid,
  Card,
} from "@mantine/core";
import { useDataContext } from "../../Context/DataContext";
import type {
  SaleRecord,
  PurchaseRecord,
  Expense,
} from "../../Context/DataContext";
import { formatCurrency, formatDate } from "../../../lib/format-utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function ProfitLoss() {
  const { sales = [], purchases = [], expenses = [] } = useDataContext();
  // simple aggregations ignoring tax/COGS details
  const totals = useMemo(() => {
    const sTotal = sales.reduce(
      (acc: number, r: SaleRecord) => acc + (r.total || 0),
      0
    );
    const pTotal = purchases.reduce(
      (acc: number, r: PurchaseRecord) => acc + (r.total || 0),
      0
    );
    const eTotal = expenses.reduce(
      (acc: number, r: Expense) => acc + (r.amount || 0),
      0
    );
    const grossProfit = sTotal - pTotal;
    const netProfit = grossProfit - eTotal;
    return { sTotal, pTotal, eTotal, grossProfit, netProfit };
  }, [sales, purchases, expenses]);

  // monthly aggregates for chart (group by YYYY-MM)
  const monthly = useMemo(() => {
    const map = new Map<
      string,
      { month: string; sales: number; purchases: number }
    >();
    const add = (key: string, type: "sales" | "purchases", amt: number) => {
      const cur = map.get(key) || { month: key, sales: 0, purchases: 0 };
      cur[type] = (cur[type] || 0) + amt;
      map.set(key, cur);
    };
    sales.forEach((s: SaleRecord) => {
      const d = new Date(s.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      add(key, "sales", s.total || 0);
    });
    purchases.forEach((p: PurchaseRecord) => {
      const d = new Date(p.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      add(key, "purchases", p.total || 0);
    });
    // sort by month
    return Array.from(map.values()).sort((a, b) =>
      a.month > b.month ? 1 : -1
    );
  }, [sales, purchases]);

  // expenses by category for pie chart
  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((ex: Expense) => {
      const k = ex.category || "Other";
      map.set(k, (map.get(k) || 0) + (ex.amount || 0));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div>
          <Title order={3}>Profit & Loss</Title>
          <Text size="sm" color="dimmed">
            Breakdown by source (table views)
          </Text>
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <Text style={{ fontWeight: 600 }}>Summary</Text>
        <Table verticalSpacing="sm" mt="xs">
          <tbody>
            <tr>
              <td>Sales</td>
              <td style={{ textAlign: "right" }}>
                {formatCurrency(totals.sTotal)}
              </td>
            </tr>
            <tr>
              <td>Purchases</td>
              <td style={{ textAlign: "right" }}>
                {formatCurrency(totals.pTotal)}
              </td>
            </tr>
            <tr>
              <td>Gross Profit (Sales - Purchases)</td>
              <td style={{ textAlign: "right" }}>
                {formatCurrency(totals.grossProfit)}
              </td>
            </tr>
            <tr>
              <td>Expenses</td>
              <td style={{ textAlign: "right" }}>
                {formatCurrency(totals.eTotal)}
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 700 }}>Net Profit</td>
              <td style={{ textAlign: "right", fontWeight: 700 }}>
                {formatCurrency(totals.netProfit)}
              </td>
            </tr>
          </tbody>
        </Table>
      </div>

      <Divider my="sm" />

      <div style={{ marginTop: 12 }}>
        <Text style={{ fontWeight: 600, marginBottom: 8 }}>Trends</Text>
        <Grid gutter="md">
          <Grid.Col span={8}>
            <Card withBorder padding="sm">
              <Text size="sm" color="dimmed" style={{ marginBottom: 8 }}>
                Monthly Sales vs Purchases
              </Text>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="sales" fill="#2b8aef" />
                    <Bar dataKey="purchases" fill="#f03e3e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Grid.Col>

          <Grid.Col span={4}>
            <Card withBorder padding="sm">
              <Text size="sm" color="dimmed" style={{ marginBottom: 8 }}>
                Expenses by Category
              </Text>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      label
                    />
                    {expenseByCategory.map((_, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={
                          ["#4dabf7", "#f783ac", "#ffd43b", "#69db7c"][i % 4]
                        }
                      />
                    ))}
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Grid.Col>
        </Grid>
      </div>

      <div style={{ marginTop: 12 }}>
        <Text style={{ fontWeight: 600, marginBottom: 8 }}>Sales (latest)</Text>
        <ScrollArea style={{ maxHeight: 240 }}>
          <Table highlightOnHover verticalSpacing="sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th style={{ textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s: SaleRecord) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{formatDate(s.date)}</td>
                  <td>{s.customer}</td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(s.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ScrollArea>
      </div>

      <Divider my="sm" />

      <div style={{ marginTop: 12 }}>
        <Text style={{ fontWeight: 600, marginBottom: 8 }}>
          Purchases (latest)
        </Text>
        <ScrollArea style={{ maxHeight: 240 }}>
          <Table highlightOnHover verticalSpacing="sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Supplier</th>
                <th style={{ textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p: PurchaseRecord) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{formatDate(p.date)}</td>
                  <td>{p.supplier}</td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(p.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ScrollArea>
      </div>

      <Divider my="sm" />

      <div style={{ marginTop: 12 }}>
        <Text style={{ fontWeight: 600, marginBottom: 8 }}>
          Expenses (latest)
        </Text>
        <ScrollArea style={{ maxHeight: 240 }}>
          <Table highlightOnHover verticalSpacing="sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((ex: Expense) => (
                <tr key={ex.id}>
                  <td>{ex.expenseNumber || ex.id}</td>
                  <td>{formatDate(ex.expenseDate as string)}</td>
                  <td>{ex.category}</td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(ex.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
