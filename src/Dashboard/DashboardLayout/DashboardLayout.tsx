import { type ReactNode } from "react";
import {
  AppShell,
  Stack,
  NavLink,
  TextInput,
  ActionIcon,
  UnstyledButton,
  Group,
} from "@mantine/core";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ShoppingBag,
  Receipt,
  Wallet,
  Settings,
  FileBarChart,
  Bell,
  Search,
  User,
} from "lucide-react";

type MenuItem = {
  label: string;
  icon: ReactNode;
  path?: string;
  children?: MenuItem[];
};

// Navigation converted from the provided Next.js snippet into a structure
const navigation: MenuItem[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={16} />,
    path: "/dashboard",
  },
  {
    label: "Products",
    icon: <Package size={16} />,
    children: [
      {
        label: "Product Master",
        icon: <Package size={14} />,
        path: "/products",
      },
      {
        label: "Categories",
        icon: <Package size={14} />,
        path: "/products/categories",
      },
      {
        label: "Stock Report",
        icon: <FileBarChart size={14} />,
        path: "/products/stock-report",
      },
    ],
  },
  {
    label: "Sales",
    icon: <ShoppingCart size={16} />,
    children: [
      {
        label: "Customers",
        icon: <ShoppingCart size={14} />,
        path: "/sales/customers",
      },
      {
        label: "Quotations",
        icon: <ShoppingCart size={14} />,
        path: "/sales/quotations",
      },
      {
        label: "Sales Invoice",
        icon: <Receipt size={14} />,
        path: "/sales/invoices",
      },
      {
        label: "Sale Returns",
        icon: <Receipt size={14} />,
        path: "/sales/returns",
      },
    ],
  },
  {
    label: "Purchase",
    icon: <ShoppingBag size={16} />,
    children: [
      {
        label: "Suppliers",
        icon: <ShoppingBag size={14} />,
        path: "/purchase/suppliers",
      },
      {
        label: "Purchase Order",
        icon: <ShoppingBag size={14} />,
        path: "/purchase/orders",
      },
      {
        label: "GRN",
        icon: <Receipt size={14} />,
        path: "/purchase/grn",
      },
      {
        label: "Purchase Invoice",
        icon: <Receipt size={14} />,
        path: "/purchase/invoices",
      },
      {
        label: "Purchase Returns",
        icon: <Receipt size={14} />,
        path: "/purchase/returns",
      },
    ],
  },
  {
    label: "Expenses",
    icon: <Receipt size={16} />,
    path: "/expenses",
  },
  {
    label: "Accounts",
    icon: <Wallet size={16} />,
    children: [
      {
        label: "Chart of Accounts",
        icon: <Wallet size={14} />,
        path: "/accounts/chart-of-accounts",
      },
      {
        label: "Receipt Voucher",
        icon: <Wallet size={14} />,
        path: "/accounts/receipts",
      },
      {
        label: "Payment Voucher",
        icon: <Wallet size={14} />,
        path: "/accounts/payments",
      },
      {
        label: "Journal Voucher",
        icon: <Wallet size={14} />,
        path: "/accounts/journal",
      },
    ],
  },
  {
    label: "Reports",
    icon: <FileBarChart size={16} />,
    children: [
      {
        label: "Sales Report",
        icon: <FileBarChart size={14} />,
        path: "/reports/sales",
      },
      {
        label: "Purchase Report",
        icon: <FileBarChart size={14} />,
        path: "/reports/purchase",
      },
      {
        label: "Profit & Loss",
        icon: <FileBarChart size={14} />,
        path: "/reports/profit-loss",
      },
      {
        label: "Stock Summary",
        icon: <FileBarChart size={14} />,
        path: "/reports/stock",
      },
      {
        label: "Customer Ledger",
        icon: <FileBarChart size={14} />,
        path: "/reports/customer-ledger",
      },
      {
        label: "Supplier Ledger",
        icon: <FileBarChart size={14} />,
        path: "/reports/supplier-ledger",
      },
    ],
  },
];

export default function DashboardLayout() {
  const location = useLocation();

  // Print mode detection: use location.state from POS page
  const isPrintMode = !!(location.state as { printMode?: boolean } | undefined)
    ?.printMode;

  if (isPrintMode) {
    // Only render print-area content (Outlet)
    return <Outlet />;
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 260,
        breakpoint: "sm",
        collapsed: { mobile: false },
      }}
      padding="md"
      styles={{
        main: { backgroundColor: "#ffffffff" },
      }}
    >
      {/* Header */}
      {!isPrintMode && (
        <AppShell.Header>
          <div
            style={{
              height: "100%",
              borderBottom: "1px solid #eee",
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              background: "#FFFFFF",
            }}
          >
            <AppHeader />
          </div>
        </AppShell.Header>
      )}

      {/* Sidebar */}
      {!isPrintMode && (
        <AppShell.Navbar p="md" bg="#F5F5F5" style={{ color: "#000000ff" }}>
          <Stack gap="xs">
            {navigation.map((item) => {
              if (item.children && item.children.length > 0) {
                return (
                  <NavLink
                    key={item.label}
                    label={item.label}
                    leftSection={item.icon}
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
                  >
                    {item.children.map((child) => (
                      <NavLink
                        key={child.label}
                        component={Link}
                        to={child.path || "#"}
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
                  </NavLink>
                );
              }

              return (
                <NavLink
                  key={item.label}
                  component={Link}
                  to={item.path || "#"}
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

          {/* Footer (settings) */}
          <div
            style={{
              marginTop: 12,
              borderTop: "1px solid #e6e6e6",
              paddingTop: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  display: "flex",
                  width: 36,
                  height: 36,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  background: "#efefef",
                  color: "#666",
                }}
              >
                <Settings size={16} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Settings</div>
                <div style={{ fontSize: 12, color: "#666" }}>v1.0.0</div>
              </div>
            </div>
          </div>
        </AppShell.Navbar>
      )}

      {/* Main Content */}
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

function AppHeader() {
  return (
    <div
      style={{ display: "flex", alignItems: "center", width: "100%", gap: 12 }}
    >
      <UnstyledButton aria-label="Toggle sidebar">
        {/* Placeholder for sidebar trigger */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </UnstyledButton>

      <div style={{ flex: 1, maxWidth: 520 }}>
        <div style={{ position: "relative" }}>
          <Search
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#888",
            }}
          />
          <TextInput
            placeholder="Search products, invoices, customers..."
            style={{ paddingLeft: 40 }}
          />
        </div>
      </div>

      <Group>
        <ActionIcon variant="light" title="Notifications">
          <Bell />
        </ActionIcon>
        <ActionIcon variant="light" title="Profile">
          <User />
        </ActionIcon>
      </Group>
    </div>
  );
}
