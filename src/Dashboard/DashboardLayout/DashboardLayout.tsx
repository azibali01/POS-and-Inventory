import { type ReactNode } from "react";
import { AppShell, Group, Button, Stack, NavLink, Title } from "@mantine/core";
import {
  IconLogout,
  IconChartBar,
  IconLayoutDashboard,
  IconShoppingCart,
  IconBox,
  IconSettings,
  IconFileText,
  IconDatabase,
} from "@tabler/icons-react";
import { Link, Outlet, useLocation } from "react-router-dom";

type MenuItem = {
  label: string;
  icon: ReactNode;
  path: string;
};

const menuItems: (
  | MenuItem
  | {
      label: string;
      icon: ReactNode;
      children: MenuItem[];
    }
)[] = [
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
    label: "GRN",
    icon: <IconFileText size={18} />,
    path: "/dashboard/grn",
  },
  {
    label: "Invoices",
    icon: <IconFileText size={18} />,
    children: [
      {
        label: "Sales Invoice",
        icon: <IconFileText size={16} />,
        path: "/dashboard/invoices/sales",
      },
      {
        label: "Purchase Invoice",
        icon: <IconFileText size={16} />,
        path: "/dashboard/invoices/purchase",
      },
      {
        label: "Sales Return",
        icon: <IconFileText size={16} />,
        path: "/dashboard/invoices/sales-return",
      },
      {
        label: "Purchase Return",
        icon: <IconFileText size={16} />,
        path: "/dashboard/invoices/purchase-return",
      },
    ],
  },
  {
    label: "Ledger",
    icon: <IconDatabase size={18} />,
    path: "/dashboard/ledger",
  },
  {
    label: "Cash Book",
    icon: <IconFileText size={18} />,
    path: "/dashboard/cashbook",
  },
  {
    label: "Reports",
    icon: <IconChartBar size={18} />,
    path: "/dashboard/reports",
  },
  {
    label: "Settings",
    icon: <IconSettings size={18} />,
    path: "/dashboard/settings",
  },
];

export default function DashboardLayout() {
  const location = useLocation();

  // Print mode detection: use location.state from POS page
  const isPrintMode = location.state && location.state.printMode;

  if (isPrintMode) {
    // Only render print-area content (Outlet)
    return <Outlet />;
  }

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
      {!isPrintMode && (
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
      )}

      {/* 🔹 Sidebar */}
      {!isPrintMode && (
        <AppShell.Navbar p="md" bg="#F5F5F5" style={{ color: "#000000ff" }}>
          <Stack gap="xs">
            {menuItems.map((item) => {
              if ("children" in item) {
                return (
                  <NavLink
                    key={item.label}
                    label={item.label}
                    leftSection={item.icon}
                    children={item.children.map((child) => (
                      <NavLink
                        key={child.label}
                        component={Link}
                        to={child.path}
                        label={child.label}
                        leftSection={child.icon}
                        active={location.pathname === child.path}
                        styles={{
                          root: {
                            color: "#000000ff",
                            borderRadius: "8px",
                            marginLeft: 16,
                            fontWeight: 500,
                            fontSize: "13px",
                            "&:hover": { backgroundColor: "#333" },
                            "&[data-active]": {
                              backgroundColor: "#333",
                              color: "#fff",
                              fontWeight: 800,
                            },
                          },
                          label: { fontSize: "13px", fontWeight: 500 },
                        }}
                      />
                    ))}
                    styles={{
                      root: {
                        color: "#000000ff",
                        borderRadius: "8px",
                        fontWeight: 600,
                        fontSize: "14px",
                        marginBottom: 2,
                      },
                      label: { fontSize: "14px", fontWeight: 600 },
                    }}
                  />
                );
              }
              return (
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
              );
            })}
          </Stack>
        </AppShell.Navbar>
      )}

      {/* 🔹 Main Content */}
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
