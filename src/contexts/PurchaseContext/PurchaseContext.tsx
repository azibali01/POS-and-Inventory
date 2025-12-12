import React, { createContext, useState, useCallback, useRef } from "react";
import { showNotification } from "@mantine/notifications";
import * as api from "../../lib/api";
import { ensureArray } from "../../lib/api-response-utils";
import { logger } from "../../lib/logger";
import type { Supplier } from "../../components/purchase/SupplierForm";
import type {
  PurchaseRecord,
  PurchaseInvoiceRecord,
  GRNRecord,
  PurchaseReturnRecord,
  PurchaseContextType,
} from "./types";

const PurchaseContext = createContext<PurchaseContextType | undefined>(
  undefined
);

/**
 * Purchase Context Provider
 *
 * Manages state for:
 * - Suppliers
 * - Purchase Orders
 * - Purchase Invoices
 * - GRNs (Goods Receipt Notes)
 * - Purchase Returns
 */
export function PurchaseProvider({ children }: { children: React.ReactNode }) {
  // Suppliers State
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [suppliersError, setSuppliersError] = useState<string | null>(null);

  // Purchase Orders State
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [purchasesError, setPurchasesError] = useState<string | null>(null);

  // Purchase Invoices State
  const [purchaseInvoices, setPurchaseInvoices] = useState<
    PurchaseInvoiceRecord[]
  >([]);
  const [purchaseInvoicesLoading, setPurchaseInvoicesLoading] = useState(false);
  const [purchaseInvoicesError, setPurchaseInvoicesError] = useState<
    string | null
  >(null);

  // GRNs State
  const [grns, setGrns] = useState<GRNRecord[]>([]);
  const [grnsLoading, setGrnsLoading] = useState(false);
  const [grnsError, setGrnsError] = useState<string | null>(null);

  // Purchase Returns State
  const [purchaseReturns, setPurchaseReturns] = useState<
    PurchaseReturnRecord[]
  >([]);
  const [purchaseReturnsLoading, setPurchaseReturnsLoading] = useState(false);
  const [purchaseReturnsError, setPurchaseReturnsError] = useState<
    string | null
  >(null);

  // Refs to track loading promises
  const suppliersPromiseRef = useRef<Promise<Supplier[]> | null>(null);
  const purchasesPromiseRef = useRef<Promise<PurchaseRecord[]> | null>(null);
  const purchaseInvoicesPromiseRef = useRef<Promise<
    PurchaseInvoiceRecord[]
  > | null>(null);
  const grnsPromiseRef = useRef<Promise<GRNRecord[]> | null>(null);
  const purchaseReturnsPromiseRef = useRef<Promise<
    PurchaseReturnRecord[]
  > | null>(null);

  /**
   * Load Suppliers
   */
  const loadSuppliers = useCallback(async (): Promise<Supplier[]> => {
    if (suppliersPromiseRef.current) {
      return suppliersPromiseRef.current;
    }

    setSuppliersLoading(true);
    setSuppliersError(null);

    const promise = api
      .getSuppliers()
      .then((data) => {
        const validated = ensureArray<Supplier>(data, "suppliers");
        setSuppliers(validated);
        setSuppliersLoading(false);
        logger.log("Suppliers loaded:", validated.length, "records");
        return validated;
      })
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : "Failed to load suppliers";
        setSuppliersError(message);
        setSuppliersLoading(false);
        logger.error("Failed to load suppliers:", error);
        showNotification({
          title: "Error",
          message: "Failed to load suppliers",
          color: "red",
        });
        return [];
      })
      .finally(() => {
        suppliersPromiseRef.current = null;
      });

    suppliersPromiseRef.current = promise;
    return promise;
  }, []);

  /**
   * Load Purchase Orders
   */
  const loadPurchases = useCallback(async (): Promise<PurchaseRecord[]> => {
    if (purchasesPromiseRef.current) {
      return purchasesPromiseRef.current;
    }

    setPurchasesLoading(true);
    setPurchasesError(null);

    const promise = api
      .getPurchases()
      .then((data) => {
        const validated = ensureArray<PurchaseRecord>(data, "purchases");
        setPurchases(validated);
        setPurchasesLoading(false);
        logger.log("Purchase orders loaded:", validated.length, "records");
        return validated;
      })
      .catch((error) => {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load purchase orders";
        setPurchasesError(message);
        setPurchasesLoading(false);
        logger.error("Failed to load purchase orders:", error);
        showNotification({
          title: "Error",
          message: "Failed to load purchase orders",
          color: "red",
        });
        return [];
      })
      .finally(() => {
        purchasesPromiseRef.current = null;
      });

    purchasesPromiseRef.current = promise;
    return promise;
  }, []);

  /**
   * Load Purchase Invoices
   */
  const loadPurchaseInvoices = useCallback(async (): Promise<
    PurchaseInvoiceRecord[]
  > => {
    if (purchaseInvoicesPromiseRef.current) {
      return purchaseInvoicesPromiseRef.current;
    }

    setPurchaseInvoicesLoading(true);
    setPurchaseInvoicesError(null);

    const promise = api
      .getPurchaseInvoices()
      .then((data) => {
        const validated = ensureArray<PurchaseInvoiceRecord>(
          data,
          "purchase invoices"
        );
        setPurchaseInvoices(validated);
        setPurchaseInvoicesLoading(false);
        logger.log("Purchase invoices loaded:", validated.length, "records");
        return validated;
      })
      .catch((error) => {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load purchase invoices";
        setPurchaseInvoicesError(message);
        setPurchaseInvoicesLoading(false);
        logger.error("Failed to load purchase invoices:", error);
        showNotification({
          title: "Error",
          message: "Failed to load purchase invoices",
          color: "red",
        });
        return [];
      })
      .finally(() => {
        purchaseInvoicesPromiseRef.current = null;
      });

    purchaseInvoicesPromiseRef.current = promise;
    return promise;
  }, []);

  /**
   * Load GRNs
   */
  const loadGrns = useCallback(async (): Promise<GRNRecord[]> => {
    if (grnsPromiseRef.current) {
      return grnsPromiseRef.current;
    }

    setGrnsLoading(true);
    setGrnsError(null);

    const promise = api
      .getGRNs()
      .then((data) => {
        const validated = ensureArray<GRNRecord>(data, "GRNs");
        setGrns(validated);
        setGrnsLoading(false);
        logger.log("GRNs loaded:", validated.length, "records");
        return validated;
      })
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : "Failed to load GRNs";
        setGrnsError(message);
        setGrnsLoading(false);
        logger.error("Failed to load GRNs:", error);
        showNotification({
          title: "Error",
          message: "Failed to load GRNs",
          color: "red",
        });
        return [];
      })
      .finally(() => {
        grnsPromiseRef.current = null;
      });

    grnsPromiseRef.current = promise;
    return promise;
  }, []);

  /**
   * Load Purchase Returns
   */
  const loadPurchaseReturns = useCallback(async (): Promise<
    PurchaseReturnRecord[]
  > => {
    if (purchaseReturnsPromiseRef.current) {
      return purchaseReturnsPromiseRef.current;
    }

    setPurchaseReturnsLoading(true);
    setPurchaseReturnsError(null);

    const promise = api
      .getPurchaseReturns()
      .then((data) => {
        const validated = ensureArray<PurchaseReturnRecord>(
          data,
          "purchase returns"
        );
        setPurchaseReturns(validated);
        setPurchaseReturnsLoading(false);
        logger.log("Purchase returns loaded:", validated.length, "records");
        return validated;
      })
      .catch((error) => {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load purchase returns";
        setPurchaseReturnsError(message);
        setPurchaseReturnsLoading(false);
        logger.error("Failed to load purchase returns:", error);
        showNotification({
          title: "Error",
          message: "Failed to load purchase returns",
          color: "red",
        });
        return [];
      })
      .finally(() => {
        purchaseReturnsPromiseRef.current = null;
      });

    purchaseReturnsPromiseRef.current = promise;
    return promise;
  }, []);

  const value: PurchaseContextType = {
    suppliers,
    suppliersLoading,
    suppliersError,
    setSuppliers,
    loadSuppliers,

    purchases,
    purchasesLoading,
    purchasesError,
    setPurchases,
    loadPurchases,

    purchaseInvoices,
    purchaseInvoicesLoading,
    purchaseInvoicesError,
    setPurchaseInvoices,
    loadPurchaseInvoices,

    grns,
    grnsLoading,
    grnsError,
    setGrns,
    loadGrns,

    purchaseReturns,
    purchaseReturnsLoading,
    purchaseReturnsError,
    setPurchaseReturns,
    loadPurchaseReturns,
  };

  return (
    <PurchaseContext.Provider value={value}>
      {children}
    </PurchaseContext.Provider>
  );
}

/**
 * Hook to use Purchase Context
 */
export function usePurchase(): PurchaseContextType {
  const context = React.useContext(PurchaseContext);
  if (!context) {
    throw new Error("usePurchase must be used within a PurchaseProvider");
  }
  return context;
}

export { PurchaseContext };
export type {
  PurchaseRecord,
  PurchaseInvoiceRecord,
  GRNRecord,
  PurchaseReturnRecord,
};
