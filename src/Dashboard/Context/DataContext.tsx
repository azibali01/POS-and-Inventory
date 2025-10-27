import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { showNotification } from "@mantine/notifications";
import * as api from "../../lib/api";
import { validateArrayResponse } from "../../lib/validate-api";
import {
  computeInventoryAfterReturn,
  computePurchasesAfterReturn,
} from "./return-utils";
import type { SalesPayload } from "../../components/sales/SalesDocShell";
import type { InventoryItemPayload } from "../../lib/api";

export interface InventoryItem {
  id: number;
  // raw id coming from the backend (could be Mongo _id string or numeric id)
  serverId?: string | number;
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
  thickness?: number;
  msl?: string | number; // Minimum Stock Level label/indicator (if different)
  weight?: number;
  costPrice: number;
  oldPrice?: number;
  sellingPrice: number;
  // alias for backend field name
  salesRate?: number;
  newPrice?: number;
  stock: number;
  // openingStock alias (backend may use this name)
  openingStock?: number;
  minStock: number;
  // minimumStockLevel alias (backend may use this name)
  minimumStockLevel?: number;
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
  name: string;
}

interface DataContextType {
  // ===== INVENTORY MODULE =====
  inventory: InventoryItem[];
  inventoryLoading: boolean;
  inventoryError: string | null;
  loadInventory: () => Promise<InventoryItem[]>;
  createInventoryItem: (
    payload: InventoryItemPayload
  ) => Promise<InventoryItem>;
  updateInventoryItem: (
    id: string | number,
    payload: Partial<InventoryItemPayload>
  ) => Promise<InventoryItem>;
  deleteInventoryItem: (id: string | number) => Promise<void>;

  // ===== CATEGORIES MODULE =====
  categories: string[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  categoriesForSelect: Array<{ value: string; label: string }>;
  loadCategories: () => Promise<string[]>;
  createCategory: (name: string) => Promise<void>;
  updateCategory: (oldName: string, newName: string) => Promise<void>;
  deleteCategory: (name: string) => Promise<void>;

  // ===== CUSTOMERS MODULE =====
  customers: Customer[];
  customersLoading: boolean;
  customersError: string | null;
  loadCustomers: () => Promise<Customer[]>;
  createCustomer: (payload: any) => Promise<Customer>;
  updateCustomer: (id: string | number, payload: any) => Promise<Customer>;
  deleteCustomer: (id: string | number) => Promise<void>;

  // ===== SALES MODULE =====
  sales: SaleRecord[];
  salesLoading: boolean;
  salesError: string | null;
  loadSales: () => Promise<SaleRecord[]>;
  createSale: (payload: SaleRecord) => Promise<SaleRecord>;
  updateSale: (id: string | number, payload: Partial<SaleRecord>) => Promise<SaleRecord>;
  deleteSale: (id: string | number) => Promise<void>;

  // ===== PURCHASES MODULE =====
  purchases: PurchaseRecord[];
  purchasesLoading: boolean;
  purchasesError: string | null;
  loadPurchases: () => Promise<PurchaseRecord[]>;
  createPurchase: (payload: any) => Promise<PurchaseRecord>;
  updatePurchase: (
    id: string | number,
    payload: any
  ) => Promise<PurchaseRecord>;
  deletePurchase: (id: string | number) => Promise<void>;

  // ===== GRN MODULE =====
  grns: GRNRecord[];
  grnsLoading: boolean;
  grnsError: string | null;
  loadGrns: () => Promise<GRNRecord[]>;
  createGrn: (payload: any) => Promise<GRNRecord>;
  applyGrnToInventory: (grn: GRNRecord) => void;
  updatePurchaseFromGrn: (grn: GRNRecord) => void;

  // ===== PURCHASE RETURNS MODULE =====
  purchaseReturns: PurchaseReturnRecord[];
  purchaseReturnsLoading: boolean;
  purchaseReturnsError: string | null;
  loadPurchaseReturns: () => Promise<PurchaseReturnRecord[]>;
  createPurchaseReturn: (payload: any) => Promise<PurchaseReturnRecord>;
  applyPurchaseReturnToInventory: (ret: PurchaseReturnRecord) => void;
  updatePurchaseFromReturn: (ret: PurchaseReturnRecord) => void;
  processPurchaseReturn: (ret: PurchaseReturnRecord) => {
    applied: boolean;
    message?: string;
  };

  // ===== EXPENSES MODULE =====
  expenses: Expense[];
  expensesLoading: boolean;
  expensesError: string | null;
  loadExpenses: () => Promise<Expense[]>;
  createExpense: (payload: ExpenseInput) => Promise<Expense>;
  updateExpense: (id: string, payload: Partial<Expense>) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;

  // ===== QUOTATIONS =====
  quotations: SalesPayload[];
  setQuotations: React.Dispatch<React.SetStateAction<SalesPayload[]>>;

  // ===== SUPPLIER CREDITS =====
  supplierCredits: SupplierCreditRecord[];
  setSupplierCredits: React.Dispatch<
    React.SetStateAction<SupplierCreditRecord[]>
  >;

  // ===== LEGACY / BACKEND STATUS =====
  refreshFromBackend: () => Promise<boolean>;
  isBackendAvailable: boolean;
  apiWarnings: string[];

  // ===== COLORS (Static) =====
  colors: Color[];

  // Legacy setters (kept for backward compatibility - deprecate later)
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  setSales: React.Dispatch<React.SetStateAction<SaleRecord[]>>;
  setPurchases: React.Dispatch<React.SetStateAction<PurchaseRecord[]>>;
  setGrns: React.Dispatch<React.SetStateAction<GRNRecord[]>>;
  setPurchaseReturns: React.Dispatch<
    React.SetStateAction<PurchaseReturnRecord[]>
  >;
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;

  // Legacy helpers (kept for backward compatibility)
  addCategory: (name: string) => void;
  renameCategory: (oldName: string, newName: string) => void;
  addExpense: (e: ExpenseInput) => Expense;
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

  // ===== STATE: INVENTORY =====
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  // ===== STATE: CATEGORIES =====
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // ===== STATE: CUSTOMERS =====
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
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);

