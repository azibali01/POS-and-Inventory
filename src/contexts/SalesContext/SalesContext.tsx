import React, { createContext, useState, useCallback, useRef } from "react";
import { showNotification } from "@mantine/notifications";
import * as api from "../../lib/api";
import { ensureArray } from "../../lib/api-response-utils";
import { logger } from "../../lib/logger";
import type {
  SaleRecord,
  QuotationRecord,
  Customer,
  SalesContextType,
} from "./types";

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
      .catch((error) => {
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
  const loadQuotations = useCallback(async (): Promise<QuotationRecord[]> => {
    if (quotationsPromiseRef.current) {
      return quotationsPromiseRef.current;
    }

    setQuotationsLoading(true);
    setQuotationsError(null);

    const promise = api
      .getQuotations()
      .then((data) => {
        const validated = ensureArray<QuotationRecord>(data, "quotations");
        setQuotations(validated);
        setQuotationsLoading(false);
        logger.log("Quotations loaded:", validated.length, "records");
        return validated;
      })
      .catch((error) => {
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
      .catch((error) => {
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
      .catch((error) => {
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
