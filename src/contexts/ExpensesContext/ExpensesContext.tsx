import React, { createContext, useState, useCallback, useRef } from "react";
import { showNotification } from "@mantine/notifications";
import * as api from "../../lib/api";
import { ensureArray } from "../../lib/api-response-utils";
import { logger } from "../../lib/logger";
import type { Expense, ExpensesContextType } from "./types";

const ExpensesContext = createContext<ExpensesContextType | undefined>(
  undefined
);

/**
 * Expenses Context Provider
 *
 * Manages state for:
 * - Expenses
 */
export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  // Expenses State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [expensesError, setExpensesError] = useState<string | null>(null);

  // Refs to track loading promises
  const expensesPromiseRef = useRef<Promise<Expense[]> | null>(null);

  /**
   * Load Expenses
   */
  const loadExpenses = useCallback(async (): Promise<Expense[]> => {
    if (expensesPromiseRef.current) {
      return expensesPromiseRef.current;
    }

    setExpensesLoading(true);
    setExpensesError(null);

    const promise = api
      .getExpenses()
      .then((data) => {
        const validated = ensureArray<Expense>(data, "expenses");
        setExpenses(validated);
        setExpensesLoading(false);
        logger.log("Expenses loaded:", validated.length, "records");
        return validated;
      })
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : "Failed to load expenses";
        setExpensesError(message);
        setExpensesLoading(false);
        logger.error("Failed to load expenses:", error);
        showNotification({
          title: "Error",
          message: "Failed to load expenses",
          color: "red",
        });
        return [];
      })
      .finally(() => {
        expensesPromiseRef.current = null;
      });

    expensesPromiseRef.current = promise;
    return promise;
  }, []);

  const value: ExpensesContextType = {
    expenses,
    expensesLoading,
    expensesError,
    setExpenses,
    loadExpenses,
  };

  return (
    <ExpensesContext.Provider value={value}>
      {children}
    </ExpensesContext.Provider>
  );
}

/**
 * Hook to use Expenses Context
 */
export function useExpenses(): ExpensesContextType {
  const context = React.useContext(ExpensesContext);
  if (!context) {
    throw new Error("useExpenses must be used within an ExpensesProvider");
  }
  return context;
}

export { ExpensesContext };
export type { Expense };