  // ===== STATE: SALES =====
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState<string | null>(null);

  // ===== STATE: PURCHASES =====
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [purchasesError, setPurchasesError] = useState<string | null>(null);

  // ===== STATE: GRNS =====
  const [grns, setGrns] = useState<GRNRecord[]>([]);
  const [grnsLoading, setGrnsLoading] = useState(false);
  const [grnsError, setGrnsError] = useState<string | null>(null);

  // ===== STATE: PURCHASE RETURNS =====
  const [purchaseReturns, setPurchaseReturns] = useState<
    PurchaseReturnRecord[]
  >([]);
  const [purchaseReturnsLoading, setPurchaseReturnsLoading] = useState(false);
  const [purchaseReturnsError, setPurchaseReturnsError] = useState<
    string | null
  >(null);

  // ===== STATE: EXPENSES =====
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [expensesError, setExpensesError] = useState<string | null>(null);

  // ===== STATE: OTHER =====
  const [supplierCredits, setSupplierCredits] = useState<
    SupplierCreditRecord[]
  >([]);
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean>(false);
  const [apiWarnings, setApiWarnings] = useState<string[]>([]);
  const [quotations, setQuotations] = useState<SalesPayload[]>([]);

  // Track inventory loaded state to avoid refetch storms in development.
  const inventoryRef = useRef<InventoryItem[]>(initialInventory);
  const inventoryLoadedRef = useRef<boolean>(initialInventory.length > 0);
  useEffect(() => {
    inventoryRef.current = inventory;
    inventoryLoadedRef.current = (inventory || []).length > 0;
  }, [inventory]);

  // Dev-only: log provider mount so we can detect HMR / duplicate-context issues
  useEffect(() => {
    if (import.meta.env.MODE !== "production") {
      // eslint-disable-next-line no-console
      console.debug(
        `[DataContext] Provider mounted @ ${new Date().toISOString()}`
      );
      return () => {
        // eslint-disable-next-line no-console
        console.debug(
          `[DataContext] Provider unmounted @ ${new Date().toISOString()}`
        );
      };
    }
    return undefined;
  }, []);

  // Colors are static client-side. Provide the canonical set here and do not
  // load or mutate them at runtime.
  const [colors] = useState<Color[]>([
    { name: "DULL" },
    { name: "H23/PC-RAL" },
    { name: "SAHRA/BRN" },
    { name: "BLACK/MULTI" },
    { name: "WOODCOAT" },
  ]);

  // categories formatted for Select controls
  const categoriesForSelect = React.useMemo(() => {
    return (categories || []).map((c) => ({
      value: String(c),
      label: String(c),
    }));
  }, [categories]);

  // coalesce concurrent refreshFromBackend calls using a ref-held promise
  const refreshPromiseRef = useRef<Promise<boolean> | null>(null);

  // generic per-loader single-flight map so multiple pages mounting at the
  // same time don't issue duplicate requests for the same dataset.
  const loaderPromisesRef = useRef<Record<string, Promise<any> | null>>({});

  // track which loaders have successfully completed at least once so we
  // can avoid re-fetching repeatedly in development or when multiple
  // components mount/unmount. This is a simple idempotency guard.
  const loaderLoadedRef = useRef<Record<string, boolean>>({});

