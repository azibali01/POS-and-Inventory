import { useState, useCallback } from "react";
import type { LineItem } from "@/utils/calculations/billCalculations";

/**
 * Custom hook for managing line items in sales/quotation documents
 * Handles CRUD operations on line items array
 */
export function useLineItems(initialItems: LineItem[] = []) {
  const [items, setItems] = useState<LineItem[]>(initialItems);

  /**
   * Update a specific line item by index
   */
  const updateItem = useCallback((rowIdx: number, patch: Partial<LineItem>) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === rowIdx ? { ...item, ...patch } : item))
    );
  }, []);

  /**
   * Add a new line item
   */
  const addItem = useCallback((item?: Partial<LineItem>) => {
    const newItem: LineItem = {
      unit: "",
      quantity: 1,
      salesRate: 0,
      discount: 0,
      amount: 0,
      thickness: 0,
      length: 0,
      totalGrossAmount: 0,
      totalNetAmount: 0,
      discountAmount: 0,
      itemName: "",
      color: "",
      brand: "",
      ...item,
    };
    setItems((prev) => [...prev, newItem]);
  }, []);

  /**
   * Remove a line item by index
   */
  const removeItem = useCallback((rowIdx: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== rowIdx));
  }, []);

  /**
   * Clear all line items
   */
  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  /**
   * Replace all line items
   */
  const setAllItems = useCallback((newItems: LineItem[]) => {
    setItems(newItems);
  }, []);

  /**
   * Duplicate a line item
   */
  const duplicateItem = useCallback((rowIdx: number) => {
    setItems((prev) => {
      const item = prev[rowIdx];
      if (!item) return prev;
      const duplicate = { ...item, _id: undefined }; // Remove ID for new item
      return [...prev.slice(0, rowIdx + 1), duplicate, ...prev.slice(rowIdx + 1)];
    });
  }, []);

  return {
    items,
    updateItem,
    addItem,
    removeItem,
    clearItems,
    setAllItems,
    duplicateItem,
  };
}
