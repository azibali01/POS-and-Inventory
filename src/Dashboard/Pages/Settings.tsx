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
  Notification,
  Group,
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

// Type definitions
interface BusinessType {
  businessName: string;
  address: string;
  city: string;
  province: string;
  pincode: string;
  phone: string;
  email: string;
  gstNumber: string;
  logo: string;
}

interface BusinessErrors {
  businessName?: string;
  address?: string;
  city?: string;
  province?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
}

interface UserErrors {
  name?: string;
  email?: string;
}

// Helper validation
function validateBusiness(business: BusinessType) {
  const errors: BusinessErrors = {};
  if (!business.businessName || !business.businessName.trim())
    errors.businessName = "Business name required";
  if (!business.address || !business.address.trim())
    errors.address = "Address required";
  if (!business.city || !business.city.trim()) errors.city = "City required";
  if (!business.province || !business.province.trim())
    errors.province = "Province required";
  if (!business.pincode || !business.pincode.trim())
    errors.pincode = "Pincode required";
  if (!business.phone || !/^\+?\d{10,15}$/.test(business.phone))
    errors.phone = "Valid phone required";
  if (!business.email || !/^\S+@\S+\.\S+$/.test(business.email))
    errors.email = "Valid email required";
  if (!business.gstNumber || !business.gstNumber.trim())
    errors.gstNumber = "GST number required";
  return errors;
}

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
  // Business Info State
  const [business, setBusiness] = useState(() => {
    const saved = localStorage.getItem("businessInfo");
    return saved ? JSON.parse(saved) : initialBusiness;
  });
  const [businessErrors, setBusinessErrors] = useState<BusinessErrors>({});
  const [showNotif, setShowNotif] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("business");

  // Backup/Restore State
  const [autoBackup, setAutoBackup] = useState(false);
  const [cloudBackup, setCloudBackup] = useState(false);
  const [localBackup, setLocalBackup] = useState(true);
  const [backupFreq, setBackupFreq] = useState("Daily");

  // Users State (placeholder)
  const [users, setUsers] = useState([
    { id: 1, name: "Admin", email: "admin@aluminiumpos.com", role: "Admin" },
    {
      id: 2,
      name: "Cashier",
      email: "cashier@aluminiumpos.com",
      role: "Cashier",
    },
  ]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Cashier",
  });
  const [userErrors, setUserErrors] = useState<UserErrors>({});

  // Business Info Handlers
  function handleBusinessSave() {
    const errors = validateBusiness(business);
    setBusinessErrors(errors);
    if (Object.keys(errors).length) {
      setShowNotif("Please fix errors before saving.");
      return;
    }
    localStorage.setItem("businessInfo", JSON.stringify(business));
    setShowNotif("Business info saved successfully.");
  }
  function handleBusinessReset() {
    setBusiness(initialBusiness);
    setBusinessErrors({});
    setShowNotif("Business info reset.");
  }

  // Backup/Restore Handlers
  function handleCreateBackup() {
    localStorage.setItem("backup", JSON.stringify({ business, users }));
    setShowNotif("Backup created successfully.");
  }
  function handleRestoreBackup() {
    const backup = localStorage.getItem("backup");
    if (backup) {
      const data = JSON.parse(backup);
      setBusiness(data.business || initialBusiness);
      setUsers(data.users || []);
      setShowNotif("Backup restored.");
    } else {
      setShowNotif("No backup found.");
    }
  }

  // User CRUD Handlers
  function handleAddUser() {
    const errors: UserErrors = {};
    if (!newUser.name.trim()) errors.name = "Name required";
    if (!newUser.email.trim() || !/^\S+@\S+\.\S+$/.test(newUser.email))
      errors.email = "Valid email required";
    setUserErrors(errors);
    if (Object.keys(errors).length) return;
    setUsers([...users, { ...newUser, id: Date.now() }]);
    setNewUser({ name: "", email: "", role: "Cashier" });
    setShowNotif("User added.");
  }
  function handleDeleteUser(id: number) {
    setUsers(users.filter((u) => u.id !== id));
    setShowNotif("User deleted.");
  }

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
      {showNotif && (
        <Notification color="indigo" onClose={() => setShowNotif(null)} mt="md">
          {showNotif}
        </Notification>
      )}
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
                  error={businessErrors.businessName}
                  required
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
                  error={businessErrors.gstNumber}
                  required
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label="Address"
                  value={business.address}
                  onChange={(e) =>
                    setBusiness({ ...business, address: e.currentTarget.value })
                  }
                  error={businessErrors.address}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="City"
                  value={business.city}
                  onChange={(e) =>
                    setBusiness({ ...business, city: e.currentTarget.value })
                  }
                  error={businessErrors.city}
                  required
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
                  error={businessErrors.province}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Pincode"
                  value={business.pincode}
                  onChange={(e) =>
                    setBusiness({ ...business, pincode: e.currentTarget.value })
                  }
                  error={businessErrors.pincode}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Phone"
                  value={business.phone}
                  onChange={(e) =>
                    setBusiness({ ...business, phone: e.currentTarget.value })
                  }
                  error={businessErrors.phone}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Email"
                  value={business.email}
                  onChange={(e) =>
                    setBusiness({ ...business, email: e.currentTarget.value })
                  }
                  error={businessErrors.email}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <FileInput label="Business Logo" placeholder="Upload logo" />
              </Grid.Col>
            </Grid>
            <Group mt="md" gap={12}>
              <Button color="indigo" onClick={handleBusinessSave}>
                Save
              </Button>
              <Button variant="default" onClick={handleBusinessReset}>
                Reset
              </Button>
            </Group>
          </Card>
        </Tabs.Panel>
        <Tabs.Panel value="tax">
          <Card withBorder p="lg">
            <Title order={5} mb="md">
              Tax Settings
            </Title>
            <Text c="dimmed">
              Configure GST, VAT, and other tax rates (coming soon).
            </Text>
          </Card>
        </Tabs.Panel>
        <Tabs.Panel value="print">
          <Card withBorder p="lg">
            <Title order={5} mb="md">
              Print Settings
            </Title>
            <Text c="dimmed">
              Configure print templates and options (coming soon).
            </Text>
          </Card>
        </Tabs.Panel>
        <Tabs.Panel value="alerts">
          <Card withBorder p="lg">
            <Title order={5} mb="md">
              Alerts Settings
            </Title>
            <Text c="dimmed">
              Configure low stock, expiry, and other alerts (coming soon).
            </Text>
          </Card>
        </Tabs.Panel>
        <Tabs.Panel value="users">
          <Card withBorder p="lg">
            <Title order={5} mb="md">
              Users Management
            </Title>
            <Grid gutter="md">
              <Grid.Col span={4}>
                <TextInput
                  label="Name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.currentTarget.value })
                  }
                  error={userErrors?.name}
                  required
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label="Email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.currentTarget.value })
                  }
                  error={userErrors?.email}
                  required
                />
              </Grid.Col>
              <Grid.Col span={3}>
                <Select
                  label="Role"
                  data={["Admin", "Cashier", "Manager"]}
                  value={newUser.role}
                  onChange={(role) => role && setNewUser({ ...newUser, role })}
                />
              </Grid.Col>
              <Grid.Col span={1}>
                <Button color="indigo" mt={24} onClick={handleAddUser}>
                  Add
                </Button>
              </Grid.Col>
            </Grid>
            <Stack mt="md" gap={8}>
              {users.map((u) => (
                <Card key={u.id} shadow="xs" radius="md" withBorder>
                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>{u.name}</Text>
                      <Text size="sm" c="dimmed">
                        {u.email} &mdash; {u.role}
                      </Text>
                    </div>
                    <Button
                      color="red"
                      variant="subtle"
                      onClick={() => handleDeleteUser(u.id)}
                    >
                      Delete
                    </Button>
                  </Group>
                </Card>
              ))}
            </Stack>
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
                  <Switch
                    label="Enable Auto Backup"
                    color="indigo"
                    checked={autoBackup}
                    onChange={(e) => setAutoBackup(e.currentTarget.checked)}
                  />
                  <Switch
                    label="Cloud Backup"
                    color="indigo"
                    checked={cloudBackup}
                    onChange={(e) => setCloudBackup(e.currentTarget.checked)}
                  />
                  <Switch
                    label="Local Backup"
                    color="indigo"
                    checked={localBackup}
                    onChange={(e) => setLocalBackup(e.currentTarget.checked)}
                  />
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 32 }}>
                  <Button
                    leftSection={<IconDownload size={18} />}
                    color="indigo"
                    onClick={handleCreateBackup}
                  >
                    Create Backup
                  </Button>
                  <Button
                    leftSection={<IconUpload size={18} />}
                    variant="default"
                    onClick={handleRestoreBackup}
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
                    value={backupFreq}
                    onChange={(v) => v && setBackupFreq(v)}
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
