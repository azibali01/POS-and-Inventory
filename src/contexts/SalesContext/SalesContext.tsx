/* eslint-disable react-refresh/only-export-components */
import React, { createContext } from "react";
import { useInventory } from "../InventoryContext/InventoryContext";
import type { SalesContextType } from "./types";
import type { SaleRecordPayload } from "../../api";
import {
  toSaleRecords,
  toQuotationRecords,
  toCustomers,
  toSaleRecord,
  toCustomer,
} from "../../utils/typeMappers";

// Import our custom hooks
import { useSales as useSalesHook } from "../../hooks/useSales";
import { useSaleReturns as useSaleReturnsHook } from "../../hooks/useSales";
import { useQuotation } from "../../hooks/useQuotation";
import { useCustomer } from "../../hooks/useCustomer";

const SalesContext = createContext<SalesContextType | undefined>(undefined);

/**
 * Sales Context Provider - Refactored to use custom hooks
 *
 * This provider now delegates all business logic to custom hooks:
 * - useSales: Sales invoice management
 * - useSaleReturns: Sale returns management
 * - useQuotation: Quotations management
 * - useCustomer: Customer management
 *
 * Benefits:
 * - React Query caching and invalidation
 * - Reduced boilerplate (~400 lines eliminated)
 * - Consistent error handling
 * - Better loading states
 */
export function SalesProvider({ children }: { children: React.ReactNode }) {
  // Use custom hooks for all data management
  const salesHook = useSalesHook();
  const saleReturnsHook = useSaleReturnsHook();
  const quotationHook = useQuotation();
  const customerHook = useCustomer();

  // Access Inventory Context for stock updates (still needed for local optimistic updates)
  const { setInventory } = useInventory();

  // Build the context value by mapping hook methods to expected interface
  const value: SalesContextType = {
    // Sales (convert from SaleRecordPayload[] to SaleRecord[])
    sales: React.useMemo(() => toSaleRecords(salesHook.sales), [salesHook.sales]),
    salesLoading: salesHook.isLoading,
    salesError: salesHook.error?.message || null,
    setSales: () => {
      console.warn("setSales called - state is managed by React Query");
    },
    loadSales: async () => {
      await salesHook.refetch();
      return toSaleRecords(salesHook.sales);
    },
    createSale: async (payload) => {
      // Convert quotationDate if needed
      const apiPayload: SaleRecordPayload = {
        ...payload,
        quotationDate:
          typeof payload.quotationDate === "string"
            ? payload.quotationDate
            : payload.quotationDate instanceof Date
            ? payload.quotationDate.toISOString()
            : undefined,
        customer:
          Array.isArray((payload as any).customer) && (payload as any).customer.length > 0
            ? (payload as any).customer[0]
            : typeof (payload as any).customer === "object" && (payload as any).customer !== null
            ? (payload as any).customer
            : undefined,
      } as SaleRecordPayload;

      // Use async mutation
      const result = await salesHook.createSaleAsync(apiPayload);
      
      // Update inventory quantities locally to reflect the sale
      try {
        const soldItems = (
          (Array.isArray((payload as any).items) ? (payload as any).items : undefined) ??
          (Array.isArray((payload as any).products) ? (payload as any).products : undefined) ??
          []
        ) as Record<string, unknown>[];

        if (soldItems.length > 0) {
          setInventory((prev) =>
            prev.map((inv) => {
              const match = soldItems.find((it) => {
                const item = it as Record<string, unknown>;
                const key = String(
                  (item._id as string | number) ||
                    (item.id as string | number) ||
                    (item.sku as string | number) ||
                    (item.productId as string | number) ||
                    (item.itemName as string) ||
                    ""
                );
                return (
                  key &&
                  (String(inv._id) === key ||
                    String(inv.itemName) === key ||
                    inv.itemName === String(item.productName))
                );
              });
              if (!match) return inv;
              const qty = Number(match.quantity || 0);
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
        console.warn("Failed to update inventory after sale:", err);
      }

      // Return converted result
      return toSaleRecord(result);
    },
    updateSale: async (id, payload) => {
      const result = await salesHook.updateSaleAsync({ invoiceNumber: String(id), data: payload });
      return toSaleRecord(result);
    },
    deleteSale: async (id) => {
      await salesHook.deleteSale(String(id));
    },

    // Quotations (convert from QuotationRecordPayload[] to QuotationRecord[])
    quotations: React.useMemo(
      () => toQuotationRecords(quotationHook.quotations),
      [quotationHook.quotations]
    ),
    quotationsLoading: quotationHook.isLoading,
    quotationsError: quotationHook.error?.message || null,
    setQuotations: () => {
      console.warn("setQuotations called - state is managed by React Query");
    },
    loadQuotations: async () => {
      await quotationHook.refetch();
      return toQuotationRecords(quotationHook.quotations);
    },

    // Sale Returns
    saleReturns: saleReturnsHook.saleReturns,
    saleReturnsLoading: saleReturnsHook.isLoading,
    saleReturnsError: saleReturnsHook.error?.message || null,
    setSaleReturns: () => {
      console.warn("setSaleReturns called - state is managed by React Query");
    },
    loadSaleReturns: async () => {
      await saleReturnsHook.refetch();
      return saleReturnsHook.saleReturns;
    },

    // Customers (convert from CustomerPayload[] to Customer[])
    customers: React.useMemo(
      () => toCustomers(customerHook.customers),
      [customerHook.customers]
    ),
    customersLoading: customerHook.isLoading,
    customersError: customerHook.error?.message || null,
    setCustomers: () => {
      console.warn("setCustomers called - state is managed by React Query");
    },
    loadCustomers: async () => {
      await customerHook.refetch();
      return toCustomers(customerHook.customers);
    },
    createCustomer: async (payload) => {
      const result = await customerHook.createCustomerAsync(payload as any);
      return toCustomer(result);
    },
    updateCustomer: async (id, payload) => {
      const result = await customerHook.updateCustomerAsync({ id, data: payload as any });
      return toCustomer(result);
    },
    deleteCustomer: customerHook.deleteCustomerAsync,
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
export type { SalesContextType };
