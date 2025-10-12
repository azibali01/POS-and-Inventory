import React, { createContext, useContext, useState } from "react";
import {
  computeInventoryAfterReturn,
  computePurchasesAfterReturn,
} from "./return-utils";
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
  // per-line items on a PO. 'received' tracks total qty received so far for that line.
  items: Array<{
    sku: string;
    quantity: number;
    price: number;
    received?: number;
  }>;
  total: number;
  // legacy payment status
  status?: "paid" | "pending" | "overdue";
  // fulfillment status based on GRNs
  fulfillmentStatus?: "open" | "partially_received" | "received";
}

export interface GRNRecord {
  id: string;
  grnNumber: string;
  grnDate: string;
  supplier?: string;
  supplierId?: string;
  supplierName?: string;
  linkedPoId?: string;
  items: Array<{ sku: string; quantity: number; price: number }>;
  subtotal: number;
  totalAmount: number;
  status?: string;
}

export interface PurchaseReturnRecord {
  id: string;
  returnNumber: string;
  returnDate: string;
  supplier?: string;
  supplierId?: string;
  linkedPoId?: string;
  items: Array<{ sku: string; quantity: number; price?: number }>;
  subtotal: number;
  totalAmount: number;
  reason?: string;
  status?: string;
  // idempotency / processing flag
  processed?: boolean;
}

export interface SupplierCreditRecord {
  id: string;
  supplierId?: string;
  supplierName?: string;
  date: string;
  amount: number;
  note?: string;
}

export interface Expense {
  id: string;
  expenseNumber: string;
  expenseDate: string | Date;
  category: string;
  description?: string;
  amount: number;
  paymentMethod?: "Cash" | "Card" | "UPI" | "Cheque";
  reference?: string;
  remarks?: string;
  createdAt?: string | Date;
}

export type ExpenseInput = Omit<Expense, "id" | "createdAt">;

// Color model used across the product module
export interface Color {
  id: string; // stable id (uuid or short code)
  name: string; // display name e.g. 'DULL'
  code?: string; // manufacturer / RAL / internal code e.g. 'H23/PC-RAL'
  hex?: string; // optional hex for swatch e.g. '#cccccc'
}

