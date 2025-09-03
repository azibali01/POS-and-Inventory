import React from "react";
import {
  Title,
  Text,
  Tabs,
  Card,
  TextInput,
  Group,
  Button,
  FileInput,
  Grid,
  Badge,
} from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons-react";

export default function Settings() {
  return (
    <div>
      {/* Page Header */}
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>Settings & Data Management</Title>
          <Text color="dimmed" size="sm">
            Configure your system and manage data
          </Text>
        </div>
        <Group>
          <Badge color="green" variant="light">
            ● Online
          </Badge>
          <Button leftSection={<IconDeviceFloppy size={16} />}>
            Save All Settings
          </Button>
        </Group>
      </Group>

      {/* Tabs */}
      <Tabs defaultValue="business">
        <Tabs.List>
          <Tabs.Tab value="business">Business</Tabs.Tab>
          <Tabs.Tab value="tax">Tax</Tabs.Tab>
          <Tabs.Tab value="print">Print</Tabs.Tab>
          <Tabs.Tab value="alerts">Alerts</Tabs.Tab>
          <Tabs.Tab value="users">Users</Tabs.Tab>
          <Tabs.Tab value="data">Data</Tabs.Tab>
        </Tabs.List>

        {/* Business Tab */}
        <Tabs.Panel value="business" pt="md">
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Title order={5} mb="md">
              Business Information
            </Title>

            <Grid gutter="md">
              <Grid.Col span={6}>
                <TextInput
                  label="Business Name"
                  placeholder="Aluminium POS System"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="GST Number" placeholder="06AABCU9603R1ZM" />
              </Grid.Col>

              <Grid.Col span={12}>
                <TextInput
                  label="Address"
                  placeholder="123 Industrial Area, Sector 15"
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <TextInput label="City" placeholder="Gurgaon" />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="State" placeholder="Haryana" />
              </Grid.Col>

              <Grid.Col span={6}>
                <TextInput label="Pincode" placeholder="122001" />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Phone" placeholder="+91 98765 43210" />
              </Grid.Col>

              <Grid.Col span={6}>
                <TextInput label="Email" placeholder="info@aluminiupos.com" />
              </Grid.Col>
              <Grid.Col span={6}>
                <FileInput label="Business Logo" placeholder="Upload logo" />
              </Grid.Col>
            </Grid>
          </Card>
        </Tabs.Panel>

        {/* Other Tabs Placeholder */}
        <Tabs.Panel value="tax" pt="md">
          <Card withBorder p="lg">
            Tax Settings Coming Soon
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="print" pt="md">
          <Card withBorder p="lg">
            Print Settings Coming Soon
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="alerts" pt="md">
          <Card withBorder p="lg">
            Alerts Settings Coming Soon
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="users" pt="md">
          <Card withBorder p="lg">
            Users Management Coming Soon
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="data" pt="md">
          <Card withBorder p="lg">
            Data Management Coming Soon
          </Card>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
