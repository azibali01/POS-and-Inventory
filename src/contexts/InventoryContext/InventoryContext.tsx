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
  InventoryItem,
  Category,
  Color,
  InventoryContextType,
} from "./types";

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

/**
 * Inventory Context Provider
 *
 * Manages state for:
 * - Products/Inventory items
 * - Categories
 * - Colors
 *
 * Provides CRUD operations and loading states for inventory-related data.
 */
export function InventoryProvider({ children }: { children: React.ReactNode }) {
  // Inventory State
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  // Categories State
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Colors State
  const [colors, setColors] = useState<Color[]>([]);
  const [colorsLoading, setColorsLoading] = useState(false);
  const [colorsError, setColorsError] = useState<string | null>(null);

  // Refs to track loading promises
  const inventoryPromiseRef = useRef<Promise<InventoryItem[]> | null>(null);
  const categoriesPromiseRef = useRef<Promise<Category[]> | null>(null);
  const colorsPromiseRef = useRef<Promise<Color[]> | null>(null);

  /**
   * Load Inventory/Products
   */
  const loadInventory = useCallback(async (): Promise<InventoryItem[]> => {
    if (inventoryPromiseRef.current) {
      return inventoryPromiseRef.current;
    }

    setInventoryLoading(true);
    setInventoryError(null);

    const promise = api
      .getInventory()
      .then((data) => {
        const validated = ensureArray<InventoryItem>(data, "inventory");
        setInventory(validated);
        setInventoryLoading(false);
        logger.log("Inventory loaded:", validated.length, "items");
        return validated;
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Failed to load inventory";
        setInventoryError(message);
        setInventoryLoading(false);
        logger.error("Failed to load inventory:", error);
        showNotification({
          title: "Error",
          message: "Failed to load inventory",
          color: "red",
        });
        return [];
      })
      .finally(() => {
        inventoryPromiseRef.current = null;
      });

    inventoryPromiseRef.current = promise;
    return promise;
  }, []);

  /**
   * Load Categories
   */
  const loadCategories = useCallback(async (): Promise<Category[]> => {
    if (categoriesPromiseRef.current) {
      return categoriesPromiseRef.current;
    }

    setCategoriesLoading(true);
    setCategoriesError(null);

    const promise = api
      .getCategories()
      .then((data) => {
        const validated = ensureArray<Category>(data, "categories");
        setCategories(validated);
        setCategoriesLoading(false);
        logger.log("Categories loaded:", validated.length, "items");
        return validated;
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Failed to load categories";
        setCategoriesError(message);
        setCategoriesLoading(false);
        logger.error("Failed to load categories:", error);
        showNotification({
          title: "Error",
          message: "Failed to load categories",
          color: "red",
        });
        return [];
      })
      .finally(() => {
        categoriesPromiseRef.current = null;
      });

    categoriesPromiseRef.current = promise;
    return promise;
  }, []);

  /**
   * Load Colors
   */
  const loadColors = useCallback(async (): Promise<Color[]> => {
    if (colorsPromiseRef.current) {
      return colorsPromiseRef.current;
    }

    setColorsLoading(true);
    setColorsError(null);

    const promise = api
      .getColors()
      .then((data) => {
        const validated = ensureArray<Color>(data, "colors");
        setColors(validated);
        setColorsLoading(false);
        logger.log("Colors loaded:", validated.length, "items");
        return validated;
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Failed to load colors";
        setColorsError(message);
        setColorsLoading(false);
        logger.error("Failed to load colors:", error);
        showNotification({
          title: "Error",
          message: "Failed to load colors",
          color: "red",
        });
        return [];
      })
      .finally(() => {
        colorsPromiseRef.current = null;
      });

    colorsPromiseRef.current = promise;
    return promise;
  }, []);

  // ===== INVENTORY CRUD =====
  const createInventory = useCallback(
    async (payload: import("../../lib/api").InventoryItemPayload) => {
      setInventoryLoading(true);
      try {
        const created = await api.createInventory(payload);
        const item = { ...created } as InventoryItem;
        setInventory((prev) => [item, ...prev]);
        showNotification({
          title: "Product Created",
          message: `${item.itemName} has been created`,
          color: "green",
        });
        return item;
      } catch (err: unknown) {
        logger.error("Create inventory failed:", err);
        setInventoryError(
          (err as Error).message || "Failed to create inventory item"
        );
        showNotification({
          title: "Create Failed",
          message: (err as Error).message || "Failed to create inventory item",
          color: "red",
        });
        throw err;
      } finally {
        setInventoryLoading(false);
      }
    },
    []
  );

  const updateInventory = useCallback(
    async (
      id: string,
      payload: Partial<import("../../lib/api").InventoryItemPayload>
    ) => {
      setInventoryLoading(true);
      try {
        const updated = await api.updateInventory(id, payload);
        const item = { ...updated } as InventoryItem;
        setInventory((prev) =>
          prev.map((i) => (String(i._id) === String(id) ? item : i))
        );
        showNotification({
          title: "Product Updated",
          message: `${item.itemName} has been updated`,
          color: "blue",
        });
        return item;
      } catch (err: unknown) {
        logger.error("Update inventory failed:", err);
        setInventoryError(
          (err as Error).message || "Failed to update inventory item"
        );
        showNotification({
          title: "Update Failed",
          message: (err as Error).message || "Failed to update inventory item",
          color: "red",
        });
        throw err;
      } finally {
        setInventoryLoading(false);
      }
    },
    []
  );

  const deleteInventory = useCallback(async (id: string) => {
    setInventoryLoading(true);
    try {
      await api.deleteInventory(id);
      setInventory((prev) => prev.filter((i) => String(i._id) !== String(id)));
      showNotification({
        title: "Product Deleted",
        message: "Inventory item has been removed",
        color: "orange",
      });
    } catch (err: unknown) {
      logger.error("Delete inventory failed:", err);
      setInventoryError(
        (err as Error).message || "Failed to delete inventory item"
      );
      showNotification({
        title: "Delete Failed",
        message: (err as Error).message || "Failed to delete inventory item",
        color: "red",
      });
      throw err;
    } finally {
      setInventoryLoading(false);
    }
  }, []);

  // ===== CATEGORIES CRUD =====
  const createCategory = useCallback(
    async (payload: Omit<Category, "id"> | { name: string }) => {
      setCategoriesLoading(true);
      try {
        const created = await api.createCategory(payload);
        const category = {
          ...created,
          id: created.id ?? created._id,
        } as Category;
        setCategories((prev) => [category, ...prev]);
        showNotification({
          title: "Category Created",
          message: `${category.name} has been created`,
          color: "green",
        });
        return category;
      } catch (err: unknown) {
        logger.error("Create category failed:", err);
        setCategoriesError((err as Error).message || "Failed to create category");
        showNotification({
          title: "Create Failed",
          message: (err as Error).message || "Failed to create category",
          color: "red",
        });
        throw err;
      } finally {
        setCategoriesLoading(false);
      }
    },
    []
  );

  const updateCategory = useCallback(
    async (id: string | number, payload: Partial<Category>) => {
      setCategoriesLoading(true);
      try {
        const updated = await api.updateCategory(String(id), payload);
        const category = {
          ...updated,
          id: updated.id ?? updated._id ?? id,
        } as Category;
        setCategories((prev) =>
          prev.map((c) => (String(c.id) === String(id) ? category : c))
        );
        showNotification({
          title: "Category Updated",
          message: `${category.name} has been updated`,
          color: "blue",
        });
        return category;
      } catch (err: unknown) {
        logger.error("Update category failed:", err);
        setCategoriesError((err as Error).message || "Failed to update category");
        showNotification({
          title: "Update Failed",
          message: (err as Error).message || "Failed to update category",
          color: "red",
        });
        throw err;
      } finally {
        setCategoriesLoading(false);
      }
    },
    []
  );

  const deleteCategory = useCallback(async (id: string | number) => {
    setCategoriesLoading(true);
    try {
      await api.deleteCategory(String(id));
      setCategories((prev) => prev.filter((c) => String(c.id) !== String(id)));
      showNotification({
        title: "Category Deleted",
        message: "Category has been removed",
        color: "orange",
      });
    } catch (err: unknown) {
      logger.error("Delete category failed:", err);
      setCategoriesError((err as Error).message || "Failed to delete category");
      showNotification({
        title: "Delete Failed",
        message: (err as Error).message || "Failed to delete category",
        color: "red",
      });
      throw err;
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // ===== COLORS CRUD =====
  const createColor = useCallback(
    async (payload: { name: string; hex?: string }) => {
      setColorsLoading(true);
      try {
        const created = await api.createColor(payload);
        const color = {
          ...created,
          _id: created._id,
        } as Color;
        setColors((prev) => [color, ...prev]);
        showNotification({
          title: "Color Created",
          message: `${color.name} has been created`,
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
    },
    []
  );

  const updateColor = useCallback(
    async (id: string, payload: Partial<Color>) => {
      setColorsLoading(true);
      try {
        const updated = await api.updateColor(id, payload);
        const color = {
          ...updated,
          _id: updated._id ?? id,
        } as Color;
        setColors((prev) =>
          prev.map((c) => (String(c._id) === String(id) ? color : c))
        );
        showNotification({
          title: "Color Updated",
          message: `${color.name} has been updated`,
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
    []
  );

  const deleteColor = useCallback(async (id: string) => {
    setColorsLoading(true);
    try {
      await api.deleteColor(id);
      setColors((prev) => prev.filter((c) => String(c._id) !== String(id)));
      showNotification({
        title: "Color Deleted",
        message: "Color has been removed",
        color: "orange",
      });
    } catch (err: unknown) {
      logger.error("Delete color failed:", err);
      setColorsError((err as Error).message || "Failed to delete color");
      showNotification({
        title: "Delete Failed",
        message: (err as Error).message || "Failed to delete color",
        color: "red",
      });
      throw err;
    } finally {
      setColorsLoading(false);
    }
  }, []);

  const value: InventoryContextType = {
    inventory,
    inventoryLoading,
    inventoryError,
    setInventory,
    loadInventory,
    createInventory,
    updateInventory,
    deleteInventory,

    categories,
    categoriesLoading,
    categoriesError,
    setCategories,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,

    colors,
    colorsLoading,
    colorsError,
    setColors,
    loadColors,
    createColor,
    updateColor,
    deleteColor,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

/**
 * Hook to use Inventory Context
 */
export function useInventory(): InventoryContextType {
  const context = React.useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}

export { InventoryContext };
export type { InventoryItem, Category, Color };
