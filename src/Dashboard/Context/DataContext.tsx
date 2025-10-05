import React, { createContext, useContext, useState } from "react";

export interface InventoryItem {
  id: number;
  name: string;
  code: string;
  sku: string;
  category: string;
  supplier: string;
  unit: string;
  weight?: number;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  maxStock: number;
  location: string;
  description: string;
  status: "active" | "inactive";
  lastUpdated: string;
}

export interface SaleRecord {
  id: string;
  date: string;
  customer: string;
  items: Array<{ sku: string; quantity: number; price: number }>;
  total: number;
  status: "paid" | "pending" | "overdue";
}

interface DataContextType {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  sales: SaleRecord[];
  setSales: React.Dispatch<React.SetStateAction<SaleRecord[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);

  return (
    <DataContext.Provider value={{ inventory, setInventory, sales, setSales }}>
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
