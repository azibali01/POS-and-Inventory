import { useCallback } from "react";

/**
 * Column configuration for keyboard navigation
 */
const NAVIGATION_COLUMNS = [
  "item",
  "color",
  "thickness",
  "length",
  "brand",
  "quantity",
  "rate",
  "discount",
  "discountAmount",
] as const;

type NavigationColumn = (typeof NAVIGATION_COLUMNS)[number];

/**
 * Custom hook for keyboard navigation in tables
 * Handles Enter key to move between cells, and creates new rows when needed
 */
export function useKeyboardNav(
  itemCount: number,
  onAddRow: () => void
) {
  /**
   * Focus on a specific input element
   */
  const focusInput = useCallback((rowIdx: number, col: string) => {
    setTimeout(() => {
      const element = document.getElementById(`input-row-${rowIdx}-${col}`);
      element?.focus();
    }, 0);
  }, []);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      currentRow: number,
      currentCol: NavigationColumn
    ) => {
      if (e.key === "Enter") {
        e.preventDefault();

        const colIdx = NAVIGATION_COLUMNS.indexOf(currentCol);

        // Move to next column in same row
        if (colIdx < NAVIGATION_COLUMNS.length - 1) {
          const nextCol = NAVIGATION_COLUMNS[colIdx + 1];
          focusInput(currentRow, nextCol);
        }
        // Move to next row (first column)
        else {
          // If on last row, add new row
          if (currentRow === itemCount - 1) {
            onAddRow();
            // Focus will be set after new row is added
            setTimeout(() => {
              focusInput(currentRow + 1, "item");
            }, 50);
          } else {
            // Move to next existing row
            focusInput(currentRow + 1, "item");
          }
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (currentRow < itemCount - 1) {
          focusInput(currentRow + 1, currentCol);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentRow > 0) {
          focusInput(currentRow - 1, currentCol);
        }
      } else if (e.key === "ArrowRight" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const colIdx = NAVIGATION_COLUMNS.indexOf(currentCol);
        if (colIdx < NAVIGATION_COLUMNS.length - 1) {
          const nextCol = NAVIGATION_COLUMNS[colIdx + 1];
          focusInput(currentRow, nextCol);
        }
      } else if (e.key === "ArrowLeft" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const colIdx = NAVIGATION_COLUMNS.indexOf(currentCol);
        if (colIdx > 0) {
          const prevCol = NAVIGATION_COLUMNS[colIdx - 1];
          focusInput(currentRow, prevCol);
        }
      }
    },
    [itemCount, onAddRow, focusInput]
  );

  return {
    handleKeyDown,
    focusInput,
    columns: NAVIGATION_COLUMNS,
  };
}