interface DataContextType {
  updateExpense(id: string, arg1: Partial<Expense>): unknown;
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
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  // helper to add a new expense
  addExpense: (e: ExpenseInput) => Expense;
  grns: GRNRecord[];
  setGrns: React.Dispatch<React.SetStateAction<GRNRecord[]>>;
  purchaseReturns: PurchaseReturnRecord[];
  setPurchaseReturns: React.Dispatch<
    React.SetStateAction<PurchaseReturnRecord[]>
  >;
  supplierCredits: SupplierCreditRecord[];
  setSupplierCredits: React.Dispatch<
    React.SetStateAction<SupplierCreditRecord[]>
  >;
  // helper: apply GRN to inventory (increase stock) and update purchase summary
  applyGrnToInventory: (grn: GRNRecord) => void;
  updatePurchaseFromGrn: (grn: GRNRecord) => void;
  // helper: apply Purchase Return to inventory (decrease stock) and update purchase summary
  applyPurchaseReturnToInventory: (ret: PurchaseReturnRecord) => void;
  updatePurchaseFromReturn: (ret: PurchaseReturnRecord) => void;
  // process a purchase return idempotently: persist, apply inventory changes, update PO, create credit
  processPurchaseReturn: (ret: PurchaseReturnRecord) => {
    applied: boolean;
    message?: string;
  };
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
  const [grns, setGrns] = useState<GRNRecord[]>([]);
  const [purchaseReturns, setPurchaseReturns] = useState<
    PurchaseReturnRecord[]
  >([]);
  const [supplierCredits, setSupplierCredits] = useState<
    SupplierCreditRecord[]
  >([]);
  const [quotations, setQuotations] = useState<SalesPayload[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
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

  const addExpense = (e: ExpenseInput) => {
    const record: Expense = {
      id:
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `exp-${Date.now()}`,
      createdAt: new Date(),
      ...e,
    };
    setExpenses((prev) => [record, ...(prev || [])]);
    return record;
  };

  const updateExpense = (id: string, patch: Partial<Expense>) => {
    setExpenses((prev) =>
      (prev || []).map((x) => (x.id === id ? { ...x, ...patch } : x))
    );
  };

  function applyGrnToInventory(grn: GRNRecord) {
    // For each item in GRN, try to find inventory by sku and increase stock
    setInventory((prev) =>
      prev.map((item) => {
        const found = grn.items.find(
          (gi) => String(gi.sku) === String(item.sku)
        );
        if (found) {
          return {
            ...item,
            stock: (item.stock || 0) + (found.quantity || 0),
          } as InventoryItem;
        }
        return item;
      })
    );
  }

  function updatePurchaseFromGrn(grn: GRNRecord) {
    if (!grn.linkedPoId) return;
    setPurchases((prev) =>
      prev.map((po) => {
        if (String(po.id) !== String(grn.linkedPoId)) return po;
        // For each GRN item, add its qty to the matching PO item's 'received' field
        const items = (po.items || []).map((pi) => {
          const matched = grn.items.find(
            (gi) => String(gi.sku) === String(pi.sku)
          );
          if (!matched) return { ...pi };
          const prevReceived = pi.received || 0;
          return { ...pi, received: prevReceived + (matched.quantity || 0) };
        });

        // compute fulfillmentStatus
        let fulfillmentStatus: PurchaseRecord["fulfillmentStatus"] = "open";
        const totalOrdered = items.reduce((s, i) => s + (i.quantity || 0), 0);
        const totalReceived = items.reduce((s, i) => s + (i.received || 0), 0);
        if (totalReceived <= 0) fulfillmentStatus = "open";
        else if (totalReceived < totalOrdered)
          fulfillmentStatus = "partially_received";
        else fulfillmentStatus = "received";

        return { ...po, items, fulfillmentStatus } as PurchaseRecord;
      })
    );
  }

  function applyPurchaseReturnToInventory(ret: PurchaseReturnRecord) {
    setInventory((prev) => computeInventoryAfterReturn(prev, ret));
  }

  function updatePurchaseFromReturn(ret: PurchaseReturnRecord) {
    setPurchases((prev) => computePurchasesAfterReturn(prev, ret));
  }

  function processPurchaseReturn(ret: PurchaseReturnRecord) {
    // Idempotency: if a return with same id or returnNumber already processed, skip
    const exists = purchaseReturns.find(
      (r) => r.id === ret.id || r.returnNumber === ret.returnNumber
    );
    if (exists && exists.processed) {
      return { applied: false, message: "Return already processed" };
    }

    // persist/update return record (mark processed)
    const toSave: PurchaseReturnRecord = { ...ret, processed: true };
    setPurchaseReturns((prev) => [
      toSave,
      ...(prev || []).filter(
        (p) => p.id !== toSave.id && p.returnNumber !== toSave.returnNumber
      ),
    ]);

    // apply inventory change and update purchase using pure helpers
    setInventory((prev) => computeInventoryAfterReturn(prev, toSave));
    setPurchases((prev) => computePurchasesAfterReturn(prev, toSave));

    // create supplier credit (simple amount record)
    const supplierName =
      (customers || []).find((c) => String(c.id) === String(toSave.supplierId))
        ?.name ||
      toSave.supplier ||
      "";
    const credit: SupplierCreditRecord = {
      id:
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `scr-${Date.now()}`,
      supplierId: toSave.supplierId,
      supplierName,
      date: new Date().toISOString(),
      amount: toSave.totalAmount || 0,
      note: `Credit for return ${toSave.returnNumber}`,
    };
    setSupplierCredits((prev) => [credit, ...(prev || [])]);

    return { applied: true };
  }

  return (
    <DataContext.Provider
      value={{
        inventory,
        setInventory,
        sales,
        setSales,
        purchases,
        setPurchases,
        expenses,
        setExpenses,
        // expose expense helpers
        addExpense,
        updateExpense,
        grns,
        setGrns,
        applyGrnToInventory,
        updatePurchaseFromGrn,
        purchaseReturns,
        setPurchaseReturns,
        applyPurchaseReturnToInventory,
        updatePurchaseFromReturn,
        supplierCredits,
        setSupplierCredits,
        processPurchaseReturn,
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
