/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { createContext, useState, useCallback, useRef } from "react";
import { showNotification } from "@mantine/notifications";
import * as api from "../../lib/api";
import { ensureArray } from "../../lib/api-response-utils";
import { logger } from "../../lib/logger";
import type {
  SaleRecord,
  QuotationRecord,
  Customer,
  CustomerInput,
  SalesContextType,
} from "./types";
import { useInventory } from "../InventoryContext/InventoryContext";

const SalesContext = createContext<SalesContextType | undefined>(undefined);

/**
 * Sales Context Provider
 *
 * Manages state for:
 * - Sales Invoices
 * - Quotations
 * - Sale Returns
 * - Customers
 */
export function SalesProvider({ children }: { children: React.ReactNode }) {
  // Sales State
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState<string | null>(null);

  // Quotations State
  const [quotations, setQuotations] = useState<QuotationRecord[]>([]);
  const [quotationsLoading, setQuotationsLoading] = useState(false);
  const [quotationsError, setQuotationsError] = useState<string | null>(null);

  // Sale Returns State
  const [saleReturns, setSaleReturns] = useState<SaleRecord[]>([]);
  const [saleReturnsLoading, setSaleReturnsLoading] = useState(false);
  const [saleReturnsError, setSaleReturnsError] = useState<string | null>(null);

  // Customers State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);

  // Access Inventory Context for stock updates
  const { setInventory } = useInventory();

  // Refs to track loading promises
  const salesPromiseRef = useRef<Promise<SaleRecord[]> | null>(null);
  const quotationsPromiseRef = useRef<Promise<QuotationRecord[]> | null>(null);
  const saleReturnsPromiseRef = useRef<Promise<SaleRecord[]> | null>(null);
  const customersPromiseRef = useRef<Promise<Customer[]> | null>(null);

  /**
   * Load Sales Invoices
   */
  const loadSales = useCallback(async (): Promise<SaleRecord[]> => {
    if (salesPromiseRef.current) {
      return salesPromiseRef.current;
    }

    setSalesLoading(true);
    setSalesError(null);

    const promise = api
      .getSales()
      .then((data) => {
        const validated = ensureArray<SaleRecord>(data, "sales");
        setSales(validated);
        setSalesLoading(false);
        logger.log("Sales loaded:", validated.length, "records");
        return validated;
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Failed to load sales";
        setSalesError(message);
        setSalesLoading(false);
        logger.error("Failed to load sales:", error);
        showNotification({
          title: "Error",
          message: "Failed to load sales invoices",
          color: "red",
        });
        return [];
      })
      .finally(() => {
        salesPromiseRef.current = null;
      });

    salesPromiseRef.current = promise;
    return promise;
  }, []);

  /**
   * Load Quotations
   */
  /**
   * Load Quotations
   */
  const loadQuotations = useCallback(async (): Promise<QuotationRecord[]> => {
    if (quotationsPromiseRef.current) {
      return quotationsPromiseRef.current;
    }

    setQuotationsLoading(true);
    setQuotationsError(null);

    const promise = api
      .getQuotations()
      .then((v) => {
        // Robust normalization from DataContext
        const raw = ensureArray(v, "quotations"); 
        // Note: ensureArray returns unknown[], we need to map it
        const mapped = raw.map((it) => {
          const o = (it || {}) as Record<string, unknown>;
          let customer: import("../../lib/api").CustomerPayload[] = [];
          if (Array.isArray(o.customer)) {
            customer = (o.customer as import("../../lib/api").CustomerPayload[]).map((c) => ({
              id: c.id,
              name: c.name ?? (typeof c === "string" ? c : ""),
            }));
          } else if (typeof o.customer === "object" && o.customer !== null) {
            customer = [
              {
                id: (o.customer as { id?: string | number })?.id,
                name: (o.customer as { name?: string })?.name ?? "",
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
            products: products as import("../../lib/api").InventoryItemPayload[],
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
          } as QuotationRecord;
        });
        setQuotations(mapped);
        setQuotationsLoading(false);
        logger.log("Quotations loaded:", mapped.length, "records");
        return mapped;
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Failed to load quotations";
        setQuotationsError(message);
        setQuotationsLoading(false);
        logger.error("Failed to load quotations:", error);
        showNotification({
          title: "Error",
          message: "Failed to load quotations",
          color: "red",
        });
        return [];
      })
      .finally(() => {
        quotationsPromiseRef.current = null;
      });

    quotationsPromiseRef.current = promise;
    return promise;
  }, []);

  /**
   * Load Sale Returns
   */
  const loadSaleReturns = useCallback(async (): Promise<SaleRecord[]> => {
    if (saleReturnsPromiseRef.current) {
      return saleReturnsPromiseRef.current;
    }

    setSaleReturnsLoading(true);
    setSaleReturnsError(null);

    const promise = api
      .getSaleReturns()
      .then((data) => {
        const validated = ensureArray<SaleRecord>(data, "sale returns");
        setSaleReturns(validated);
        setSaleReturnsLoading(false);
        logger.log("Sale returns loaded:", validated.length, "records");
        return validated;
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load sale returns";
        setSaleReturnsError(message);
        setSaleReturnsLoading(false);
        logger.error("Failed to load sale returns:", error);
        showNotification({
          title: "Error",
          message: "Failed to load sale returns",
          color: "red",
        });
        return [];
      })
      .finally(() => {
        saleReturnsPromiseRef.current = null;
      });

    saleReturnsPromiseRef.current = promise;
    return promise;
  }, []);

  /**
   * Load Customers
   */
  const loadCustomers = useCallback(async (): Promise<Customer[]> => {
    if (customersPromiseRef.current) {
      return customersPromiseRef.current;
    }

    setCustomersLoading(true);
    setCustomersError(null);

    const promise = api
      .getCustomers()
      .then((data) => {
        const validated = ensureArray<Customer>(data, "customers");
        setCustomers(validated);
        setCustomersLoading(false);
        logger.log("Customers loaded:", validated.length, "records");
        return validated;
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Failed to load customers";
        setCustomersError(message);
        setCustomersLoading(false);
        logger.error("Failed to load customers:", error);
        showNotification({
          title: "Error",
          message: "Failed to load customers",
          color: "red",
        });
        return [];
      })
      .finally(() => {
        customersPromiseRef.current = null;
      });

    customersPromiseRef.current = promise;
    return promise;
  }, []);

  // ===== SALES CRUD FUNCTIONS =====
  const createSale = useCallback(
    async (payload: import("../../lib/api").SaleRecordPayload | SaleRecord) => {
      setSalesLoading(true);
      try {
        // Only send SaleRecordPayload to API
        const apiPayload: import("../../lib/api").SaleRecordPayload = {
          ...payload,
          quotationDate:
            typeof payload.quotationDate === "string"
              ? payload.quotationDate
              : payload.quotationDate instanceof Date
              ? payload.quotationDate.toISOString()
              : undefined,
          customer:
            Array.isArray((payload as any).customer) &&
            (payload as any).customer.length > 0
              ? (payload as any).customer[0]
              : typeof (payload as any).customer === "object" &&
                (payload as any).customer !== null
              ? (payload as any).customer
              : undefined,
        };
        const created = await api.createSale(apiPayload);

        logger.debug("Create sale response:", created);

        const payloadCustomer = (payload as { customer?: unknown })?.customer;

        const inferredCustomerName = Array.isArray(payloadCustomer)
          ? (payloadCustomer[0] as { name?: string })?.name
          : typeof payloadCustomer === "string"
          ? payloadCustomer
          : (payload as { customerName?: string })?.customerName || null;

        // Handle customer field - API returns CustomerPayload | null, normalize to array
        const createdCustomer = (created as api.SaleRecordPayload).customer;
        const normalizedCustomer = createdCustomer
          ? [{ name: createdCustomer.name || inferredCustomerName || "" }]
          : inferredCustomerName
          ? [{ name: inferredCustomerName }]
          : [];

        const sale = {
          ...created,
          id:
            (created as { invoiceNumber?: string | number })?.invoiceNumber ??
            created.id ??
            `sale-${Date.now()}`,
          customer: normalizedCustomer as any,
          customerName:
            (Array.isArray(normalizedCustomer) &&
              (normalizedCustomer[0] as { name?: string })?.name) ||
            (created as { customerName?: string })?.customerName ||
            inferredCustomerName ||
            "",
          date: (created as { invoiceDate?: string })?.invoiceDate || "",
        } as SaleRecord;

        setSales((prev) => [sale, ...prev]);
        showNotification({
          title: "Sale Created",
          message: "Sale has been recorded successfully",
          color: "green",
        });
        // Update inventory quantities locally to reflect the sale
        try {
          const soldItems: any[] =
            (payload as any)?.items ||
            (payload as any)?.products ||
            (created as any)?.items ||
            [];
          if (Array.isArray(soldItems) && soldItems.length > 0) {
            setInventory((prev) =>
              prev.map((inv) => {
                // Find matching sold item by several possible keys
                const match = soldItems.find((it: any) => {
                  const key = String(
                    it._id ??
                      it.id ??
                      it.sku ??
                      it.productId ??
                      it.itemName ??
                      ""
                  );
                  return (
                    key &&
                    (String(inv._id) === key ||
                      String(inv.itemName) === key ||
                      String(inv.itemName) === String(it.productName))
                  );
                });
                if (!match) return inv;
                const qty = Number(match.quantity ?? 0);
                if (!qty) return inv;
                const current = Number(
                  inv.openingStock ?? inv.stock ?? inv.quantity ?? 0
                );
                const nextQty = current - qty;
                return {
                  ...inv,
                  openingStock: nextQty,
                  stock: nextQty,
                } as typeof inv;
              })
            );
          }
        } catch (err) {
          // Non-fatal, just log
          logger.warn("Failed to update inventory after sale:", err);
        }
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
    [setInventory]
  );

  const updateSale = useCallback(
    async (
      id: string | number,
      payload: Partial<import("../../lib/api").SaleRecordPayload>
    ) => {
      setSalesLoading(true);
      try {
        const updated = await api.updateSaleByNumber(String(id), payload);
        logger.debug("Update sale response:", updated);
        const payloadCustomer = (payload as { customer?: unknown })?.customer;
        const inferredCustomerName = Array.isArray(payloadCustomer)
          ? (payloadCustomer[0] as { name?: string })?.name
          : typeof payloadCustomer === "string"
          ? payloadCustomer
          : (payload as { customerName?: string })?.customerName || null;

        const normalizedCustomer =
          (updated as { customer?: Array<{ name?: string }> })?.customer &&
          (updated as { customer?: Array<{ name?: string }> })?.customer?.length
            ? (updated as { customer: Array<{ name?: string }> }).customer
            : inferredCustomerName
            ? [{ name: inferredCustomerName }]
            : [];

        const sale = {
          ...updated,
          id: updated.id ?? id,
          customer: normalizedCustomer,
          customerName:
            (Array.isArray(normalizedCustomer) &&
              (normalizedCustomer[0] as { name?: string })?.name) ||
            (updated as { customerName?: string })?.customerName ||
            inferredCustomerName ||
            "",
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
    []
  );

  const deleteSale = useCallback(async (id: string | number) => {
    setSalesLoading(true);
    try {
      logger.debug("Deleting sale id/invoiceNumber:", String(id));
      const resp = await api.deleteSaleByNumber(String(id));

      logger.debug("Delete sale response:", resp);
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

  // ===== CUSTOMERS CRUD FUNCTIONS =====
  const createCustomer = useCallback(async (payload: CustomerInput) => {
    setCustomersLoading(true);
    try {
      // Map paymentType to lowercase if present
      const mappedPayload = {
        ...payload,
        paymentType: payload.paymentType
          ? payload.paymentType.toLowerCase() === "credit"
            ? "credit"
            : payload.paymentType.toLowerCase() === "debit"
            ? "debit"
            : undefined
          : undefined,
      } as api.CustomerPayload;
      const created = await api.createCustomer(mappedPayload);
      const customer: Customer = {
        ...created,
        _id: created._id ? String(created._id) : created.id ? String(created.id) : "",
      };
      setCustomers((prev) => [customer, ...prev]);
      showNotification({
        title: "Customer Created",
        message: `${payload.name || "Customer"} has been added`,
        color: "green",
      });
      return customer;
    } catch (err: unknown) {
      logger.error("Create customer failed:", err);
      setCustomersError((err as Error).message || "Failed to create customer");
      showNotification({
        title: "Create Failed",
        message: (err as Error).message || "Failed to create customer",
        color: "red",
      });
      throw err;
    } finally {
      setCustomersLoading(false);
    }
  }, []);

  const updateCustomer = useCallback(
    async (id: string | number, payload: Partial<CustomerInput>) => {
      setCustomersLoading(true);
      try {
        // Map paymentType to lowercase if present
        const mappedPayload = {
          ...payload,
          paymentType: payload.paymentType
            ? payload.paymentType.toLowerCase() === "credit"
              ? "credit"
              : payload.paymentType.toLowerCase() === "debit"
              ? "debit"
              : undefined
            : undefined,
        } as Partial<api.CustomerPayload>;
        const updated = await api.updateCustomer(String(id), mappedPayload);
        const customer: Customer = {
          ...updated,
          _id: updated._id ? String(updated._id) : updated.id ? String(updated.id) : String(id),
        };
        setCustomers((prev) =>
          prev.map((c) => (String(c._id) === String(id) ? customer : c))
        );
        showNotification({
          title: "Customer Updated",
          message: "Customer has been updated successfully",
          color: "blue",
        });
        return customer;
      } catch (err: unknown) {
        logger.error("Update customer failed:", err);
        setCustomersError(
          (err as Error).message || "Failed to update customer"
        );
        showNotification({
          title: "Update Failed",
          message: (err as Error).message || "Failed to update customer",
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
      setCustomers((prev) => prev.filter((c) => String(c._id) !== String(id)));
      showNotification({
        title: "Customer Deleted",
        message: "Customer has been removed",
        color: "orange",
      });
    } catch (err: unknown) {
      logger.error("Delete customer failed:", err);
      let message = "Failed to delete customer";
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
      ) {
        message =
          (err as { message?: string }).message || "Failed to delete customer";
      }
      setCustomersError(message);
      showNotification({
        title: "Delete Failed",
        message,
        color: "red",
      });
      throw err;
    } finally {
      setCustomersLoading(false);
    }
  }, []);

  const value: SalesContextType = {
    sales,
    salesLoading,
    salesError,
    setSales,
    loadSales,

    quotations,
    quotationsLoading,
    quotationsError,
    setQuotations,
    loadQuotations,

    saleReturns,
    saleReturnsLoading,
    saleReturnsError,
    setSaleReturns,
    loadSaleReturns,

    customers,
    customersLoading,
    customersError,
    setCustomers,
    loadCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,

    // Sales CRUD
    createSale,
    updateSale,
    deleteSale,
  };

  return (
    <SalesContext.Provider value={value}>{children}</SalesContext.Provider>
  );
}

/**
 * Hook to use Sales Context
 */
export function useSales(): SalesContextType {
  const context = React.useContext(SalesContext);
  if (!context) {
    throw new Error("useSales must be used within a SalesProvider");
  }
  return context;
}

export { SalesContext };
export type { SaleRecord, QuotationRecord, Customer };
