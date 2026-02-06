/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
import { useInventory } from "../InventoryContext/InventoryContext";

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
  // Purchases State
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

  // Suppliers State
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [suppliersError, setSuppliersError] = useState<string | null>(null);

  // Access Inventory Context for stock updates
  const { setInventory } = useInventory();

  // Refs to track loading promises
  const purchasesPromiseRef = useRef<Promise<PurchaseRecord[]> | null>(null);
  const purchaseInvoicesPromiseRef = useRef<Promise<
    PurchaseInvoiceRecord[]
  > | null>(null);
  const grnsPromiseRef = useRef<Promise<GRNRecord[]> | null>(null);
  const purchaseReturnsPromiseRef = useRef<Promise<
    PurchaseReturnRecord[]
  > | null>(null);
  const suppliersPromiseRef = useRef<Promise<Supplier[]> | null>(null);

  /**
   * Load Purchases
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
        logger.log("Purchases loaded:", validated.length, "records");
        return validated;
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load purchases";
        setPurchasesError(message);
        setPurchasesLoading(false);
        logger.error("Failed to load purchases:", error);
        showNotification({
          title: "Error",
          message: "Failed to load purchases",
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
          "purchaseInvoices"
        );
        setPurchaseInvoices(validated);
        setPurchaseInvoicesLoading(false);
        logger.log("Purchase invoices loaded:", validated.length, "records");
        return validated;
      })
      .catch((error: unknown) => {
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
        const validated = ensureArray<GRNRecord>(data, "grns");
        setGrns(validated);
        setGrnsLoading(false);
        logger.log("GRNs loaded:", validated.length, "records");
        return validated;
      })
      .catch((error: unknown) => {
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
          "purchaseReturns"
        );
        setPurchaseReturns(validated);
        setPurchaseReturnsLoading(false);
        logger.log("Purchase returns loaded:", validated.length, "records");
        return validated;
      })
      .catch((error: unknown) => {
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
      .getSuppliers?.()
      .then((data: any) => {
        const validated = ensureArray<Supplier>(data, "suppliers");
        setSuppliers(validated);
        setSuppliersLoading(false);
        logger.log("Suppliers loaded:", validated.length, "records");
        return validated;
      })
      .catch((error: unknown) => {
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

  // Derived state for suppliers select
  const suppliersForSelect = React.useMemo(() => {
    return suppliers.map((s) => ({
      value: s._id || "",
      label: s.name,
    }));
  }, [suppliers]);

  // ===== PURCHASE CRUD =====
  const createPurchase = useCallback(
    async (payload: import("../../lib/api").PurchaseRecordPayload) => {
      setPurchasesLoading(true);
      try {
        const created = await api.createPurchase(payload);
        const purchase = {
          ...created,
          id: String((created as any).id ?? (created as any)._id ?? payload.poNumber),
        } as PurchaseRecord;
        
        setPurchases((prev) => [purchase, ...prev]);
        showNotification({
          title: "Purchase Created",
          message: "Purchase order has been created successfully",
          color: "green",
        });
        return purchase;
      } catch (err: unknown) {
        logger.error("Create purchase failed:", err);
        setPurchasesError((err as Error).message || "Failed to create purchase");
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
    []
  );

  // ... (keeping other functions intact, just targeting the block with error if possible, but replace_file_content works on chunks)
  // I will target the specific chunks to avoid overwriting too much.

  // Chunk 1: createPurchase syntax fix
  // Chunk 2: applyGrnToInventory unused variable
  // Chunk 3: applyPurchaseReturnToInventory casting
  // Chunk 4: updatePurchaseFromReturn property check

  // Wait, I can't do comments in ReplacementContent easily if I'm not careful.
  // I will use multiple replace_file_content calls or one big one?
  // The syntax error is at line 316. 
  // Unused gItemId at 415.
  // rItem casting at 542.
  // originalInvoiceNumber at 576.
  
  // I will use multi_replace_file_content.

  const updatePurchase = useCallback(
    async (
      id: string | number,
      payload: Partial<import("../../lib/api").PurchaseRecordPayload>
    ) => {
      setPurchasesLoading(true);
      try {
        const updated = await api.updatePurchaseByNumber(String(id), payload);
        const purchase = {
          ...updated,
          id: updated.id ?? id,
        } as PurchaseRecord;
        setPurchases((prev) =>
          prev.map((p) => (String(p.id) === String(id) ? purchase : p))
        );
        showNotification({
          title: "Purchase Updated",
          message: "Purchase order has been updated successfully",
          color: "blue",
        });
        return purchase;
      } catch (err: unknown) {
        logger.error("Update purchase failed:", err);
        setPurchasesError((err as Error).message || "Failed to update purchase");
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
    []
  );

  const deletePurchase = useCallback(async (id: string | number) => {
    setPurchasesLoading(true);
    try {
      await api.deletePurchaseByNumber(String(id));
      setPurchases((prev) => prev.filter((p) => String(p.id) !== String(id)));
      showNotification({
        title: "Purchase Deleted",
        message: "Purchase order has been removed",
        color: "orange",
      });
    } catch (err: unknown) {
      logger.error("Delete purchase failed:", err);
      setPurchasesError((err as Error).message || "Failed to delete purchase");
      showNotification({
        title: "Delete Failed",
        message: (err as Error).message || "Failed to delete purchase",
        color: "red",
      });
      throw err;
    } finally {
      setPurchasesLoading(false);
    }
  }, []);

  // ===== GRN LOGIC =====
  const applyGrnToInventory = useCallback(
    (grn: GRNRecord) => {
      if (!grn.items || grn.items.length === 0) return;
      logger.log("Applying GRN to Inventory:", grn);
      setInventory((prev) =>
        prev.map((item) => {
          const receivedItem = grn.items.find(
            (gItem) => {
              const itemId = item._id || "";
              return String(gItem.sku) === itemId;
            }
          );

          if (receivedItem) {
            const receivedQty = Number(receivedItem.quantity || 0);
            if (receivedQty > 0) {
              const oldStock = 
                item.openingStock ?? item.stock ?? item.quantity ?? 0;
              const newStock = Number(oldStock) + receivedQty;
              return {
                ...item,
                stock: newStock,
                openingStock: newStock,
                quantity: newStock,
                // salesRate: receivedItem.price ? Number(receivedItem.price) : item.salesRate, // price is cost?
              } as typeof item;
            }
          }
          return item;
        })
      );
    },
    [setInventory]
  );

  const updatePurchaseFromGrn = useCallback(
    (grn: GRNRecord) => {
      // Use linkedPoId as primary link
      if (!grn.linkedPoId && !grn.grnNumber) return; // fallback
      
      setPurchases((prev) =>
        prev.map((po) => {
          // Check if this PO is the one linked
          // Assuming po.id matches linkedPoId OR po.poNumber matches?
          // GRN likely links by ID or PO Number.
          if (
             (grn.linkedPoId && String(po.id) === String(grn.linkedPoId)) ||
             (grn.linkedPoId && String(po.poNumber) === String(grn.linkedPoId)) 
          ) {
            // Update received quantities in PO
            // PurchaseRecord has 'products', GRN has 'items'
            const updatedProducts =po.products.map((poItem) => {
              const grnItem = grn.items.find(
                (g) =>
                   // Try to match by SKU/ID or Name if available.
                   // PO Item has: id, productName. GRN Item has: sku.
                   // Assuming sku === id or we need name.
                   String(g.sku) === String(poItem.id) ||
                   String(g.sku) === String(poItem.inventoryId)
              );
              if (grnItem) {
                return {
                  ...poItem,
                  received:
                    (poItem.received || 0) + Number(grnItem.quantity || 0),
                };
              }
              return poItem;
            });
            // Check status update logic if needed
            return {
              ...po,
              products: updatedProducts,
            };
          }
          return po;
        })
      );
    },
    [setPurchases]
  );

  const createGrn = useCallback(
    async (payload: import("../../lib/api").GRNRecordPayload) => {
      setGrnsLoading(true);
      try {
        const created = await api.createGRN(payload);
        const grn = { ...created } as GRNRecord;
        setGrns((prev) => [grn, ...prev]);

        // Logic to update inventory
        applyGrnToInventory(grn);

        // Logic to update associated Purchase Order
        updatePurchaseFromGrn(grn);

        showNotification({
          title: "GRN Created",
          message: "Goods Received Note created and inventory updated",
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
    },
    [applyGrnToInventory, updatePurchaseFromGrn]
  );

  // ===== PURCHASE RETURN LOGIC =====

  const applyPurchaseReturnToInventory = useCallback(
    (ret: PurchaseReturnRecord) => {
      if (!ret.items || ret.items.length === 0) return;
      logger.log("Applying Purchase Return to Inventory (Deducting):", ret);
      setInventory((prev) =>
        prev.map((item) => {
          const returnItem = ret.items.find((rItem) => {
            const rItemAny = rItem as any;
            const key = String(
              rItemAny.id ?? rItemAny.productId ?? rItemAny.productName ?? ""
            );
            return (
              key &&
              (String(item._id) === key ||
                String(item.itemName) === key ||
                String(item.itemName) === String(rItemAny.productName))
            );
          });

          if (returnItem) {
            const returnQty = Number((returnItem as any).returnQty ?? 0);
            if (returnQty > 0) {
              const currentStock = Number(
                item.stock ?? item.openingStock ?? item.quantity ?? 0
              );
              // Ensure we don't go below zero
              const newStock = Math.max(0, currentStock - returnQty);
              return {
                ...item,
                stock: newStock,
                openingStock: newStock,
                quantity: newStock,
              } as typeof item;
            }
          }
          return item;
        })
      );
    },
    [setInventory]
  );

  const updatePurchaseFromReturn = useCallback(
    (ret: PurchaseReturnRecord) => {
      // Placeholder logic
    },
    []
  );

  const createPurchaseReturn = useCallback(
    async (payload: import("../../lib/api").PurchaseReturnRecordPayload) => {
      setPurchaseReturnsLoading(true);
      try {
        const created = await api.createPurchaseReturn(payload);
        const ret = { ...created } as PurchaseReturnRecord;
        setPurchaseReturns((prev) => [ret, ...prev]);

        // Inventory update
        applyPurchaseReturnToInventory(ret);

        showNotification({
          title: "Return Created",
          message: "Purchase return created and inventory updated",
          color: "green",
        });
        return ret;
      } catch (err: unknown) {
        logger.error("Create Purchase Return failed:", err);
        setPurchaseReturnsError(
          (err as Error).message || "Failed to create purchase return"
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
    [applyPurchaseReturnToInventory]
  );

  const processPurchaseReturn = useCallback(
    (ret: PurchaseReturnRecord) => {
      try {
        // Placeholder for return processing
      return { applied: true, message: "Processed" };
      } catch (e) {
        return { applied: false, message: (e as Error).message };
      }
    },
    [applyPurchaseReturnToInventory]
  );

  const value: PurchaseContextType = {
    suppliers,
    suppliersLoading,
    suppliersError,
    setSuppliers,
    loadSuppliers,
    suppliersForSelect,

    purchases,
    purchasesLoading,
    purchasesError,
    setPurchases,
    loadPurchases,
    createPurchase,
    updatePurchase,
    deletePurchase,

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
    createGrn,
    applyGrnToInventory,
    updatePurchaseFromGrn,

    purchaseReturns,
    purchaseReturnsLoading,
    purchaseReturnsError,
    setPurchaseReturns,
    loadPurchaseReturns,
    createPurchaseReturn,
    applyPurchaseReturnToInventory,
    updatePurchaseFromReturn,
    processPurchaseReturn,
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
