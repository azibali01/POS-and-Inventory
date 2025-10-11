import React, { createContext, useContext, useState } from "react";
import type { SalesPayload } from "../../components/sales/SalesDocShell";

export interface InventoryItem {
  id: number;
  name: string;
  code: string;
  sku: string;
  category: string;
  supplier: string;
  unit: string;
  // legacy free-text color (kept for backward compatibility)
  color?: string;
  // canonical reference to a Color in the central colors list
  colorId?: string;
  length?: string | number;
  msl?: string | number; // Minimum Stock Level label/indicator (if different)
  weight?: number;
  costPrice: number;
  oldPrice?: number;
  sellingPrice: number;
  newPrice?: number;
  stock: number;
  minStock: number;
  maxStock: number;
  location: string;
  description: string;
  status: "active" | "inactive";
  lastUpdated: string;
}

export interface Customer {
  id: number;
  customerCode: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  gstNumber?: string;
  openingBalance?: number;
  creditLimit?: number;
  currentBalance?: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface SaleRecord {
  id: string;
  date: string;
  customer: string;
  items: Array<{ sku: string; quantity: number; price: number }>;
  total: number;
  status: "paid" | "pending" | "overdue";
}

export interface PurchaseRecord {
  id: string;
  date: string;
  supplier: string;
  items: Array<{ sku: string; quantity: number; price: number }>;
  total: number;
  status?: "paid" | "pending" | "overdue";
}

// Color model used across the product module
export interface Color {
  id: string; // stable id (uuid or short code)
  name: string; // display name e.g. 'DULL'
  code?: string; // manufacturer / RAL / internal code e.g. 'H23/PC-RAL'
  hex?: string; // optional hex for swatch e.g. '#cccccc'
}

interface DataContextType {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  // Colors
  colors: Color[];
  setColors: React.Dispatch<React.SetStateAction<Color[]>>;
  getColorById: (id?: string) => Color | undefined;
  getColorByNameOrCode: (s?: string) => Color | undefined;
  addColor: (c: Omit<Color, "id">) => Color;
  sales: SaleRecord[];
  setSales: React.Dispatch<React.SetStateAction<SaleRecord[]>>;
  purchases: PurchaseRecord[];
  setPurchases: React.Dispatch<React.SetStateAction<PurchaseRecord[]>>;
  // Quotations (SalesPayload-like objects)
  quotations: SalesPayload[];
  setQuotations: React.Dispatch<React.SetStateAction<SalesPayload[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Dev-only seed
  let initialInventory: InventoryItem[] = [];
  if (import.meta.env.MODE !== "production") {
    // dynamic import so bundlers can tree-shake for production
    import("../mock-products.json")
      .then((m) => {
        const mock = (m as unknown as { default?: unknown }).default || m;
        if (Array.isArray(mock)) {
          initialInventory = mock as InventoryItem[];
        }
      })
      .catch(() => {
        /* ignore */
      });
  }

  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [quotations, setQuotations] = useState<SalesPayload[]>([]);
  // Customers - simple in-memory store. Seed a Walk-in customer by default.
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 1,
      customerCode: "CUST-001",
      name: "Walk-in Customer",
      phone: "",
      email: "",
      address: "",
      city: "Local",
      gstNumber: "",
      openingBalance: 0,
      creditLimit: 0,
      currentBalance: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ]);

  // Colors: seed a few common options (adjust as needed)
  const [colors, setColors] = useState<Color[]>([
    { id: "c-dull", name: "DULL", code: "DULL", hex: "#bfbfbf" },
    { id: "c-h23", name: "H23/PC‐RAL", code: "H23/PC-RAL", hex: "#c49c6c" },
    { id: "c-sahra", name: "SAHRA/BRN", code: "SAHRA/BRN", hex: "#8b5a2b" },
    { id: "c-black", name: "BLACK/MULTI", code: "BLACK/MULTI", hex: "#000000" },
    { id: "c-wood", name: "WOOD/COAT", code: "WOOD/COAT", hex: "#a67c52" },
  ]);

  const getColorById = (id?: string) => colors.find((c) => c.id === id);
  const getColorByNameOrCode = (s?: string) =>
    colors.find((c) => c.name === s || c.code === s);
  const addColor = (c: Omit<Color, "id">) => {
    const id = `c-${Date.now()}`;
    const newColor: Color = { id, ...c };
    setColors((prev) => [newColor, ...prev]);
    return newColor;
  };

  return (
    <DataContext.Provider
      value={{
        inventory,
        setInventory,
        sales,
        setSales,
        purchases,
        setPurchases,
        quotations,
        setQuotations,
        customers,
        setCustomers,
        colors,
        setColors,
        getColorById,
        getColorByNameOrCode,
        addColor,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export function useDataContext() {
  const ctx = useContext(DataContext);
  if (!ctx)
    throw new Error("useDataContext must be used within a DataProvider");
  return ctx;
}
