/**
 * Custom hook for inventory management
 * Extracted from DataContext to separate concerns and improve testability
 */

import { useState, useCallback } from "react";
import { showNotification } from "@mantine/notifications";
import { inventoryService } from "../api/services/inventoryService";
import { logger } from "../lib/logger";
import type { InventoryItem } from "../types";
import type { InventoryItemPayload } from "../api/services/salesService";

/**
 * Hook for managing inventory state and operations
 * @returns Inventory state and CRUD operations
 */
export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all inventory items from the backend
   */
  const loadInventory = useCallback(async (): Promise<InventoryItem[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getAll();
      // Map _id to string for type safety
      const mapped = (data || []).map((item) => ({
        ...item,
        _id: item._id ? String(item._id) : "",
        unit: item.unit !== undefined ? String(item.unit) : undefined,
      }));
      setInventory(mapped);
      return mapped;
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || "Failed to load products";
      setError(errorMsg);
      showNotification({
        title: "Load Products Failed",
        message: errorMsg,
        color: "red",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new inventory item
   */
  const createInventoryItem = useCallback(
    async (payload: InventoryItemPayload): Promise<InventoryItem> => {
      setLoading(true);
      try {
        const created = await inventoryService.create(payload);
        const item: InventoryItem = {
          ...created,
          _id: created._id ? String(created._id) : "",
          unit: created.unit !== undefined ? String(created.unit) : undefined,
        };
        setInventory((prev) => [...prev, item]);
        showNotification({
          title: "Product Created",
          message: `${payload.itemName || "Product"} has been added`,
          color: "green",
        });
        return item;
      } catch (err: unknown) {
        logger.error("Create product failed:", err);
        setError((err as Error).message || "Failed to create product");
        showNotification({
          title: "Create Failed",
          message: (err as Error).message || "Failed to create product",
          color: "red",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Update an existing inventory item
   */
  const updateInventoryItem = useCallback(
    async (
      id: string,
      payload: Partial<InventoryItemPayload>
    ): Promise<InventoryItem> => {
      setLoading(true);
      try {
        const updated = await inventoryService.update(id, payload);
        const item: InventoryItem = {
          ...updated,
          _id: updated._id ? String(updated._id) : id,
          unit: updated.unit !== undefined ? String(updated.unit) : undefined,
        };
        setInventory((prev) => prev.map((i) => (i._id === id ? item : i)));
        showNotification({
          title: "Product Updated",
          message: "Product has been updated successfully",
          color: "blue",
        });
        return item;
      } catch (err: unknown) {
        logger.error("Update product failed:", err);
        setError((err as Error).message || "Failed to update product");
        showNotification({
          title: "Update Failed",
          message: (err as Error).message || "Failed to update product",
          color: "red",
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Delete an inventory item
   */
  const deleteInventoryItem = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    try {
      await inventoryService.delete(id);
      setInventory((prev) => prev.filter((i) => i._id !== id));
      showNotification({
        title: "Product Deleted",
        message: "Product has been removed",
        color: "orange",
      });
    } catch (err: unknown) {
      logger.error("Delete product failed:", err);
      setError((err as Error).message || "Failed to delete product");
      showNotification({
        title: "Delete Failed",
        message: (err as Error).message || "Failed to delete product",
        color: "red",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    inventory,
    loading,
    error,
    setInventory,
    loadInventory,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
  };
}
