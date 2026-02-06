/**
 * Expenses Context Types
 *
 * Type definitions for expense management.
 */

export interface Expense {
  id: string;
  expenseNumber: string;
  date: string | Date;
  categoryType: string;
  description?: string;
  amount: number;
  paymentMethod?: "Cash" | "Card";
  reference?: string;
  remarks?: string;
  createdAt?: string | Date;
}

export interface ExpensesContextType {
  // Expenses
  expenses: Expense[];
  expensesLoading: boolean;
  expensesError: string | null;
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  loadExpenses: () => Promise<Expense[]>;
  createExpense: (
    payload: Omit<Expense, "id" | "createdAt" | "expenseNumber">
  ) => Promise<Expense>;
  updateExpense: (id: string, payload: Partial<Expense>) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
}