  // normalize response helper (pulled out so loaders can reuse it)
  const normalizeResponse = (v: unknown): unknown[] => {
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object") {
      const maybe = v as { [k: string]: unknown };
      if (Array.isArray(maybe.data)) return maybe.data;
      for (const key of Object.keys(maybe)) {
        const val = maybe[key];
        if (Array.isArray(val)) return val as unknown[];
      }
    }
    return [];
  };

  const runLoader = useCallback(
    async (
      key: string,
      fn: () => Promise<unknown>,
      setter: (v: unknown[]) => void
    ) => {
      // If a loader for the same key is already in-flight, reuse its promise.
      if (loaderPromisesRef.current[key]) {
        if (import.meta.env.MODE !== "production") {
          // eslint-disable-next-line no-console
          try {
            const trace = new Error().stack || "";
            console.debug(
              `[DataContext] runLoader: reusing in-flight loader "${key}"`,
              trace.split("\n").slice(2, 6)
            );
          } catch (e) {
            // ignore logging failure
            // eslint-disable-next-line no-console
            console.debug(
              `[DataContext] runLoader: reusing in-flight loader "${key}"`
            );
          }
        }
        return loaderPromisesRef.current[key];
      }

      if (import.meta.env.MODE !== "production") {
        try {
          // eslint-disable-next-line no-console
          const trace = new Error().stack || "";
          console.debug(
            `[DataContext] runLoader: starting loader "${key}"`,
            trace.split("\n").slice(2, 8)
          );
        } catch (e) {
          // eslint-disable-next-line no-console
          console.debug(`[DataContext] runLoader: starting loader "${key}"`);
        }
      }

      loaderPromisesRef.current[key] = (async () => {
        try {
          const res = await fn();
          const arr = normalizeResponse(res) as unknown[];
          setter(arr);
          // mark this loader as successfully loaded so future calls can
          // short-circuit and avoid repeated network requests.
          loaderLoadedRef.current[key] = true;
          return arr;
        } finally {
          loaderPromisesRef.current[key] = null;
        }
      })();
      return loaderPromisesRef.current[key];
    },
    []
  );

  // Lazy loaders for inventory/customers/colors so pages can opt-in
  const loadInventory = useCallback(async () => {
    // If inventory already loaded, skip fetching again (prevents request storms)
    // We check both the inventoryLoadedRef (client state) and the loaderLoadedRef
    // so that once a successful remote fetch occurred we don't keep hitting
    // the backend repeatedly during dev HMR cycles or frequent mounts.
    if (inventoryLoadedRef.current || loaderLoadedRef.current["inventory"]) {
      if (import.meta.env.MODE !== "production") {
        // eslint-disable-next-line no-console
        console.debug(
          "[DataContext] loadInventory: inventory already loaded — skipping fetch"
        );
      }
      return inventoryRef.current;
    }

    return runLoader("inventory", api.getInventory, (v) => {
      const raw = normalizeResponse(v) as unknown[];
      const mapped = (raw || []).map((it) => {
        const o = (it || {}) as any;
        const idRaw = o.id ?? o._id ?? (o._id && o._id.$oid) ?? undefined;
        let idNum = 0;
        if (typeof idRaw === "number") idNum = idRaw;
        else if (typeof idRaw === "string" && /^\d+$/.test(idRaw))
          idNum = Number(idRaw);
        else idNum = Date.now() + Math.floor(Math.random() * 1000);

        return {
          id: idNum,
          serverId: idRaw ?? undefined,
          name: o.name ?? o.itemName ?? o.item_name ?? "",
          code: o.sku ?? o.code ?? o.itemCode ?? String(idRaw ?? idNum),
          sku: o.sku ?? o.code ?? o.itemCode ?? String(idRaw ?? idNum),
          category: o.category ?? o.categoryName ?? o.cat ?? "",
          supplier: o.supplier ?? o.brand ?? "",
          unit: o.unit ?? o.unitType ?? "ft",
          color: o.color ?? "",
          colorId: o.colorId ?? o.color_id ?? undefined,
          length: o.length ?? (o.metadata && o.metadata.length) ?? "",
          thickness: o.thickness ?? (o.metadata && o.metadata.thickness) ?? "",
          msl: undefined,

          // server may use salesRate or sellingPrice — map to both fields
          sellingPrice: o.sellingPrice ?? o.price ?? o.selling_price ?? 0,
          salesRate: (o.salesRate ??
            o.sellingPrice ??
            o.price ??
            o.selling_price) as number,

          // stock aliases
          stock: o.stock ?? o.quantity ?? o.openingStock ?? 0,
          openingStock: o.openingStock ?? o.quantity ?? o.stock ?? 0,
          minStock: o.minStock ?? o.minimumStock ?? 0,
          minimumStockLevel:
            o.minimumStockLevel ?? o.minimumStock ?? o.minStock ?? 0,
          maxStock: o.maxStock ?? 0,

          description: o.description ?? o.remarks ?? "",

          lastUpdated: o.updatedAt ?? o.lastUpdated ?? new Date().toISOString(),
        } as InventoryItem;
      });

      setInventory(mapped);
      inventoryRef.current = mapped;
      inventoryLoadedRef.current = (mapped || []).length > 0;

      // Dev-only diagnostic: log mapping result to help debug missing table rows
      if (import.meta.env.MODE !== "production") {
        try {
          // lightweight sample for the console
          // eslint-disable-next-line no-console
          console.debug(
            "[DataContext] loadInventory -> mapped items:",
            mapped.length,
            mapped.slice(0, 5)
          );
        } catch (e) {
          /* ignore console failure */
        }
      }
    });
  }, [runLoader]);

  const loadCustomers = useCallback(async () => {
    if (loaderLoadedRef.current["customers"]) {
      if (import.meta.env.MODE !== "production") {
        // eslint-disable-next-line no-console
        console.debug(
          "[DataContext] loadCustomers: already loaded — skipping fetch"
        );
      }
      return customers;
    }
    return runLoader("customers", api.getCustomers, (v) => {
      setCustomers(normalizeResponse(v) as Customer[]);
    });
  }, [runLoader, customers]);

  const loadCategories = useCallback(async () => {
    if (loaderLoadedRef.current["categories"]) {
      if (import.meta.env.MODE !== "production") {
        // eslint-disable-next-line no-console
        console.debug(
          "[DataContext] loadCategories: already loaded — skipping fetch"
        );
      }
      return categories;
    }
    return runLoader("categories", api.getCategories, (v) => {
      const raw = normalizeResponse(v) as unknown[];
      const categoryNames = raw
        .map((c) => {
          if (!c) return "";
          if (typeof c === "string") return c;
          if (typeof c === "object") {
            const o = c as { [k: string]: unknown };
            const nameFields = ["name", "title", "category", "label", "value"];
            for (const f of nameFields) {
              const vv = o[f];
              if (typeof vv === "string" && vv.trim()) return vv as string;
            }
            if (o.id !== undefined && o.id !== null) return String(o.id);
            if (o._id !== undefined && o._id !== null) return String(o._id);
          }
          return "";
        })
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter(Boolean);
      setCategories(categoryNames);
    });
  }, [runLoader, categories]);

  // colors are static — no runtime loader

  // ===== INVENTORY CRUD FUNCTIONS =====
  const createInventoryItem = useCallback(
    async (payload: InventoryItemPayload) => {
      setInventoryLoading(true);
      try {
        const created = await api.createInventory(payload);
        const item = {
          ...created,
          id: created.id ?? Date.now(),
          serverId: (created as any)._id ?? created.id,
        } as unknown as InventoryItem;

        setInventory((prev) => [item, ...prev]);
        showNotification({
          title: "Product Created",
          message: `${payload.itemName || "Item"} has been added successfully`,
          color: "green",
        });
        return item;
      } catch (err: any) {
        console.error("Create inventory failed:", err);
        setInventoryError(err.message || "Failed to create product");
        showNotification({
          title: "Create Failed",
          message: err.message || "Failed to create product",
          color: "red",
        });
        throw err;
      } finally {
        setInventoryLoading(false);
      }
    },
    []
  );

  const updateInventoryItem = useCallback(
    async (id: string | number, payload: Partial<InventoryItemPayload>) => {
      setInventoryLoading(true);
      try {
        const updated = await api.updateInventory(String(id), payload);
        const idNum = (() => {
          const raw = (updated as any).id ?? id;
          if (typeof raw === "number") return raw;
          if (typeof raw === "string" && /^\d+$/.test(raw)) return Number(raw);
          if (typeof id === "string" && /^\d+$/.test(id)) return Number(id);
          if (typeof id === "number") return id;
          return Date.now();
        })();

        const item = {
          ...updated,
          id: idNum,
          serverId: (updated as any)._id ?? (updated as any).id ?? id,
        } as unknown as InventoryItem;

        setInventory((prev) => prev.map((p) => (p.id === idNum ? item : p)));
        showNotification({
          title: "Product Updated",
          message: `Product has been updated successfully`,
          color: "blue",
        });
        return item;
      } catch (err: any) {
        console.error("Update inventory failed:", err);
        setInventoryError(err.message || "Failed to update product");
        showNotification({
          title: "Update Failed",
          message: err.message || "Failed to update product",
          color: "red",
        });
        throw err;
      } finally {
        setInventoryLoading(false);
      }
    },
    []
  );

  const deleteInventoryItem = useCallback(async (id: string | number) => {
    setInventoryLoading(true);
    try {
      await api.deleteInventory(String(id));
      setInventory((prev) => prev.filter((p) => String(p.id) !== String(id)));
      showNotification({
        title: "Product Deleted",
        message: "Product has been removed",
        color: "orange",
      });
    } catch (err: any) {
      console.error("Delete inventory failed:", err);
      setInventoryError(err.message || "Failed to delete product");
      showNotification({
        title: "Delete Failed",
        message: err.message || "Failed to delete product",
        color: "red",
      });
      throw err;
    } finally {
      setInventoryLoading(false);
    }
  }, []);

  // ===== CUSTOMERS CRUD FUNCTIONS =====
  const createCustomer = useCallback(async (payload: any) => {
    setCustomersLoading(true);
    try {
      const created = await api.createCustomer(payload);
      const customer = {
        ...created,
        id: created.id ?? Date.now(),
      } as Customer;

      setCustomers((prev) => [customer, ...prev]);
      showNotification({
        title: "Customer Created",
        message: `${payload.name || "Customer"} has been added`,
        color: "green",
      });
      return customer;
    } catch (err: any) {
      console.error("Create customer failed:", err);
      setCustomersError(err.message || "Failed to create customer");
      showNotification({
        title: "Create Failed",
        message: err.message || "Failed to create customer",
        color: "red",
      });
      throw err;
    } finally {
      setCustomersLoading(false);
    }
  }, []);

  const updateCustomer = useCallback(
    async (id: string | number, payload: any) => {
      setCustomersLoading(true);
      try {
        const updated = await api.updateCustomer(String(id), payload);
        const customer = {
          ...updated,
          id: updated.id ?? id,
        } as Customer;

        setCustomers((prev) =>
          prev.map((c) => (String(c.id) === String(id) ? customer : c))
        );
        showNotification({
          title: "Customer Updated",
          message: "Customer has been updated successfully",
          color: "blue",
        });
        return customer;
      } catch (err: any) {
        console.error("Update customer failed:", err);
        setCustomersError(err.message || "Failed to update customer");
        showNotification({
          title: "Update Failed",
          message: err.message || "Failed to update customer",
          color: "red",
        });
        throw err;
      } finally {
        setCustomersLoading(false);
      }
    },
    []
  );

  const deleteCustomer = useCallback(async (id: string | number) => {
    setCustomersLoading(true);
    try {
      await api.deleteCustomer(String(id));
      setCustomers((prev) => prev.filter((c) => String(c.id) !== String(id)));
      showNotification({
        title: "Customer Deleted",
        message: "Customer has been removed",
        color: "orange",
      });
    } catch (err: any) {
      console.error("Delete customer failed:", err);
      setCustomersError(err.message || "Failed to delete customer");
      showNotification({
        title: "Delete Failed",
        message: err.message || "Failed to delete customer",
        color: "red",
      });
      throw err;
    } finally {
      setCustomersLoading(false);
    }
  }, []);

  // ===== SALES CRUD FUNCTIONS =====
  const createSale = useCallback(async (payload: any) => {
    setSalesLoading(true);
    try {
      const created = await api.createSale(payload);
      const sale = {
        ...created,
        id: created.id ?? `sale-${Date.now()}`,
      } as SaleRecord;

      setSales((prev) => [sale, ...prev]);
      showNotification({
        title: "Sale Created",
        message: "Sale has been recorded successfully",
        color: "green",
      });
      return sale;
    } catch (err: any) {
      console.error("Create sale failed:", err);
      setSalesError(err.message || "Failed to create sale");
      showNotification({
        title: "Create Failed",
        message: err.message || "Failed to create sale",
        color: "red",
      });
      throw err;
    } finally {
      setSalesLoading(false);
    }
  }, []);

  const updateSale = useCallback(async (id: string | number, payload: any) => {
    setSalesLoading(true);
    try {
      const updated = await api.updateSale(String(id), payload);
      const sale = {
        ...updated,
        id: updated.id ?? id,
      } as SaleRecord;

      setSales((prev) =>
        prev.map((s) => (String(s.id) === String(id) ? sale : s))
      );
      showNotification({
        title: "Sale Updated",
        message: "Sale has been updated successfully",
        color: "blue",
      });
      return sale;
    } catch (err: any) {
      console.error("Update sale failed:", err);
      setSalesError(err.message || "Failed to update sale");
      showNotification({
        title: "Update Failed",
        message: err.message || "Failed to update sale",
        color: "red",
      });
      throw err;
    } finally {
      setSalesLoading(false);
    }
  }, []);

  const deleteSale = useCallback(async (id: string | number) => {
    setSalesLoading(true);
    try {
      await api.deleteSale(String(id));
      setSales((prev) => prev.filter((s) => String(s.id) !== String(id)));
      showNotification({
        title: "Sale Deleted",
        message: "Sale has been removed",
        color: "orange",
      });
    } catch (err: any) {
      console.error("Delete sale failed:", err);
      setSalesError(err.message || "Failed to delete sale");
      showNotification({
        title: "Delete Failed",
        message: err.message || "Failed to delete sale",
        color: "red",
      });
      throw err;
    } finally {
      setSalesLoading(false);
    }
  }, []);

  // ===== PURCHASES CRUD FUNCTIONS =====
  const createPurchase = useCallback(async (payload: any) => {
    setPurchasesLoading(true);
    try {
      const created = await api.createPurchase(payload);
      const purchase = {
        ...created,
        id: created.id ?? `po-${Date.now()}`,
      } as PurchaseRecord;

      setPurchases((prev) => [purchase, ...prev]);
      showNotification({
        title: "Purchase Created",
        message: "Purchase order has been created",
        color: "green",
      });
      return purchase;
    } catch (err: any) {
      console.error("Create purchase failed:", err);
      setPurchasesError(err.message || "Failed to create purchase");
      showNotification({
        title: "Create Failed",
        message: err.message || "Failed to create purchase",
        color: "red",
      });
      throw err;
    } finally {
      setPurchasesLoading(false);
    }
  }, []);

  const updatePurchase = useCallback(
    async (id: string | number, payload: any) => {
      setPurchasesLoading(true);
      try {
        const updated = await api.updatePurchase(String(id), payload);
        const purchase = {
          ...updated,
          id: updated.id ?? id,
        } as PurchaseRecord;

        setPurchases((prev) =>
          prev.map((p) => (String(p.id) === String(id) ? purchase : p))
        );
        showNotification({
          title: "Purchase Updated",
          message: "Purchase order has been updated",
          color: "blue",
        });
        return purchase;
      } catch (err: any) {
        console.error("Update purchase failed:", err);
        setPurchasesError(err.message || "Failed to update purchase");
        showNotification({
          title: "Update Failed",
          message: err.message || "Failed to update purchase",
          color: "red",
        });
        throw err;
      } finally {
        setPurchasesLoading(false);
      }
    },
    []
  );

  const deletePurchase = useCallback(async (id: string | number) => {
    setPurchasesLoading(true);
    try {
      await api.deletePurchase(String(id));
      setPurchases((prev) => prev.filter((p) => String(p.id) !== String(id)));
      showNotification({
        title: "Purchase Deleted",
        message: "Purchase order has been removed",
        color: "orange",
      });
    } catch (err: any) {
      console.error("Delete purchase failed:", err);
      setPurchasesError(err.message || "Failed to delete purchase");
      showNotification({
        title: "Delete Failed",
        message: err.message || "Failed to delete purchase",
        color: "red",
      });
      throw err;
    } finally {
      setPurchasesLoading(false);
    }
  }, []);

  // ===== GRN CRUD FUNCTIONS =====
  const createGrn = useCallback(async (payload: any) => {
    setGrnsLoading(true);
    try {
      const created = await api.createGRN(payload);
      const grn = {
        ...created,
        id: created.id ?? `grn-${Date.now()}`,
      } as GRNRecord;

      setGrns((prev) => [grn, ...prev]);
      showNotification({
        title: "GRN Created",
        message: `GRN ${grn.grnNumber || ""} has been created`,
        color: "green",
      });
      return grn;
    } catch (err: any) {
      console.error("Create GRN failed:", err);
      setGrnsError(err.message || "Failed to create GRN");
      showNotification({
        title: "Create Failed",
        message: err.message || "Failed to create GRN",
        color: "red",
      });
      throw err;
    } finally {
      setGrnsLoading(false);
    }
  }, []);

  // ===== PURCHASE RETURN CRUD FUNCTIONS =====
  const createPurchaseReturn = useCallback(async (payload: any) => {
    setPurchaseReturnsLoading(true);
    try {
      const created = await api.createPurchaseReturn(payload);
      const purchaseReturn = {
        ...created,
        id: created.id ?? `pr-${Date.now()}`,
      } as PurchaseReturnRecord;

      setPurchaseReturns((prev) => [purchaseReturn, ...prev]);
      showNotification({
        title: "Purchase Return Created",
        message: `Return ${purchaseReturn.returnNumber || ""} has been created`,
        color: "green",
      });
      return purchaseReturn;
    } catch (err: any) {
      console.error("Create purchase return failed:", err);
      setPurchaseReturnsError(
        err.message || "Failed to create purchase return"
      );
      showNotification({
        title: "Create Failed",
        message: err.message || "Failed to create purchase return",
        color: "red",
      });
      throw err;
    } finally {
      setPurchaseReturnsLoading(false);
    }
  }, []);

  // ===== EXPENSE CRUD FUNCTIONS =====
  const createExpense = useCallback(async (payload: ExpenseInput) => {
    setExpensesLoading(true);
    try {
      const created = await api.createExpense(payload);
      const expense = {
        ...created,
        id: created.id ?? `exp-${Date.now()}`,
      } as Expense;

      setExpenses((prev) => [expense, ...prev]);
      showNotification({
        title: "Expense Created",
        message: "Expense has been recorded",
        color: "green",
      });
      return expense;
    } catch (err: any) {
      console.error("Create expense failed:", err);
      setExpensesError(err.message || "Failed to create expense");
      showNotification({
        title: "Create Failed",
        message: err.message || "Failed to create expense",
        color: "red",
      });
      throw err;
    } finally {
      setExpensesLoading(false);
    }
  }, []);

  const updateExpenseItem = useCallback(
    async (id: string, payload: Partial<Expense>) => {
      setExpensesLoading(true);
      try {
        const updated = await api.updateExpense(id, payload);
        const expense = {
          ...updated,
          id: updated.id ?? id,
        } as Expense;

        setExpenses((prev) => prev.map((e) => (e.id === id ? expense : e)));
        showNotification({
          title: "Expense Updated",
          message: "Expense has been updated",
          color: "blue",
        });
        return expense;
      } catch (err: any) {
        console.error("Update expense failed:", err);
        setExpensesError(err.message || "Failed to update expense");
        showNotification({
          title: "Update Failed",
          message: err.message || "Failed to update expense",
          color: "red",
        });
        throw err;
      } finally {
        setExpensesLoading(false);
      }
    },
    []
  );

  const deleteExpenseItem = useCallback(async (id: string) => {
    setExpensesLoading(true);
    try {
      await api.deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      showNotification({
        title: "Expense Deleted",
        message: "Expense has been removed",
        color: "orange",
      });
    } catch (err: any) {
      console.error("Delete expense failed:", err);
      setExpensesError(err.message || "Failed to delete expense");
      showNotification({
        title: "Delete Failed",
        message: err.message || "Failed to delete expense",
        color: "red",
      });
      throw err;
    } finally {
      setExpensesLoading(false);
    }
  }, []);

  // ===== CATEGORY CRUD (already exists above, keeping references) =====
  const createCategory = useCallback(
    async (name: string) => {
      const v = name.trim();
      if (!v) return;
      setCategoriesLoading(true);
      try {
        await api.createCategory({ name: v });
        // Refresh categories from backend to get authoritative list
        if (typeof loadCategories === "function") await loadCategories();
        showNotification({
          title: "Category Added",
          message: `Category '${v}' added`,
          color: "green",
        });
      } catch (err) {
        setCategoriesError(String(err));
        showNotification({
          title: "Category Creation Failed",
          message: String(err),
          color: "red",
        });
      } finally {
        setCategoriesLoading(false);
      }
    },
    [loadCategories]
  );

  const updateCategory = useCallback(
    async (oldName: string, newName: string) => {
      const v = newName.trim();
      if (!v || oldName === v) return;
      setCategoriesLoading(true);
      try {
        const cats = (await api.getCategories()) as Array<{
          id?: string | number;
          name?: string;
        }>;
        const categoryToRename = cats.find((c) => c.name === oldName);
        const renameId =
          (categoryToRename &&
            (categoryToRename.id ?? (categoryToRename as any)._id)) ||
          undefined;
        if (renameId) {
          await api.updateCategory(renameId, { name: v });
          if (typeof loadCategories === "function") await loadCategories();
          showNotification({
            title: "Renamed",
            message: `'${oldName}' → '${v}'`,
            color: "blue",
          });
        } else {
          throw new Error("Category not found on backend");
        }
      } catch (err) {
        setCategoriesError(String(err));
        showNotification({
          title: "Category Rename Failed",
          message: String(err),
          color: "red",
        });
      } finally {
        setCategoriesLoading(false);
      }
    },
    [loadCategories]
  );

  const deleteCategoryItem = useCallback(
    async (name: string) => {
      setCategoriesLoading(true);
      try {
        const cats = (await api.getCategories()) as Array<{
          id?: string | number;
          name?: string;
        }>;
        const categoryToDelete = cats.find((c) => c.name === name);
        const delId =
          (categoryToDelete &&
            (categoryToDelete.id ?? (categoryToDelete as any)._id)) ||
          undefined;
        if (delId) {
          await api.deleteCategory(delId);
          if (typeof loadCategories === "function") await loadCategories();
          showNotification({
            title: "Category Deleted",
            message: `Category '${name}' removed`,
            color: "orange",
          });
        } else {
          throw new Error("Category not found on backend");
        }
      } catch (err) {
        setCategoriesError(String(err));
        showNotification({
          title: "Category Deletion Failed",
          message: String(err),
          color: "red",
        });
      } finally {
        setCategoriesLoading(false);
      }
    },
    [loadCategories]
  );

  // ===== LEGACY ALIASES FOR BACKWARD COMPATIBILITY =====
  const addCategory = useCallback(
    async (name: string) => {
      return createCategory(name);
    },
    [createCategory]
  );

  const renameCategory = useCallback(
    async (oldName: string, newName: string) => {
      return updateCategory(oldName, newName);
    },
    [updateCategory]
  );

  const addExpense = (e: ExpenseInput) => {
    // create local record first for optimistic UI
    const record: Expense = {
      id:
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `exp-${Date.now()}`,
      createdAt: new Date(),
      ...e,
    };
    setExpenses((prev) => [record, ...(prev || [])]);

    // attempt to persist to backend if available
    (async () => {
      try {
        const created = await api.createExpense(e as ExpenseInput);
        // replace optimistic record with server-supplied record if it returns an id
        setExpenses((prev) => [
          created,
          ...(prev || []).filter((x) => x.id !== record.id),
        ]);
      } catch (err) {
        // keep optimistic record and surface errors via a notification
        showNotification({
          title: "Expense Persist Failed",
          message: String(err),
          color: "red",
        });
      }
    })();

    return record;
  };

  // Refresh all primary data from backend (if available)
  async function refreshFromBackend() {
    // if a refresh is already in-flight, return the same promise (single-flight)
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    refreshPromiseRef.current = (async () => {
      try {
        // Fetch only categories on initial refresh. Other datasets are
        // loaded lazily by pages (inventory/customers/colors/sales/etc.).
        const cat = await api.getCategories();

        // helper to normalize responses that might be:
        // - an array
        // - an object with a `data` array
        // - an object that contains any array property (e.g. { categories: [...] })
        // This makes the client tolerant to different backend wrappers.

        const warnings: string[] = [];
        const maybeWarn = (name: string, v: unknown) => {
          const w = validateArrayResponse(name, v);
          if (w) warnings.push(w);
        };

        // Validate categories response
        maybeWarn("categories", cat);

        setApiWarnings(warnings);

        // heavy datasets left untouched here; they should be loaded lazily
        // by their respective pages or by an explicit refresh.
        // Convert category payloads to string array. Accept either an array of
        // strings (e.g. ["Sections"]) or an array of objects { id, name }.
        const rawCats = normalizeResponse(cat) as unknown[];

        // more tolerant mapping: accept string entries or objects with a
        // common name-like property (name/title/category/label/value) or
        // fallback to id when present.
        const categoryNames = rawCats
          .map((c) => {
            if (!c) return "";
            if (typeof c === "string") return c;
            if (typeof c === "object") {
              const o = c as { [k: string]: unknown };
              // try common name fields
              const nameFields = [
                "name",
                "title",
                "category",
                "label",
                "value",
              ];
              for (const f of nameFields) {
                const v = o[f];
                if (typeof v === "string" && v.trim()) return v;
              }
              // fallback to id (some backends use `_id`)
              if (o.id !== undefined && o.id !== null) return String(o.id);
              if (o._id !== undefined && o._id !== null) return String(o._id);
            }
            return "";
          })
          .map((s) => (typeof s === "string" ? s.trim() : ""))
          .filter(Boolean);

        // (sample-keys diagnostics removed to reduce console noise)

        // (dev logging removed) - keep implementation silent in production and
        // development to avoid noisy console output. Diagnostics were useful
        // during development but were producing too many logs in the UI.

        // Set categories from backend (authoritative).
        setCategories(categoryNames);
        setIsBackendAvailable(true);
        return true;
      } catch (err) {
        showNotification({
          title: "Backend Refresh Failed",
          message: "Using local data — " + String(err),
          color: "orange",
        });
        setIsBackendAvailable(false);
        return false;
      } finally {
        // clear the ref so future refreshes can run
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }

  // Do not auto-refresh from backend on mount: categories and heavy datasets
  // are loaded lazily by pages via the `load*` helpers (e.g. loadCategories,
  // loadInventory). This prevents duplicate network requests when modals
  // mount/unmount frequently during development.

  // Lazy loader helpers exposed to pages so they can fetch datasets only when
  // the page is navigated to.
  const loadSales = async () => {
    if (loaderLoadedRef.current["sales"]) {
      if (import.meta.env.MODE !== "production") {
        // eslint-disable-next-line no-console
        console.debug(
          "[DataContext] loadSales: already loaded — skipping fetch"
        );
      }
      return sales;
    }
    return runLoader("sales", api.getSales, (v) => {
      setSales(normalizeResponse(v) as SaleRecord[]);
    });
  };

  const loadPurchases = async () => {
    if (loaderLoadedRef.current["purchases"]) {
      if (import.meta.env.MODE !== "production") {
        // eslint-disable-next-line no-console
        console.debug(
          "[DataContext] loadPurchases: already loaded — skipping fetch"
        );
      }
      return purchases;
    }
    return runLoader("purchases", api.getPurchases, (v) => {
      setPurchases(normalizeResponse(v) as PurchaseRecord[]);
    });
  };

  const loadGrns = async () => {
    if (loaderLoadedRef.current["grns"]) {
      if (import.meta.env.MODE !== "production") {
        // eslint-disable-next-line no-console
        console.debug(
          "[DataContext] loadGrns: already loaded — skipping fetch"
        );
      }
      return grns;
    }
    return runLoader("grns", api.getGRNs, (v) => {
      setGrns(normalizeResponse(v) as GRNRecord[]);
    });
  };

  const loadPurchaseReturns = async () => {
    if (loaderLoadedRef.current["purchaseReturns"]) {
      if (import.meta.env.MODE !== "production") {
        // eslint-disable-next-line no-console
        console.debug(
          "[DataContext] loadPurchaseReturns: already loaded — skipping fetch"
        );
      }
      return purchaseReturns;
    }
    return runLoader("purchaseReturns", api.getPurchaseReturns, (v) => {
      setPurchaseReturns(normalizeResponse(v) as PurchaseReturnRecord[]);
    });
  };

  const loadExpenses = async () => {
    if (loaderLoadedRef.current["expenses"]) {
      if (import.meta.env.MODE !== "production") {
        // eslint-disable-next-line no-console
        console.debug(
          "[DataContext] loadExpenses: already loaded — skipping fetch"
        );
      }
      return expenses;
    }
    return runLoader("expenses", api.getExpenses, (v) => {
      setExpenses(normalizeResponse(v) as Expense[]);
    });
  };

  // On a full page reload, perform the primary GETs so the app has fresh
  // data. We detect a reload using the Navigation Timing API where available
  // to avoid triggering on HMR or SPA navigations. This intentionally runs
  // the lazy loaders concurrently and relies on runLoader to coalesce
  // duplicate requests.
  useEffect(() => {
    const isReload = (() => {
      try {
        const nav = (
          performance && (performance as any).getEntriesByType
            ? (performance as any).getEntriesByType("navigation")
            : null
        ) as any;
        if (nav && nav.length && nav[0].type) return nav[0].type === "reload";
        // legacy fallback
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (
          (performance as any).navigation &&
          (performance as any).navigation.type === 1
        )
          return true;
      } catch (e) {
        /* ignore */
      }
      return false;
    })();

    if (!isReload) return undefined;

    // Run all important loaders concurrently. runLoader will avoid
    // duplicate in-flight requests when pages/components request the same
    // datasets.
    (async () => {
      try {
        await Promise.all([
          typeof loadCategories === "function"
            ? loadCategories()
            : Promise.resolve(),
          typeof loadInventory === "function"
            ? loadInventory()
            : Promise.resolve(),
          typeof loadCustomers === "function"
            ? loadCustomers()
            : Promise.resolve(),
          typeof loadSales === "function" ? loadSales() : Promise.resolve(),
          typeof loadPurchases === "function"
            ? loadPurchases()
            : Promise.resolve(),
          typeof loadGrns === "function" ? loadGrns() : Promise.resolve(),
          typeof loadPurchaseReturns === "function"
            ? loadPurchaseReturns()
            : Promise.resolve(),
          typeof loadExpenses === "function"
            ? loadExpenses()
            : Promise.resolve(),
        ]);
      } catch (err) {
        // swallow — individual loaders surface errors via notifications where
        // appropriate. We don't want a failed background refresh to crash the
        // provider.
      }
    })();

    return undefined;
  }, [
    loadCategories,
    loadInventory,
    loadCustomers,
    loadSales,
    loadPurchases,
    loadGrns,
    loadPurchaseReturns,
    loadExpenses,
  ]);

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
        // ===== INVENTORY MODULE =====
        inventory,
        inventoryLoading,
        inventoryError,
        setInventory,
        loadInventory,
        createInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,

        // ===== CATEGORIES MODULE =====
        categories,
        categoriesLoading,
        categoriesError,
        setCategories,
        categoriesForSelect,
        loadCategories,
        createCategory,
        updateCategory,
        deleteCategory: deleteCategoryItem,
        addCategory, // Legacy alias
        renameCategory, // Legacy alias

        // ===== CUSTOMERS MODULE =====
        customers,
        customersLoading,
        customersError,
        setCustomers,
        loadCustomers,
        createCustomer,
        updateCustomer,
        deleteCustomer,

        // ===== SALES MODULE =====
        sales,
        salesLoading,
        salesError,
        setSales,
        loadSales,
        createSale,
        updateSale,
        deleteSale,

        // ===== PURCHASES MODULE =====
        purchases,
        purchasesLoading,
        purchasesError,
        setPurchases,
        loadPurchases,
        createPurchase,
        updatePurchase,
        deletePurchase,

        // ===== GRN MODULE =====
        grns,
        grnsLoading,
        grnsError,
        setGrns,
        loadGrns,
        createGrn,
        applyGrnToInventory,
        updatePurchaseFromGrn,

        // ===== PURCHASE RETURNS MODULE =====
        purchaseReturns,
        purchaseReturnsLoading,
        purchaseReturnsError,
        setPurchaseReturns,
        loadPurchaseReturns,
        createPurchaseReturn,
        applyPurchaseReturnToInventory,
        updatePurchaseFromReturn,
        processPurchaseReturn,

        // ===== EXPENSES MODULE =====
        expenses,
        expensesLoading,
        expensesError,
        setExpenses,
        loadExpenses,
        createExpense,
        updateExpense: updateExpenseItem,
        deleteExpense: deleteExpenseItem,
        addExpense,

        // ===== COLORS (Static) =====
        colors,

        // ===== QUOTATIONS =====

        // ===== QUOTATIONS =====
        quotations,
        setQuotations,

        // ===== SUPPLIER CREDITS =====
        supplierCredits,
        setSupplierCredits,

        // ===== BACKEND STATUS =====
        refreshFromBackend,
        isBackendAvailable,
        apiWarnings,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export function useDataContext() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    // Provide richer diagnostics to help with HMR / duplicate-react issues
    const location =
      typeof window !== "undefined" ? window.location.href : "<unknown>";
    const mode = import.meta && (import.meta.env || ({} as any)).MODE;
    throw new Error(
      `useDataContext must be used within a DataProvider. Current location: ${location}. Build mode: ${
        mode || "unknown"
      }. If you see this during development, try a full page reload or restart the dev server (npm run dev) — HMR can sometimes produce duplicate module instances which break React context.`
    );
  }
  return ctx;
}
