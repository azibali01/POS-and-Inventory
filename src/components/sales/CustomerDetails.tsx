import { Card, Text, Group, Badge, Divider } from "@mantine/core";

import type { Customer } from "../../Dashboard/Context/DataContext";

function formatCurrency(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 0 });
}

function formatDate(date?: string) {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return date;
  }
}

export function CustomerDetails({ customer }: { customer: Customer }) {
  return (
    <Card>
      <Card.Section p="md">
        <Group justify="space-between">
          <div>
            <Text size="xs" c="dimmed">
              Code
            </Text>
            <Text style={{ fontFamily: "monospace" }}>
              {customer.customerCode}
            </Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Name
            </Text>
            <Text fw={700}>{customer.name}</Text>
          </div>
        </Group>
      </Card.Section>

      <Card.Section p="md">
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <Text size="xs" c="dimmed">
              Phone
            </Text>
            <Text>{customer.phone}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Email
            </Text>
            <Text>{customer.email}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Address
            </Text>
            <Text>{customer.address}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              City
            </Text>
            <Text>{customer.city}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              GST
            </Text>
            <Text size="xs">{customer.gstNumber}</Text>
          </div>
          <Divider />
          <div>
            <Text size="xs" c="dimmed">
              Credit Limit
            </Text>
            <Text>{formatCurrency(customer.creditLimit || 0)}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Balance
            </Text>
            <Text fw={700}>{formatCurrency(customer.currentBalance || 0)}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Status
            </Text>
            <Badge color={customer.isActive ? "green" : "gray"}>
              {customer.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Created
            </Text>
            <Text>{formatDate(customer.createdAt)}</Text>
          </div>
        </div>
      </Card.Section>
    </Card>
  );
}
