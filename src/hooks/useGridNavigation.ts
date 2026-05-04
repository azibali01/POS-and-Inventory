import { useCallback } from "react";

/**
 * Excel-style "Arrow Key" navigation for grid tables.
 * Apply `{...gridNavProps}` to a container wrapper spanning the table.
 * Apply `data-row-index={index}` and `data-field-name="fieldName"` to inputs or their wrappers.
 */
export function useGridNavigation(options: { tableId?: string } = {}) {
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      // Only handle Up and Down arrows
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;

      // Allow default behavior for multiline textareas or dropdowns if needed,
      // but typically we can just intercept them.
      // If the user is selecting text, we might want to bypass, but for grids it's standard to move cells.
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

      const activeEl = document.activeElement as HTMLElement;
      if (!activeEl) return;

      // Find the defining element (either the active element or its closest wrapper)
      const cellEl = activeEl.closest(
        "[data-row-index][data-field-name]",
      ) as HTMLElement;
      if (!cellEl) return;

      const rowIndexStr = cellEl.getAttribute("data-row-index");
      const fieldName = cellEl.getAttribute("data-field-name");

      if (!rowIndexStr || !fieldName) return;

      const rowIndex = parseInt(rowIndexStr, 10);
      const nextIndex = e.key === "ArrowDown" ? rowIndex + 1 : rowIndex - 1;

      // Identify the table scope
      const tableId =
        cellEl.getAttribute("data-table-id") || options.tableId || "";
      const tableSelector = tableId ? `[data-table-id="${tableId}"]` : "";

      const nextSelector = `${tableSelector}[data-row-index="${nextIndex}"][data-field-name="${fieldName}"]`;
      const nextEl = document.querySelector(nextSelector) as HTMLElement;

      if (nextEl) {
        e.preventDefault();

        // If the wrapper itself is focusable, focus it. Otherwise find inner focusable.
        const focusTarget = nextEl.matches(
          "input, button, select, textarea, [tabindex]",
        )
          ? nextEl
          : (nextEl.querySelector(
              "input, button, select, textarea, [tabindex]",
            ) as HTMLElement);

        if (focusTarget) {
          focusTarget.focus();
          if (
            focusTarget instanceof HTMLInputElement &&
            (focusTarget.type === "text" || focusTarget.type === "number")
          ) {
            // Slight delay to ensure focus is complete before selecting
            setTimeout(() => focusTarget.select(), 0);
          }
        } else {
          nextEl.focus();
        }
      }
    },
    [options.tableId],
  );

  return { onKeyDown };
}
