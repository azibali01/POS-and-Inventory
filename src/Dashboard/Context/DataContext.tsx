/* eslint-disable react-refresh/only-export-components */
import React, {
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { showNotification } from "@mantine/notifications";
import * as api from "../../api";
import { useAuth } from "../../Auth/Context/AuthContext";
import { validateArrayResponse } from "../../lib/validate-api";
import { logger } from "../../lib/logger";
import { useSupplier } from "../../hooks";

// Import types from centralized module
import type {
  SaleRecord,
  PurchaseRecord,
  PurchaseInvoiceRecord,
  GRNRecord,
  PurchaseReturnRecord,
  SupplierCreditRecord,
  Expense,
  ExpenseInput,
  ReceiptVoucher,
  PaymentVoucher,
  Color,
} from "../../types";
import { toSuppliers } from "../../utils/typeMappers";
import type { Supplier } from "../../components/purchase/SupplierForm";

// Re-export types for backward compatibility
export type {
  InventoryItem,
  Customer,
  CustomerInput,
  SaleRecord,
  PurchaseRecord,
  PurchaseInvoiceRecord,
  GRNRecord,
  PurchaseReturnRecord,
  SupplierCreditRecord,
  Expense,
  ExpenseInput,
  ReceiptVoucher,
  PaymentVoucher,
  Color,
} from "../../types";

interface DataContextType {
  // ===== CATEGORIES MODULE =====
  categories: string[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  categoriesForSelect: Array<{ value: string; label: string }>;
  loadCategories: () => Promise<string[]>;
  createCategory: (name: string) => Promise<void>;
  updateCategory: (oldName: string, newName: string) => Promise<void>;
  deleteCategory: (name: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  renameCategory: (oldName: string, newName: string) => Promise<void>;

  // ===== SALES MODULE =====
  sales: SaleRecord[];
  salesLoading: boolean;
  salesError: string | null;
  setSales: React.Dispatch<React.SetStateAction<SaleRecord[]>>;
  loadSales: () => Promise<SaleRecord[]>;
  createSale: (
    payload: api.SaleRecordPayload | SaleRecord,
  ) => Promise<SaleRecord>;
  updateSale: (
    invoiceNumber: string,
    payload: Partial<api.SaleRecordPayload>,
  ) => Promise<SaleRecord>;
  deleteSale: (invoiceNumber: string) => Promise<void>;

  // ===== PURCHASES MODULE =====
  purchases: PurchaseRecord[];
  purchasesLoading: boolean;
  purchasesError: string | null;
  setPurchases: React.Dispatch<React.SetStateAction<PurchaseRecord[]>>;
  loadPurchases: () => Promise<PurchaseRecord[]>;
  createPurchase: (
    payload: api.PurchaseRecordPayload,
  ) => Promise<PurchaseRecord>;
  updatePurchase: (
    id: string | number,
    payload: Partial<api.PurchaseRecordPayload>,
  ) => Promise<PurchaseRecord>;
  deletePurchase: (id: string | number) => Promise<void>;

  // ===== PURCHASE INVOICES MODULE =====
  purchaseInvoices: PurchaseInvoiceRecord[];
  purchaseInvoicesLoading: boolean;
  purchaseInvoicesError: string | null;
  setPurchaseInvoices: React.Dispatch<
    React.SetStateAction<PurchaseInvoiceRecord[]>
  >;
  loadPurchaseInvoices: () => Promise<PurchaseInvoiceRecord[]>;

  // ===== GRN MODULE =====
  grns: GRNRecord[];
  grnsLoading: boolean;
  grnsError: string | null;
  setGrns: React.Dispatch<React.SetStateAction<GRNRecord[]>>;
  loadGrns: () => Promise<GRNRecord[]>;
  createGrn: (payload: api.GRNRecordPayload) => Promise<GRNRecord>;
  applyGrnToInventory: (grn: GRNRecord) => void;
  updatePurchaseFromGrn: (grn: GRNRecord) => void;

  // ===== PURCHASE RETURNS MODULE =====
  purchaseReturns: PurchaseReturnRecord[];
  purchaseReturnsLoading: boolean;
  purchaseReturnsError: string | null;
  setPurchaseReturns: React.Dispatch<
    React.SetStateAction<PurchaseReturnRecord[]>
  >;
  loadPurchaseReturns: () => Promise<PurchaseReturnRecord[]>;
  createPurchaseReturn: (
    payload: api.PurchaseReturnRecordPayload,
  ) => Promise<PurchaseReturnRecord>;
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
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  loadExpenses: () => Promise<Expense[]>;
  createExpense: (payload: ExpenseInput) => Promise<Expense>;
  updateExpense: (id: string, payload: Partial<Expense>) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  addExpense: (e: ExpenseInput) => Expense;

  // ===== RECEIPT VOUCHERS MODULE =====
  receiptVouchers: ReceiptVoucher[];
  receiptVouchersLoading: boolean;
  receiptVouchersError: string | null;
  setReceiptVouchers: React.Dispatch<React.SetStateAction<ReceiptVoucher[]>>;
  loadReceiptVouchers: () => Promise<ReceiptVoucher[]>;

  // ===== PAYMENT VOUCHERS MODULE =====
  paymentVouchers: PaymentVoucher[];
  paymentVouchersLoading: boolean;
  paymentVouchersError: string | null;
  setPaymentVouchers: React.Dispatch<React.SetStateAction<PaymentVoucher[]>>;
  loadPaymentVouchers: () => Promise<PaymentVoucher[]>;

  // ===== COLORS MODULE =====
  colors: Color[];
  colorsLoading: boolean;
  colorsError: string | null;
  setColors: React.Dispatch<React.SetStateAction<Color[]>>;
  loadColors: () => Promise<Color[]>;
  createColor: (payload: Color) => Promise<Color>;
  updateColor: (id: string, payload: Partial<Color>) => Promise<Color>;
  deleteColor: (id: string) => Promise<void>;
  colorsForSelect: Array<{ value: string; label: string }>;

  // ===== QUOTATIONS =====
  quotations: api.QuotationRecordPayload[];
  loadQuotations: () => Promise<api.QuotationRecordPayload[]>;
  setQuotations: React.Dispatch<
    React.SetStateAction<api.QuotationRecordPayload[]>
  >;

  // ===== SUPPLIER CREDITS =====
  supplierCredits: SupplierCreditRecord[];
  setSupplierCredits: React.Dispatch<
    React.SetStateAction<SupplierCreditRecord[]>
  >;

  // ===== BACKEND STATUS =====
  refreshFromBackend: () => Promise<boolean>;
  isBackendAvailable: boolean;
  apiWarnings: string[];
}

type MutableRefState<T> = {
  current: T;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function toOptionalStringId(value: unknown): string | undefined {
  return typeof value === "string"
    ? value
    : typeof value === "number"
      ? String(value)
      : undefined;
}

function toIsoDateString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return undefined;
}

function normalizeCustomerInput(
  customer: unknown,
): api.CustomerPayload | undefined {
  if (Array.isArray(customer)) {
    return normalizeCustomerInput(customer[0]);
  }

  if (typeof customer === "string" && customer.trim()) {
    return { name: customer.trim() };
  }

  const record = asRecord(customer);
  if (!record) {
    return undefined;
  }

  const name = typeof record.name === "string" ? record.name.trim() : "";
  if (!name) {
    return undefined;
  }

  return {
    _id: toOptionalStringId(record._id),
    id: toOptionalStringId(record.id),
    name,
    phone: typeof record.phone === "string" ? record.phone : undefined,
    address: typeof record.address === "string" ? record.address : undefined,
    city: typeof record.city === "string" ? record.city : undefined,
    openingAmount:
      typeof record.openingAmount === "number"
        ? record.openingAmount
        : undefined,
    creditLimit:
      typeof record.creditLimit === "number" ? record.creditLimit : undefined,
    paymentType:
      record.paymentType === "Credit" || record.paymentType === "Debit"
        ? record.paymentType
        : undefined,
  };
}

function toSaleCustomers(
  customer: unknown,
  fallbackCustomerName?: string,
): Array<{ id?: string | number; name: string }> {
  const normalizedCustomer = normalizeCustomerInput(customer);
  if (normalizedCustomer?.name) {
    return [
      {
        id: normalizedCustomer.id ?? normalizedCustomer._id,
        name: normalizedCustomer.name,
      },
    ];
  }

  if (fallbackCustomerName?.trim()) {
    return [{ name: fallbackCustomerName.trim() }];
  }

  return [];
}

function toSaleRecordValue(
  sale: api.SaleRecordPayload,
  fallbackCustomerName?: string,
): SaleRecord {
  const customer = toSaleCustomers(sale.customer, fallbackCustomerName);
  const customerName =
    customer.length > 0
      ? customer[0].name
      : (fallbackCustomerName?.trim() ?? "");
  return {
    ...sale,
    date: sale.date ?? sale.invoiceDate ?? "",
    quotationDate: sale.quotationDate ?? sale.invoiceDate ?? "",
    customerId: sale.customer?.id ?? sale.customer?._id,
    total: sale.amount ?? sale.totalNetAmount,
    status: sale.status ?? "",
    id: sale.invoiceNumber ?? sale.id ?? `sale-${String(Date.now())}`,
    customer,
    customerName,
  };
}

function withSupplierRecord<T extends Record<string, unknown>>(
  record: T,
  suppliers: Supplier[],
): T {
  const supplierRecord = asRecord(record.supplier);
  if (supplierRecord && toOptionalStringId(supplierRecord._id)) {
    return record;
  }

  const supplierId = toOptionalStringId(record.supplierId);
  if (!supplierId) {
    return record;
  }

  const found = suppliers.find((supplier) => supplier._id === supplierId);
  return found ? ({ ...record, supplier: found } as T) : record;
}

function toReceiptVoucher(value: unknown): ReceiptVoucher {
  const voucher = asRecord(value) ?? {};
  return {
    id:
      toOptionalStringId(voucher._id) ??
      toOptionalStringId(voucher.id) ??
      (typeof voucher.voucherNumber === "string" ? voucher.voucherNumber : ""),
    voucherNumber:
      typeof voucher.voucherNumber === "string" ? voucher.voucherNumber : "",
    voucherDate:
      typeof voucher.voucherDate === "string" ||
      voucher.voucherDate instanceof Date
        ? voucher.voucherDate
        : new Date(),
    receivedFrom:
      typeof voucher.receivedFrom === "string" ? voucher.receivedFrom : "",
    amount: typeof voucher.amount === "number" ? voucher.amount : 0,
    referenceNumber:
      typeof voucher.referenceNumber === "string"
        ? voucher.referenceNumber
        : typeof voucher.reference === "string"
          ? voucher.reference
          : "",
    paymentMode:
      typeof voucher.paymentMode === "string" ? voucher.paymentMode : "",
    remarks: typeof voucher.remarks === "string" ? voucher.remarks : "",
  };
}

function toPaymentVoucher(value: unknown): PaymentVoucher {
  const voucher = asRecord(value) ?? {};
  return {
    id:
      toOptionalStringId(voucher._id) ??
      toOptionalStringId(voucher.id) ??
      (typeof voucher.voucherNumber === "string" ? voucher.voucherNumber : ""),
    voucherNumber:
      typeof voucher.voucherNumber === "string" ? voucher.voucherNumber : "",
    voucherDate:
      typeof voucher.voucherDate === "string" ||
      voucher.voucherDate instanceof Date
        ? voucher.voucherDate
        : new Date(),
    paidTo: typeof voucher.paidTo === "string" ? voucher.paidTo : "",
    amount: typeof voucher.amount === "number" ? voucher.amount : 0,
    referenceNumber:
      typeof voucher.referenceNumber === "string"
        ? voucher.referenceNumber
        : typeof voucher.reference === "string"
          ? voucher.reference
          : "",
    paymentMode:
      typeof voucher.paymentMode === "string" ? voucher.paymentMode : "",
    remarks: typeof voucher.remarks === "string" ? voucher.remarks : "",
  };
}

function useRunLoader(
  loaderPromisesRef: MutableRefState<Record<string, Promise<unknown> | null>>,
  loaderLoadedRef: MutableRefState<Record<string, boolean>>,
  normalizeResponse: (v: unknown) => unknown[],
) {
  return useCallback(
    (
      key: string,
      fn: () => Promise<unknown>,
      setter: (v: unknown[]) => void,
    ) => {
      if (loaderPromisesRef.current[key]) {
        if (import.meta.env.MODE !== "production") {
          try {
            const trace = new Error().stack || "";

            logger.debug(
              `[DataContext] runLoader: reusing in-flight loader "${key}"`,
              trace.split("\n").slice(2, 6),
            );
          } catch {
            logger.debug(
              `[DataContext] runLoader: reusing in-flight loader "${key}"`,
            );
          }
        }
        return loaderPromisesRef.current[key];
      }
      if (import.meta.env.MODE !== "production") {
        try {
          const trace = new Error().stack || "";

          logger.debug(
            `[DataContext] runLoader: starting loader "${key}"`,
            trace.split("\n").slice(2, 8),
          );
        } catch {
          logger.debug(`[DataContext] runLoader: starting loader "${key}"`);
        }
      }
      loaderPromisesRef.current[key] = (async () => {
        try {
          const res = await fn();
          const arr = normalizeResponse(res);
          setter(arr);
          loaderLoadedRef.current[key] = true;
          return arr;
        } finally {
          loaderPromisesRef.current[key] = null;
        }
      })();
      return loaderPromisesRef.current[key];
    },
    [loaderPromisesRef, loaderLoadedRef, normalizeResponse],
  );
}

const DataContext = React.createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  // ===== REFS =====
  const loaderPromisesRef = useRef<Record<string, Promise<unknown> | null>>({});
  const loaderLoadedRef = useRef<Record<string, boolean>>({});
  const refreshPromiseRef = useRef<Promise<boolean> | null>(null);

  // Helper to normalize API responses (array, {data: []}, {items: []}, etc.)
  function normalizeResponse(v: unknown): unknown[] {
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object") {
      if (Array.isArray((v as Record<string, unknown>).data))
        return (v as Record<string, unknown>).data as unknown[];
      const arrProp = Object.values(v).find((val) => Array.isArray(val));
      if (arrProp) return arrProp as unknown[];
    }
    return [];
  }

  // Memoized runLoader using useRunLoader
  const runLoader = useRunLoader(
    loaderPromisesRef,
    loaderLoadedRef,
    normalizeResponse,
  );

  const supplierHook = useSupplier();
  const suppliers = React.useMemo<Supplier[]>(
    () => toSuppliers(supplierHook.suppliers),
    [supplierHook.suppliers],
  );

  // ===== INVENTORY LOADER (Migrated to InventoryContext) =====
  // const loadInventory = async () => { ... }

  // Auto-load inventory on mount (Migrated to InventoryContext)
  // useEffect(() => {
  //   if (isAuthenticated) loadInventory();
  // }, [isAuthenticated]);

  // ===== INVENTORY STATE (Migrated to InventoryContext) =====
  // const [inventory, setInventory] = useState<InventoryItem[]>([]);
  // const [inventoryLoading, setInventoryLoading] = useState(false);
  // const [inventoryError, setInventoryError] = useState<string | null>(null);
  // ===== CATEGORIES STATE =====
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  // ===== SALES STATE =====
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState<string | null>(null);
  // ===== PURCHASES STATE =====
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [purchasesError, setPurchasesError] = useState<string | null>(null);
  // ===== PURCHASE INVOICES STATE =====
  const [purchaseInvoices, setPurchaseInvoices] = useState<
    PurchaseInvoiceRecord[]
  >([]);
  const [purchaseInvoicesLoading] = useState(false);
  const [purchaseInvoicesError] = useState<string | null>(null);
  // ===== GRN STATE =====
  const [grns, setGrns] = useState<GRNRecord[]>([]);
  const [grnsLoading, setGrnsLoading] = useState(false);
  const [grnsError, setGrnsError] = useState<string | null>(null);
  // ===== PURCHASE RETURNS STATE =====
  const [purchaseReturns, setPurchaseReturns] = useState<
    PurchaseReturnRecord[]
  >([]);
  const [purchaseReturnsLoading, setPurchaseReturnsLoading] = useState(false);
  const [purchaseReturnsError, setPurchaseReturnsError] = useState<
    string | null
  >(null);
  // ===== EXPENSES STATE =====
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [expensesError, setExpensesError] = useState<string | null>(null);
  // ===== RECEIPT VOUCHERS STATE =====
  const [receiptVouchers, setReceiptVouchers] = useState<ReceiptVoucher[]>([]);
  const [receiptVouchersLoading] = useState(false);
  const [receiptVouchersError] = useState<string | null>(null);
  // ===== PAYMENT VOUCHERS STATE =====
  const [paymentVouchers, setPaymentVouchers] = useState<PaymentVoucher[]>([]);
  const [paymentVouchersLoading] = useState(false);
  const [paymentVouchersError] = useState<string | null>(null);
  // ===== QUOTATIONS STATE =====
  const [quotations, setQuotations] = useState<api.QuotationRecordPayload[]>(
    [],
  );
  // ===== SUPPLIER CREDITS STATE =====
  const [supplierCredits, setSupplierCredits] = useState<
    SupplierCreditRecord[]
  >([]);
  // ===== BACKEND STATUS =====
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);
  const [apiWarnings, setApiWarnings] = useState<string[]>([]);
  // ===== COLORS STATE =====
  const [colors, setColors] = useState<Color[]>([]);
  const [colorsLoading, setColorsLoading] = useState(false);
  const [colorsError, setColorsError] = useState<string | null>(null);
  // ===== MEMOIZED SELECTS =====
  const categoriesForSelect = React.useMemo(() => {
    const filtered = categories
      .filter((c) => typeof c === "string" && c.trim().length > 0)
      .map((c) => ({
        value: c.trim(),
        label: c.trim(),
      }));
    return filtered;
  }, [categories]);

  const loadCategories = useCallback(async () => {
    if (loaderLoadedRef.current["categories"]) {
      return categories;
    }
    return runLoader("categories", api.getCategories, (v) => {
      const raw = normalizeResponse(v);
      const categoryNames = raw
        .map((c) => {
          if (!c) return "";
          if (typeof c === "string") return c;
          if (typeof c === "object") {
            const o = c as { [k: string]: unknown };
            const nameFields = ["name", "title", "category", "label", "value"];
            for (const f of nameFields) {
              const vv = o[f];
              if (typeof vv === "string" && vv.trim()) return vv;
            }
            const id = toOptionalStringId(o.id) ?? toOptionalStringId(o._id);
            if (id) return id;
          }
          return "";
        })
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter((name) => Boolean(name) && name.length > 0);
      setCategories(categoryNames);
      return categoryNames;
    }) as Promise<string[]>;
  }, [runLoader, categories]);

  // Auto-load categories on mount
  useEffect(() => {
    if (isAuthenticated) {
      void loadCategories();
    }
  }, [isAuthenticated, loadCategories]);

  // ===== COLORS LOADER =====
  const loadColors = useCallback(async () => {
    if (loaderLoadedRef.current["colors"]) {
      return colors;
    }
    setColorsLoading(true);
    setColorsError(null);
    try {
      const data = await api.getColors();
      const mapped: Color[] = data.map((c) => ({
        _id: toOptionalStringId(c._id ?? c.id),
        id: toOptionalStringId(c.id ?? c._id),
        name: c.name,
        description: c.description,
      }));
      setColors(mapped);
      loaderLoadedRef.current["colors"] = true;
      return mapped;
    } catch (err: unknown) {
      setColorsError((err as Error).message || "Failed to load colors");
      showNotification({
        title: "Load Colors Failed",
        message: (err as Error).message || "Failed to load colors",
        color: "red",
      });
      return [];
    } finally {
      setColorsLoading(false);
    }
  }, [colors]);

  // Auto-load colors on mount
  useEffect(() => {
    if (isAuthenticated) {
      void loadColors();
    }
  }, [isAuthenticated, loadColors]);

  // ===== COLORS CRUD FUNCTIONS =====
  const createColor = useCallback(async (payload: Color) => {
    setColorsLoading(true);
    try {
      const created = await api.createColor(payload);
      const color: Color = {
        _id: toOptionalStringId(created._id ?? created.id),
        id: toOptionalStringId(created.id ?? created._id),
        name: created.name,
        description: created.description,
      };
      setColors((prev) => [...prev, color]);
      showNotification({
        title: "Color Created",
        message: `${payload.name} has been added`,
        color: "green",
      });
      return color;
    } catch (err: unknown) {
      logger.error("Create color failed:", err);
      setColorsError((err as Error).message || "Failed to create color");
      showNotification({
        title: "Create Failed",
        message: (err as Error).message || "Failed to create color",
        color: "red",
      });
      throw err;
    } finally {
      setColorsLoading(false);
    }
  }, []);

  const updateColor = useCallback(
    async (id: string, payload: Partial<Color>) => {
      setColorsLoading(true);
      try {
        const updated = await api.updateColor(id, payload);
        const color: Color = {
          _id: toOptionalStringId(updated._id ?? updated.id ?? id),
          id: toOptionalStringId(updated.id ?? updated._id ?? id),
          name: updated.name,
          description: updated.description,
        };
        setColors((prev) =>
          prev.map((c) => (c._id === id || c.id === id ? color : c)),
        );
        showNotification({
          title: "Color Updated",
          message: "Color has been updated successfully",
          color: "blue",
        });
        return color;
      } catch (err: unknown) {
        logger.error("Update color failed:", err);
        setColorsError((err as Error).message || "Failed to update color");
        showNotification({
          title: "Update Failed",
          message: (err as Error).message || "Failed to update color",
          color: "red",
        });
        throw err;
      } finally {
        setColorsLoading(false);
      }
    },
    [],
  );

  const deleteColor = useCallback(async (id: string) => {
    setColorsLoading(true);
    try {
      await api.deleteColor(id);
      setColors((prev) => prev.filter((c) => c._id !== id && c.id !== id));
      showNotification({
        title: "Color Deleted",
        message: "Color has been removed",
        color: "orange",
      });
    } catch (err: unknown) {
      const message = (err as Error).message || "Failed to delete color";
      logger.error("Delete color failed:", err);
      setColorsError(message);
      showNotification({
        title: "Delete Failed",
        message,
        color: "red",
      });
      throw err;
    } finally {
      setColorsLoading(false);
    }
  }, []);

  // Memoized select options for colors
  const colorsForSelect = React.useMemo(() => {
    const filtered = colors
      .filter((c) => c.name.trim().length > 0)
      .map((c) => ({
        value: c.name.trim(),
        label: c.name.trim(),
      }));
    return filtered;
  }, [colors]);

  // ===== INVENTORY CRUD FUNCTIONS (Migrated to InventoryContext) =====
  // const createInventoryItem = ...
  // const updateInventoryItem = ...
  // const deleteInventoryItem = ...

  // ===== SALES CRUD FUNCTIONS =====
  const createSale = useCallback(
    async (payload: api.SaleRecordPayload | SaleRecord) => {
      setSalesLoading(true);
      try {
        const payloadRecord = asRecord(payload);
        const normalizedCustomer = normalizeCustomerInput(payload.customer);
        const fallbackCustomerName =
          "customerName" in payload && typeof payload.customerName === "string"
            ? payload.customerName
            : undefined;

        const apiPayload: api.SaleRecordPayload = {
          invoiceNumber: payload.invoiceNumber,
          invoiceDate: toIsoDateString(payload.invoiceDate) ?? "",
          items: Array.isArray(payloadRecord?.items)
            ? (payloadRecord.items as api.InventoryItemPayload[])
            : undefined,
          products: payload.products,
          subTotal: payload.subTotal,
          totalGrossAmount: payload.totalGrossAmount,
          totalNetAmount: payload.totalNetAmount,
          totalDiscount: payload.totalDiscount,
          amount: payload.amount,
          remarks: payload.remarks,
          length: payload.length,
          paymentMethod: payload.paymentMethod,
          status: payload.status,
          quotationDate:
            typeof payload.quotationDate === "string"
              ? payload.quotationDate
              : payload.quotationDate instanceof Date
                ? payload.quotationDate.toISOString()
                : undefined,
          customer: normalizedCustomer,
          date: toIsoDateString(payload.date),
        };
        const created = await api.createSale(apiPayload);

        logger.debug("Create sale response:", created);
        const sale = toSaleRecordValue(created, fallbackCustomerName);

        setSales((prev) => [sale, ...prev]);
        showNotification({
          title: "Sale Created",
          message: "Sale has been recorded successfully",
          color: "green",
        });
        // Update inventory quantities locally to reflect the sale
        // Inventory update migrated to InventoryContext
        /*
        try {
          const soldItems: any[] =
            (payload as any)?.items ||
            (payload as any)?.products ||
            (created)?.items ||
            [];
          if (Array.isArray(soldItems) && soldItems.length > 0) {
            // setInventory logic removed
            // The original code had a complex setInventory update here.
            // It's being commented out as per instruction.
            // Example of what was here:
            // setInventory((prev) =>
            //   prev.map((inv) => {
            //     const match = soldItems.find((it: any) => {
            //       const key = String(
            //         it.inventoryId ??
            //           it.id ??
            //           it._id ??
            //           it.productName ??
            //           it.productId ??
            //           ""
            //       );
            //       return (
            //         key &&
            //         (String(inv._id) === key ||
            //           String(inv.itemName) === key ||
            //           String(inv.itemName) === String(it.productName))
            //       );
            //     });
            //     if (!match) return inv;
            //     const qty = Number(match.quantity ?? match.sold ?? 0);
            //     if (!qty) return inv;
            //     const current = Number(
            //       inv.openingStock ?? inv.stock ?? inv.quantity ?? 0
            //     );
            //     const nextQty = current - qty; // Subtract for sales
            //     return {
            //       ...inv,
            //       openingStock: nextQty,
            //       stock: nextQty,
            //     } as typeof inv;
            //   })
            // );
          }
        } catch (err) {
          // Non-fatal, just log
          logger.warn("Failed to update inventory after sale:", err);
        }
        */
        return sale;
      } catch (err: unknown) {
        logger.error("Create sale failed:", err);
        let message = "Failed to create sale";
        if (
          err &&
          typeof err === "object" &&
          "message" in err &&
          typeof (err as { message?: unknown }).message === "string"
        ) {
          message = (err as Error).message;
        }
        setSalesError(message);
        showNotification({
          title: "Create Failed",
          message,
          color: "red",
        });
        throw err;
      } finally {
        setSalesLoading(false);
      }
    },
    [],
  );

  const updateSale = useCallback(
    async (id: string | number, payload: Partial<api.SaleRecordPayload>) => {
      setSalesLoading(true);
      try {
        const updated = (await api.updateSaleByNumber(
          String(id),
          payload,
        )) as api.SaleRecordPayload;
        logger.debug("Update sale response:", updated);
        const fallbackCustomerName =
          typeof payload.customerName === "string"
            ? payload.customerName
            : undefined;
        const sale = toSaleRecordValue(updated, fallbackCustomerName);

        setSales((prev) =>
          prev.map((s) => (String(s.id) === String(id) ? sale : s)),
        );
        showNotification({
          title: "Sale Updated",
          message: "Sale has been updated successfully",
          color: "blue",
        });
        return sale;
      } catch (err: unknown) {
        logger.error("Update sale failed:", err);
        setSalesError((err as Error).message || "Failed to update sale");
        showNotification({
          title: "Update Failed",
          message: (err as Error).message || "Failed to update sale",
          color: "red",
        });
        throw err;
      } finally {
        setSalesLoading(false);
      }
    },
    [],
  );

  const deleteSale = useCallback(async (id: string | number) => {
    setSalesLoading(true);
    try {
      logger.debug("Deleting sale id/invoiceNumber:", String(id));
      await api.deleteSaleByNumber(String(id));
      setSales((prev) => prev.filter((s) => String(s.id) !== String(id)));
      showNotification({
        title: "Sale Deleted",
        message: "Sale has been removed",
        color: "orange",
      });
    } catch (err: unknown) {
      logger.error("Delete sale failed:", err);
      let message = "Failed to delete sale";
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
      ) {
        message = (err as Error).message;
      }
      setSalesError(message);
      showNotification({
        title: "Delete Failed",
        message,
        color: "red",
      });
      throw err;
    } finally {
      setSalesLoading(false);
    }
  }, []);

  const createPurchase = useCallback(
    async (payload: api.PurchaseRecordPayload) => {
      setPurchasesLoading(true);
      try {
        // If payload has supplierId, find the full supplier object and send as supplier
        const fullPayload = { ...payload };
        // Use a type guard to check for supplierId property
        type PayloadWithSupplierId = api.PurchaseRecordPayload & {
          supplierId?: string;
        };
        const hasSupplierId = (
          obj: api.PurchaseRecordPayload,
        ): obj is PayloadWithSupplierId =>
          typeof (obj as PayloadWithSupplierId).supplierId === "string" &&
          !(obj as PayloadWithSupplierId).supplier;

        if (hasSupplierId(payload)) {
          const foundSupplier = suppliers.find(
            (s) => s._id === payload.supplierId,
          );
          if (foundSupplier) {
            (fullPayload as PayloadWithSupplierId).supplier = foundSupplier;
            delete (fullPayload as PayloadWithSupplierId).supplierId;
          }
        }
        const created = await api.createPurchase(fullPayload);
        const purchase = {
          ...created,
          id: created.id ?? `po-${String(Date.now())}`,
        } as PurchaseRecord;

        setPurchases((prev) => [purchase, ...prev]);
        showNotification({
          title: "Purchase Created",
          message: "Purchase order has been created",
          color: "green",
        });
        // Update inventory quantities locally to reflect the purchase
        try {
          const payloadProducts = Array.isArray(payload.products)
            ? payload.products
            : [];
          const createdProducts = Array.isArray(created.products)
            ? created.products
            : [];
          const purchasedItems =
            payloadProducts.length > 0 ? payloadProducts : createdProducts;
          if (Array.isArray(purchasedItems) && purchasedItems.length > 0) {
            // Inventory update migrated
          }
        } catch (err) {
          // Non-fatal; log for debugging

          logger.warn("Failed to update inventory after purchase:", err);
        }
        return purchase;
      } catch (err: unknown) {
        logger.error("Create purchase failed:", err);
        setPurchasesError(
          (err as Error).message || "Failed to create purchase",
        );
        showNotification({
          title: "Create Failed",
          message: (err as Error).message || "Failed to create purchase",
          color: "red",
        });
        throw err;
      } finally {
        setPurchasesLoading(false);
      }
    },
    [suppliers],
  );

  const updatePurchase = useCallback(
    async (
      id: string | number,
      payload: Partial<api.PurchaseRecordPayload>,
    ) => {
      setPurchasesLoading(true);
      try {
        const updated = await api.updatePurchase(String(id), payload);
        const purchase = {
          ...updated,
          id: updated.id ?? id,
        } as PurchaseRecord;

        setPurchases((prev) =>
          prev.map((p) => (String(p.id) === String(id) ? purchase : p)),
        );
        showNotification({
          title: "Purchase Updated",
          message: "Purchase order has been updated",
          color: "blue",
        });
        return purchase;
      } catch (err: unknown) {
        logger.error("Update purchase failed:", err);
        setPurchasesError(
          (err as Error).message || "Failed to update purchase",
        );
        showNotification({
          title: "Update Failed",
          message: (err as Error).message || "Failed to update purchase",
          color: "red",
        });
        throw err;
      } finally {
        setPurchasesLoading(false);
      }
    },
    [],
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
    } catch (err: unknown) {
      logger.error("Delete purchase failed:", err);
      let message = "Failed to delete purchase";
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as unknown as { message?: unknown }).message === "string"
      ) {
        message =
          (err as { message?: string }).message || "Failed to delete purchase";
      }
      setPurchasesError(message);
      showNotification({
        title: "Delete Failed",
        message,
        color: "red",
      });
      throw err;
    } finally {
      setPurchasesLoading(false);
    }
  }, []);

  const createGrn = useCallback(async (payload: api.GRNRecordPayload) => {
    setGrnsLoading(true);
    try {
      const created = await api.createGRN(payload);
      const grn = {
        ...created,
        id: created.id ?? `grn-${String(Date.now())}`,
      } as GRNRecord;

      setGrns((prev) => [grn, ...prev]);
      showNotification({
        title: "GRN Created",
        message: `GRN ${grn.grnNumber || ""} has been created`,
        color: "green",
      });
      return grn;
    } catch (err: unknown) {
      logger.error("Create GRN failed:", err);
      setGrnsError((err as Error).message || "Failed to create GRN");
      showNotification({
        title: "Create Failed",
        message: (err as Error).message || "Failed to create GRN",
        color: "red",
      });
      throw err;
    } finally {
      setGrnsLoading(false);
    }
  }, []);

  const createPurchaseReturn = useCallback(
    async (payload: api.PurchaseReturnRecordPayload) => {
      setPurchaseReturnsLoading(true);
      try {
        const created = await api.createPurchaseReturn(payload);
        const purchaseReturn = {
          ...created,
          id: created.id ?? `pr-${String(Date.now())}`,
        } as PurchaseReturnRecord;

        setPurchaseReturns((prev) => [purchaseReturn, ...prev]);
        showNotification({
          title: "Purchase Return Created",
          message: `Return ${purchaseReturn.returnNumber || ""} has been created`,
          color: "green",
        });
        return purchaseReturn;
      } catch (err: unknown) {
        logger.error("Create purchase return failed:", err);
        setPurchaseReturnsError(
          (err as Error).message || "Failed to create purchase return",
        );
        showNotification({
          title: "Create Failed",
          message: (err as Error).message || "Failed to create purchase return",
          color: "red",
        });
        throw err;
      } finally {
        setPurchaseReturnsLoading(false);
      }
    },
    [],
  );

  const createExpense = useCallback(async (payload: ExpenseInput) => {
    setExpensesLoading(true);
    try {
      // Map categoryType to allowed union values
      const allowedCategories = [
        "Rent",
        "Utilities",
        "Transportation",
        "Salary",
        "Maintenance",
        "Other",
      ] as const;
      const mappedCategory =
        allowedCategories.find(
          (cat) =>
            cat.toLowerCase() === payload.categoryType.trim().toLowerCase(),
        ) || "Other";
      const mappedPayload = {
        ...payload,
        categoryType: mappedCategory,
      };
      const created = await api.createExpense(mappedPayload);
      const expense = {
        ...created,
        id: created.id ?? `exp-${String(Date.now())}`,
      } as Expense;

      setExpenses((prev) => [expense, ...prev]);
      showNotification({
        title: "Expense Created",
        message: "Expense has been recorded",
        color: "green",
      });
      return expense;
    } catch (err: unknown) {
      logger.error("Create expense failed:", err);
      setExpensesError((err as Error).message || "Failed to create expense");
      showNotification({
        title: "Create Failed",
        message: (err as Error).message || "Failed to create expense",
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
        // Map categoryType to allowed union values if present
        const allowedCategories = [
          "Rent",
          "Utilities",
          "Transportation",
          "Salary",
          "Maintenance",
          "Other",
        ] as const;
        let mappedCategoryType: (typeof allowedCategories)[number] | undefined =
          undefined;
        if (payload.categoryType !== undefined) {
          mappedCategoryType =
            allowedCategories.find(
              (cat) =>
                cat.toLowerCase() ===
                payload.categoryType?.toString().trim().toLowerCase(),
            ) || "Other";
        }
        const mappedPayload = {
          ...payload,
          ...(payload.categoryType !== undefined && {
            categoryType: mappedCategoryType,
          }),
        } as Partial<api.ExpensePayload>;

        const updated = await api.updateExpense(id, mappedPayload);
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
      } catch (err: unknown) {
        logger.error("Update expense failed:", err);
        setExpensesError((err as Error).message || "Failed to update expense");
        showNotification({
          title: "Update Failed",
          message: (err as Error).message || "Failed to update expense",
          color: "red",
        });
        throw err;
      } finally {
        setExpensesLoading(false);
      }
    },
    [],
  );

  const deleteExpenseItem = useCallback(async (expenseNumber: string) => {
    setExpensesLoading(true);
    try {
      await api.deleteExpense(expenseNumber);
      setExpenses((prev) =>
        prev.filter((e) => e.expenseNumber !== expenseNumber),
      );
      showNotification({
        title: "Expense Deleted",
        message: "Expense has been removed",
        color: "orange",
      });
    } catch (err: unknown) {
      logger.error("Delete expense failed:", err);
      let message = "Failed to delete expense";
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
      ) {
        message =
          (err as { message?: string }).message || "Failed to delete expense";
      }
      setExpensesError(message);
      showNotification({
        title: "Delete Failed",
        message,
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
        await loadCategories();
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
    [loadCategories],
  );

  const updateCategory = useCallback(
    async (categoryId: string, newName: string) => {
      const v = newName.trim();
      if (!v) return;
      setCategoriesLoading(true);
      try {
        await api.updateCategory(categoryId, { name: v });
        await loadCategories();
        showNotification({
          title: "Renamed",
          message: `Category renamed to '${v}'`,
          color: "blue",
        });
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
    [loadCategories],
  );

  const deleteCategoryItem = useCallback(async (name: string) => {
    setCategoriesLoading(true);
    try {
      const catsRaw = (await api.getCategories()) as unknown[];
      // normalize to objects with id and name for robust matching
      const cats = catsRaw.map((c) => {
        if (!c) return { _id: undefined, name: "" };

        if (typeof c === "string") return { _id: undefined, name: c };

        const o = c as Record<string, unknown>;
        const nameFields = ["name", "title", "category", "label", "value"];
        let resolvedName = "";
        for (const f of nameFields) {
          if (typeof o[f] === "string" && o[f].trim()) {
            resolvedName = o[f].trim();
            break;
          }
        }
        const _id = toOptionalStringId(o._id) ?? toOptionalStringId(o.id);
        return { _id, name: resolvedName };
      });

      const nameTrim = name.trim();
      const nameLower = nameTrim.toLowerCase();
      const categoryToDelete = cats.find(
        (c) => (c.name || "").trim().toLowerCase() === nameLower,
      );
      const delId = categoryToDelete?._id;
      if (delId) {
        // Delete server-side category when possible (use MongoDB _id)
        logger.debug(
          "Deleting category by MongoDB _id:",
          delId,
          "for name:",
          nameTrim,
        );
        await api.deleteCategory(delId);
      } else {
        // If category doesn't exist on backend (derived from inventory only),
        // continue and clear it from local inventory so UI reflects removal.
        logger.warn(
          "Category not found on backend (no _id), clearing locally:",
          nameTrim,
        );
      }

      // Clear category from local inventory items so categoriesList updates
      // Inventory update migrated

      // Refresh categories from backend directly (bypass runLoader short-circuit)
      try {
        const fresh = normalizeResponse(await api.getCategories());
        const categoryNames = fresh
          .map((c) => {
            if (!c) return "";
            if (typeof c === "string") return c;
            if (typeof c === "object") {
              const o = c as { [k: string]: unknown };
              const nameFields = [
                "name",
                "title",
                "category",
                "label",
                "value",
              ];
              for (const f of nameFields) {
                const vv = o[f];
                if (typeof vv === "string" && vv.trim()) return vv;
              }
              const id = toOptionalStringId(o.id) ?? toOptionalStringId(o._id);
              if (id) return id;
            }
            return "";
          })
          .map((s) => (typeof s === "string" ? s.trim() : ""))
          .filter((name) => Boolean(name) && name.length > 0);
        setCategories(categoryNames);
      } catch {
        // If refresh fails, keep local state (we already cleared inventory categories)
        logger.warn("Failed to refresh categories after delete");
      }

      showNotification({
        title: "Category Deleted",
        message: `Category '${name}' removed`,
        color: "orange",
      });
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
  }, []);

  // ===== LEGACY ALIASES FOR BACKWARD COMPATIBILITY =====
  const addCategory = useCallback(
    async (name: string) => {
      return createCategory(name);
    },
    [createCategory],
  );

  const renameCategory = useCallback(
    async (oldName: string, newName: string) => {
      return updateCategory(oldName, newName);
    },
    [updateCategory],
  );

  const addExpense = (e: ExpenseInput) => {
    // create local record first for optimistic UI
    const record: Expense = {
      id:
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `exp-${String(Date.now())}`,
      createdAt: new Date(),
      ...e,
    };
    setExpenses((prev) => [record, ...prev]);

    // attempt to persist to backend if available
    void (async () => {
      try {
        // Map categoryType to allowed union values
        const allowedCategories = [
          "Rent",
          "Utilities",
          "Transportation",
          "Salary",
          "Maintenance",
          "Other",
        ] as const;
        const mappedCategory =
          allowedCategories.find(
            (cat) => cat.toLowerCase() === e.categoryType.trim().toLowerCase(),
          ) || "Other";
        const mappedPayload = {
          ...e,
          categoryType: mappedCategory,
        };
        const created = await api.createExpense(mappedPayload);
        const createdId =
          toOptionalStringId(created.id) ?? toOptionalStringId(created._id);
        // replace optimistic record with server-supplied record if it returns an id
        setExpenses((prev) => [
          {
            ...created,
            id: createdId ?? record.id,
          } as Expense,
          ...prev.filter((x) => x.id !== record.id),
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

  async function refreshFromBackend() {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    refreshPromiseRef.current = (async () => {
      try {
        const cat = await api.getCategories();
        const warnings: string[] = [];
        const maybeWarn = (name: string, v: unknown) => {
          const w = validateArrayResponse(name, v);
          if (w) warnings.push(w);
        };
        maybeWarn("categories", cat);

        setApiWarnings(warnings);

        const rawCats = normalizeResponse(cat);

        const categoryNames = rawCats
          .map((c) => {
            if (!c) return "";
            if (typeof c === "string") return c;
            if (typeof c === "object") {
              const o = c as { [k: string]: unknown };

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

              const id = toOptionalStringId(o.id) ?? toOptionalStringId(o._id);
              if (id) return id;
            }
            return "";
          })
          .map((s) => (typeof s === "string" ? s.trim() : ""))
          .filter(Boolean);
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
  const loadSales = async () => {
    if (loaderLoadedRef.current["sales"] && sales.length > 0) {
      return sales;
    }
    if (sales.length === 0) {
      loaderLoadedRef.current["sales"] = false;
    }
    return runLoader("sales", api.getSales, (v) => {
      const rawSales = normalizeResponse(v);
      const normalizedSales = rawSales.map((sale) => {
        const s = sale as Record<string, unknown>;
        const salePayload = s as unknown as api.SaleRecordPayload;
        const fallbackCustomerName =
          typeof s.customerName === "string"
            ? s.customerName
            : typeof s.customer === "string"
              ? s.customer
              : undefined;
        return toSaleRecordValue(salePayload, fallbackCustomerName);
      });
      setSales(normalizedSales);
      return normalizedSales;
    }) as Promise<SaleRecord[]>;
  };

  useEffect(() => {
    if (isAuthenticated) {
      void loadSales();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const loadPurchases = async () => {
    if (loaderLoadedRef.current["purchases"]) {
      return purchases;
    }
    return runLoader("purchases", api.getPurchases, (v) => {
      const normalized = normalizeResponse(v).map((record) =>
        withSupplierRecord(record as Record<string, unknown>, suppliers),
      ) as unknown as PurchaseRecord[];
      setPurchases(normalized);
      return normalized;
    }) as Promise<PurchaseRecord[]>;
  };

  // Auto-load purchases on mount
  useEffect(() => {
    if (isAuthenticated) {
      void loadPurchases();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const loadPurchaseInvoices = async () => {
    if (loaderLoadedRef.current["purchaseInvoices"]) {
      return purchaseInvoices;
    }
    return runLoader("purchaseInvoices", api.getPurchaseInvoices, (v) => {
      const normalized = normalizeResponse(v).map((record) =>
        withSupplierRecord(record as Record<string, unknown>, suppliers),
      ) as unknown as PurchaseInvoiceRecord[];
      setPurchaseInvoices(normalized);
      return normalized;
    }) as Promise<PurchaseInvoiceRecord[]>;
  };

  // Auto-load purchase invoices on mount
  useEffect(() => {
    if (isAuthenticated) {
      void loadPurchaseInvoices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const loadGrns = async () => {
    if (loaderLoadedRef.current["grns"]) {
      return grns;
    }
    return runLoader("grns", api.getGRNs, (v) => {
      const normalized = normalizeResponse(v) as GRNRecord[];
      setGrns(normalized);
      return normalized;
    }) as Promise<GRNRecord[]>;
  };

  const loadPurchaseReturns = async () => {
    if (loaderLoadedRef.current["purchaseReturns"]) {
      return purchaseReturns;
    }
    return runLoader("purchaseReturns", api.getPurchaseReturns, (v) => {
      const normalized = normalizeResponse(v) as PurchaseReturnRecord[];
      setPurchaseReturns(normalized);
      return normalized;
    }) as Promise<PurchaseReturnRecord[]>;
  };
  const loadExpenses = async (): Promise<Expense[]> => {
    if (loaderLoadedRef.current["expenses"]) {
      return expenses;
    }
    return runLoader("expenses", api.getExpenses, (v) => {
      const normalized = normalizeResponse(v) as Expense[];
      setExpenses(normalized);
      return normalized;
    }) as Promise<Expense[]>;
  };

  // Auto-load expenses on mount
  useEffect(() => {
    if (isAuthenticated) {
      void loadExpenses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const loadReceiptVouchers = async (): Promise<ReceiptVoucher[]> => {
    if (loaderLoadedRef.current["receiptVouchers"]) {
      return receiptVouchers;
    }
    return runLoader("receiptVouchers", api.getAllReceiptVouchers, (v) => {
      const normalized = normalizeResponse(v).map((voucher) =>
        toReceiptVoucher(voucher),
      );
      setReceiptVouchers(normalized);
      return normalized;
    }) as Promise<ReceiptVoucher[]>;
  };

  // Auto-load receipt vouchers on mount
  useEffect(() => {
    if (isAuthenticated) {
      void loadReceiptVouchers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const loadPaymentVouchers = async (): Promise<PaymentVoucher[]> => {
    if (loaderLoadedRef.current["paymentVouchers"]) {
      return paymentVouchers;
    }
    return runLoader("paymentVouchers", api.getAllPaymentVouchers, (v) => {
      const normalized = normalizeResponse(v).map((voucher) =>
        toPaymentVoucher(voucher),
      );
      setPaymentVouchers(normalized);
      return normalized;
    }) as Promise<PaymentVoucher[]>;
  };

  // Auto-load payment vouchers on mount
  useEffect(() => {
    if (isAuthenticated) {
      void loadPaymentVouchers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Only one loadQuotations function, returns correct type and is in correct order
  const loadQuotations = useCallback(async (): Promise<
    api.QuotationRecordPayload[]
  > => {
    if (loaderLoadedRef.current["quotations"]) {
      if (import.meta.env.MODE !== "production") {
        logger.debug(
          "[DataContext] loadQuotations: already loaded — skipping fetch",
        );
      }
      return quotations;
    }
    return runLoader("quotations", api.getQuotations, (v) => {
      const raw = normalizeResponse(v);
      const mapped = raw.map((it) => {
        const o = (it || {}) as Record<string, unknown>;
        let customer: api.CustomerPayload[] = [];
        if (Array.isArray(o.customer)) {
          customer = (o.customer as api.CustomerPayload[]).map((c) => ({
            id: c.id,
            name: typeof c.name === "string" ? c.name : "",
          }));
        } else if (typeof o.customer === "object" && o.customer !== null) {
          const customerRecord = o.customer as {
            id?: string | number;
            name?: string;
          };
          customer = [
            {
              id: customerRecord.id,
              name: customerRecord.name ?? "",
            },
          ];
        } else if (typeof o.customer === "string" && o.customer.trim()) {
          customer = [{ name: o.customer.trim() }];
        } else if (o.customerName && typeof o.customerName === "string") {
          customer = [{ name: o.customerName }];
        }
        const products =
          (o.products as unknown[] | undefined) ??
          (o.items as unknown[] | undefined) ??
          [];
        return {
          _id:
            (o._id as string | undefined) ??
            (o.id as string | undefined) ??
            undefined,
          id:
            (o.id as string | undefined) ??
            (o._id as string | undefined) ??
            undefined,
          quotationNumber:
            (o.quotationNumber as string | undefined) ??
            (o.quotation_no as string | undefined) ??
            (o.docNo as string | undefined) ??
            undefined,
          products: products as api.InventoryItemPayload[],
          quotationDate:
            (o.quotationDate as string | undefined) ??
            (o.date as string | undefined) ??
            (o.docDate as string | undefined) ??
            undefined,
          customer,
          customerName:
            (o.customerName as string | undefined) ??
            (customer.length > 0 ? customer[0].name : undefined),
          remarks:
            (o.remarks as string | undefined) ??
            (o.note as string | undefined) ??
            undefined,
          subTotal:
            (o.subTotal as number | undefined) ??
            (o.sub_total as number | undefined) ??
            (o.total as number | undefined) ??
            undefined,
          totalGrossAmmount:
            (o.totalGrossAmmount as number | undefined) ??
            (o.totalGrossAmount as number | undefined) ??
            (o.total as number | undefined) ??
            undefined,
          totalDiscount:
            (o.totalDiscount as number | undefined) ??
            (o.discount as number | undefined) ??
            0,
          length: products.length || undefined,
          status: (o.status as string | undefined) ?? undefined,
          metadata: (o.metadata as Record<string, unknown> | undefined) ?? {},
        } as api.QuotationRecordPayload;
      });
      setQuotations(mapped);
      return mapped;
    }) as Promise<api.QuotationRecordPayload[]>;
  }, [runLoader, quotations]);

  // Auto-load quotations on mount
  useEffect(() => {
    if (isAuthenticated) {
      void loadQuotations();
    }
  }, [isAuthenticated, loadQuotations]);

  // Stubs for required purchase return functions
  function applyPurchaseReturnToInventory(ret: PurchaseReturnRecord) {
    // Placeholder: implement inventory update logic as needed
    void ret;
  }
  function updatePurchaseFromReturn(): void {
    // Implement purchase update logic as needed
  }
  function processPurchaseReturn() {
    // Implement processing logic as needed
    return { applied: false };
  }
  function applyGrnToInventory(grn: GRNRecord) {
    // Logic migrated to InventoryContext
    void grn;
  }

  function updatePurchaseFromGrn(grn: GRNRecord) {
    // This function updates the purchase order based on the GRN received quantities
    // It iterates through the purchase orders, finds the one matching the GRN,
    // and then updates the 'received' quantity for each product in that purchase order.
    setPurchases((prevPurchases) =>
      prevPurchases.map((po) =>
        po.id !== grn.linkedPoId
          ? po
          : {
              ...po,
              products: po.products.map((pi) => {
                const productName = pi.productName;
                const productId = toOptionalStringId(pi.id);
                const found = grn.items.find(
                  (gi) => gi.sku === productName || gi.sku === productId,
                );
                return found
                  ? {
                      ...pi,
                      received: (pi.received || 0) + (found.quantity || 0),
                    }
                  : pi;
              }),
            },
      ),
    );
  }

  return (
    <DataContext.Provider
      value={{
        // ===== INVENTORY MODULE =====
        // inventory, (removed)
        // inventoryLoading, (removed)
        // inventoryError, (removed)
        // setInventory, (removed)
        // loadInventory, (removed)
        // createInventoryItem, (removed)
        // updateInventoryItem, (removed)
        // deleteInventoryItem, (removed)

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

        // ===== PURCHASE INVOICES MODULE =====
        purchaseInvoices,
        purchaseInvoicesLoading,
        purchaseInvoicesError,
        setPurchaseInvoices,
        loadPurchaseInvoices,

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

        // ===== RECEIPT VOUCHERS MODULE =====
        receiptVouchers,
        receiptVouchersLoading,
        receiptVouchersError,
        setReceiptVouchers,
        loadReceiptVouchers,

        // ===== PAYMENT VOUCHERS MODULE =====
        paymentVouchers,
        paymentVouchersLoading,
        paymentVouchersError,
        setPaymentVouchers,
        loadPaymentVouchers,

        // ===== COLORS MODULE =====
        colors,
        colorsLoading,
        colorsError,
        setColors,
        loadColors,
        createColor,
        updateColor,
        deleteColor,
        colorsForSelect,

        // ===== QUOTATIONS =====
        quotations,
        loadQuotations,
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

    const mode = import.meta.env.MODE;
    throw new Error(
      `useDataContext must be used within a DataProvider. Current location: ${location}. Build mode: ${
        mode || "unknown"
      }. If you see this during development, try a full page reload or restart the dev server (npm run dev) — HMR can sometimes produce duplicate module instances which break React context.`,
    );
  }
  return ctx;
}
