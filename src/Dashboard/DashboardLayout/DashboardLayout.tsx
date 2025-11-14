import { type ReactNode, useState, useMemo } from "react";
import { AppShell, Stack, NavLink, TextInput, Group, Text, Button } from "@mantine/core";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ShoppingBag,
  Receipt,
  Wallet,
  FileBarChart,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../Auth/Context/AuthContext";
import { notifications } from "@mantine/notifications";

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
        label: "Colors",
        icon: <Package size={14} />,
        path: "/products/colors",
      },
      {
        label: "Stock Report",
        icon: <FileBarChart size={14} />,
        path: "/products/stock-report",
      },
      {
        label: "Stock Summary",
        icon: <FileBarChart size={14} />,
        path: "/products/stock-summary",
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
        label: "Cash Book",
        icon: <Wallet size={14} />,
        path: "/accounts/cash-book",
      },
      {
        label: "Bank Book",
        icon: <Wallet size={14} />,
        path: "/accounts/bank-book",
      },
    ],
  },
  {
    label: "Reports",
    icon: <FileBarChart size={16} />,
    children: [
      {
        label: "Profit & Loss",
        icon: <FileBarChart size={14} />,
        path: "/reports/profit-loss",
      },
      {
        label: "Journal Ledger",
        icon: <FileBarChart size={14} />,
        path: "/reports/journal-ledger",
      },
    ],
  },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");

  const handleLogout = () => {
    logout();
    notifications.show({
      message: "Logged out successfully",
      color: "blue",
    });
    navigate("/auth");
  };

  // Helper to flatten all menu items for search

  // Filter navigation based on search
  const filteredNavigation = useMemo(() => {
    if (!search.trim()) return navigation;
    const q = search.trim().toLowerCase();
    // Show parents if any child matches
    function filterItems(items: MenuItem[]): MenuItem[] {
      return items
        .map((item) => {
          if (item.children) {
            const filteredChildren = filterItems(item.children);
            if (
              filteredChildren.length > 0 ||
              item.label.toLowerCase().includes(q)
            ) {
              return { ...item, children: filteredChildren };
            }
            return null;
          }
          if (item.label.toLowerCase().includes(q)) return item;
          return null;
        })
        .filter(Boolean) as MenuItem[];
    }
    return filterItems(navigation);
  }, [search]);

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
        width: 240,
        breakpoint: "sm",
        collapsed: { mobile: true },
      }}
      padding="md"
      styles={{
        main: { backgroundColor: "#ffffffff" },
      }}
    >
      {/* Header */}
      <AppShell.Header
        style={{ 
          background: "#ffffff", 
          padding: "0 24px", 
          height: "60px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Group justify="space-between" style={{ width: "100%", height: "100%" }}>
          <Text size="lg" fw={700} c="#1e3a8a">
            7 Star Traders
          </Text>
          <Group gap="md">
            {user && (
              <Text size="sm" c="#6b7280">
                Welcome, <strong>{user.name}</strong>
              </Text>
            )}
            <Button
              leftSection={<LogOut size={16} />}
              variant="light"
              color="red"
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Group>
        </Group>
      </AppShell.Header>
      {/* Sidebar */}
      {!isPrintMode && (
        <AppShell.Navbar 
          p="md" 
          bg="#F5F5F5"
          style={{
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TextInput
            placeholder="Search pages..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            mb="md"
            size="sm"
            styles={{ input: { borderRadius: 8 } }}
          />
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              paddingRight: "4px",
            }}
          >
            <Stack gap="xs">
              {filteredNavigation.map((item: MenuItem) => {
              // If item has children render a parent NavLink containing child NavLinks
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
                    {item.children.map((child: MenuItem) => {
                      const isActive = location.pathname === child.path;
                      return (
                        <NavLink
                          key={child.label}
                          component={Link}
                          to={child.path || "#"}
                          label={child.label}
                          leftSection={child.icon}
                          active={isActive}
                          styles={{
                            root: {
                              color: isActive ? "#fff" : "#000000ff",
                              backgroundColor: isActive ? "#333" : undefined,
                              borderRadius: "8px",
                              marginLeft: 16,
                              fontWeight: isActive ? 800 : 500,
                              fontSize: "13px",
                              "&:hover": { backgroundColor: "#333" },
                            },
                            label: { fontSize: "13px", fontWeight: 500 },
                          }}
                        />
                      );
                    })}
                  </NavLink>
                );
              }

              // Default single-level nav item
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.label}
                  component={Link}
                  to={item.path || "#"}
                  label={item.label}
                  leftSection={item.icon}
                  active={isActive}
                  styles={{
                    root: {
                      color: isActive ? "#fff" : "#000000ff",
                      backgroundColor: isActive ? "#333" : undefined,
                      borderRadius: "8px",
                      "&:hover": { backgroundColor: "#333" },
                      fontWeight: isActive ? 800 : undefined,
                    },
                    label: { fontSize: "14px", fontWeight: 600 },
                  }}
                />
              );
            })}
            </Stack>
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
