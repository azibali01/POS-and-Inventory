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
      .catch((error) => {
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
      .catch((error) => {
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
      .catch((error) => {
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

  const value: InventoryContextType = {
    inventory,
    inventoryLoading,
    inventoryError,
    setInventory,
    loadInventory,

    categories,
    categoriesLoading,
    categoriesError,
    setCategories,
    loadCategories,

    colors,
    colorsLoading,
    colorsError,
    setColors,
    loadColors,
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
