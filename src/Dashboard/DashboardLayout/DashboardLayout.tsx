import { type ReactNode } from "react";
import { AppShell, Group, Button, Stack, NavLink, Title } from "@mantine/core";
import {
  IconLogout,
  IconChartBar,
  IconLayoutDashboard,
  IconShoppingCart,
  IconBox,
  IconSettings,
} from "@tabler/icons-react";
import { Link, Outlet, useLocation } from "react-router-dom";

type MenuItem = {
  label: string;
  icon: ReactNode;
  path: string;
};

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    icon: <IconLayoutDashboard size={18} />,
    path: "/dashboard/dashboard",
  },
  {
    label: "POS",
    icon: <IconShoppingCart size={18} />,
    path: "/dashboard/pos",
  },
  {
    label: "Inventory",
    icon: <IconBox size={18} />,
    path: "/dashboard/inventory",
  },
  {
    label: "Reports",
    icon: <IconChartBar size={18} />,
    path: "/dashboard/reports",
  },
  //   {
  //     label: "Customers",
  //     icon: <IconUsers size={18} />,
  //     path: "/dashboard/customers",
  //   },
  // {
  //   label: "Suppliers",
  //   icon: <IconTruck size={18} />,
  //   path: "/dashboard/customers",
  // },

  // {
  //   label: "Data",
  //   icon: <IconDatabase size={18} />,
  //   path: "/dashboard/tax",
  // },
  {
    label: "Settings",
    icon: <IconSettings size={18} />,
    path: "/dashboard/settings",
  },
];

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 240,
        breakpoint: "sm",
        collapsed: { mobile: false },
      }}
      padding="md"
      styles={{
        main: { backgroundColor: "#ffffffff" },
      }}
    >
      {/* 🔹 Header */}
      <AppShell.Header>
        <Group
          h="100%"
          px="md"
          justify="space-between"
          bg="#FFFFFF"
          style={{ borderBottom: "1px solid #eee" }}
        >
          <Title order={2} ml={5}>
            Haq Aluminum
          </Title>
          <Button
            size="xs"
            color="#5E78D9"
            rightSection={<IconLogout size={14} color="#fff" />}
          >
            Logout
          </Button>
        </Group>
      </AppShell.Header>

      {/* 🔹 Sidebar */}
      <AppShell.Navbar p="md" bg="#F5F5F5" style={{ color: "#000000ff" }}>
        <Stack gap="xs">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              component={Link}
              to={item.path}
              label={item.label}
              leftSection={item.icon}
              active={location.pathname === item.path}
              styles={{
                root: {
                  color: "#000000ff",
                  borderRadius: "8px",
                  "&:hover": { backgroundColor: "#333" },
                  "&[data-active]": {
                    backgroundColor: "#333",
                    color: "#fff",
                    fontWeight: 800,
                  },
                },
                label: { fontSize: "14px", fontWeight: 600 },
              }}
            />
          ))}
        </Stack>
      </AppShell.Navbar>

      {/* 🔹 Main Content */}
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
