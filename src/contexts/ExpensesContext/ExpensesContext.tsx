/* eslint-disable react-refresh/only-export-components */
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
      .catch((error: unknown) => {
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

  const createExpense = useCallback(
    async (payload: Omit<Expense, "id" | "createdAt" | "expenseNumber">) => {
      setExpensesLoading(true);
      try {
        const created = await api.createExpense(payload);
        const expense = { ...created } as Expense;
        setExpenses((prev) => [expense, ...prev]);
        showNotification({
          title: "Expense Created",
          message: "Expense record created successfully",
          color: "green",
        });
        return expense;
      } catch (err: unknown) {
        logger.error("Create expense failed:", err);
        setExpensesError((err as Error).message || "Failed to create expense");
        showNotification({
          title: "Create Failed",
          message: (err as Error).message || "Failed to create expense",
          color: "red",
        });
        throw err;
      } finally {
        setExpensesLoading(false);
      }
    },
    []
  );

  const updateExpense = useCallback(
    async (id: string, payload: Partial<Expense>) => {
      setExpensesLoading(true);
      try {
        const updated = await api.updateExpense(id, payload);
        const expense = { ...updated } as Expense;
        setExpenses((prev) =>
          prev.map((e) => (String(e.id) === String(id) ? expense : e))
        );
        showNotification({
          title: "Expense Updated",
          message: "Expense record updated successfully",
          color: "blue",
        });
        return expense;
      } catch (err: unknown) {
        logger.error("Update expense failed:", err);
        setExpensesError((err as Error).message || "Failed to update expense");
        showNotification({
          title: "Update Failed",
          message: (err as Error).message || "Failed to update expense",
          color: "red",
        });
        throw err;
      } finally {
        setExpensesLoading(false);
      }
    },
    []
  );

  const deleteExpense = useCallback(async (id: string) => {
    setExpensesLoading(true);
    try {
      await api.deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => String(e.id) !== String(id)));
      showNotification({
        title: "Expense Deleted",
        message: "Expense record removed",
        color: "orange",
      });
    } catch (err: unknown) {
      logger.error("Delete expense failed:", err);
      setExpensesError((err as Error).message || "Failed to delete expense");
      showNotification({
        title: "Delete Failed",
        message: (err as Error).message || "Failed to delete expense",
        color: "red",
      });
      throw err;
    } finally {
      setExpensesLoading(false);
    }
  }, []);

  const value: ExpensesContextType = {
    expenses,
    expensesLoading,
    expensesError,
    setExpenses,
    loadExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
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
