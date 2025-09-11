import { useState } from "react";
import {
  Card,
  Title,
  TextInput,
  Textarea,
  Tabs,
  FileInput,
  Grid,
  Button,
  Select,
  Switch,
  Text,
  Stack,
} from "@mantine/core";
import {
  IconUsers,
  IconDatabase,
  IconBell,
  IconPrinter,
  IconBuilding,
  IconCalculator,
  IconDownload,
  IconUpload,
} from "@tabler/icons-react";

const initialBusiness = {
  businessName: "Haq Aluminium POS System",
  address: "123 Industrial Area, Sector 15",
  city: "Multan",
  province: "Punjab",
  pincode: "122001",
  phone: "+92 312 7305432",
  email: "info@aluminiumpos.com",
  gstNumber: "06AABCU9603R1ZM",
  logo: "",
};

export default function SettingsPage() {
  const [business, setBusiness] = useState(initialBusiness);
  const [activeTab, setActiveTab] = useState("business");

  return (
    <div>
      <Stack gap={0}>
        <Title order={2} mb="md">
          Settings & Data Management
        </Title>
        <Text c="dimmed" mb="md">
          Configure your system and manage data backups.
        </Text>
      </Stack>

      <Tabs
        value={activeTab}
        onChange={(value) => value && setActiveTab(value)}
      >
        <Tabs.List grow mb="lg">
          <Tabs.Tab value="business" leftSection={<IconBuilding size={18} />}>
            Business
          </Tabs.Tab>
          <Tabs.Tab value="tax" leftSection={<IconCalculator size={18} />}>
            Tax
          </Tabs.Tab>
          <Tabs.Tab value="print" leftSection={<IconPrinter size={18} />}>
            Print
          </Tabs.Tab>
          <Tabs.Tab value="alerts" leftSection={<IconBell size={18} />}>
            Alerts
          </Tabs.Tab>
          <Tabs.Tab value="users" leftSection={<IconUsers size={18} />}>
            Users
          </Tabs.Tab>
          <Tabs.Tab value="data" leftSection={<IconDatabase size={18} />}>
            Data
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="business">
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Title order={5} mb="md">
              Business Information
            </Title>
            <Grid gutter="md">
              <Grid.Col span={6}>
                <TextInput
                  label="Business Name"
                  value={business.businessName}
                  onChange={(e) =>
                    setBusiness({
                      ...business,
                      businessName: e.currentTarget.value,
                    })
                  }
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="GST Number"
                  value={business.gstNumber}
                  onChange={(e) =>
                    setBusiness({
                      ...business,
                      gstNumber: e.currentTarget.value,
                    })
                  }
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label="Address"
                  value={business.address}
                  onChange={(e) =>
                    setBusiness({
                      ...business,
                      address: e.currentTarget.value,
                    })
                  }
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="City"
                  value={business.city}
                  onChange={(e) =>
                    setBusiness({
                      ...business,
                      city: e.currentTarget.value,
                    })
                  }
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Province"
                  value={business.province}
                  onChange={(e) =>
                    setBusiness({
                      ...business,
                      province: e.currentTarget.value,
                    })
                  }
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Pincode"
                  value={business.pincode}
                  onChange={(e) =>
                    setBusiness({
                      ...business,
                      pincode: e.currentTarget.value,
                    })
                  }
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Phone"
                  value={business.phone}
                  onChange={(e) =>
                    setBusiness({
                      ...business,
                      phone: e.currentTarget.value,
                    })
                  }
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Email"
                  value={business.email}
                  onChange={(e) =>
                    setBusiness({
                      ...business,
                      email: e.currentTarget.value,
                    })
                  }
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <FileInput label="Business Logo" placeholder="Upload logo" />
              </Grid.Col>
            </Grid>
          </Card>
        </Tabs.Panel>
        <Tabs.Panel value="tax">
          <Card withBorder p="lg">
            Tax Settings Coming Soon
          </Card>
        </Tabs.Panel>
        <Tabs.Panel value="print">
          <Card withBorder p="lg">
            Print Settings Coming Soon
          </Card>
        </Tabs.Panel>
        <Tabs.Panel value="alerts">
          <Card withBorder p="lg">
            Alerts Settings Coming Soon
          </Card>
        </Tabs.Panel>
        <Tabs.Panel value="users">
          <Card withBorder p="lg">
            Users Management Coming Soon
          </Card>
        </Tabs.Panel>
        <Tabs.Panel value="data">
          <Card
            shadow="sm"
            radius="md"
            p="lg"
            style={{ background: "#f8f8f8" }}
          >
            <div style={{ display: "flex", gap: 32 }}>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <div style={{ marginRight: 8 }}>
                    <IconDatabase size={24} />
                  </div>
                  <Title order={4}>Backup Configuration</Title>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <Switch label="Enable Auto Backup" color="indigo" />
                  <Switch label="Cloud Backup" color="indigo" />
                  <Switch label="Local Backup" color="indigo" />
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 32 }}>
                  <Button
                    leftSection={<IconDownload size={18} />}
                    color="indigo"
                  >
                    Create Backup
                  </Button>
                  <Button
                    leftSection={<IconUpload size={18} />}
                    variant="default"
                  >
                    Restore Backup
                  </Button>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <Select
                    label="Backup Frequency"
                    data={["Daily", "Weekly", "Monthly"]}
                    defaultValue="Daily"
                  />
                </div>
              </div>
            </div>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
