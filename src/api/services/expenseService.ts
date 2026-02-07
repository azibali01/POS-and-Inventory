import { axiosClient } from "../client/axiosClient";
import { ENDPOINTS } from "../client/apiConfig";

/**
 * Expense Payload Type
 * Represents the API response/request format for expenses
 */
export interface ExpensePayload {
  _id?: string | number;
  id?: string;
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

/**
 * Expense Service
 * Handles all expense-related API calls
 */
export const expenseService = {
  /**
   * Get all expenses
   */
  async getAll(): Promise<ExpensePayload[]> {
    const { data } = await axiosClient.get<ExpensePayload[]>(ENDPOINTS.EXPENSES);
    return data;
  },

  /**
   * Get expense by ID
   */
  async getById(id: string): Promise<ExpensePayload> {
    const { data } = await axiosClient.get<ExpensePayload>(
      `${ENDPOINTS.EXPENSES}/${id}`
    );
    return data;
  },

  /**
   * Create a new expense
   */
  async create(payload: ExpensePayload): Promise<ExpensePayload> {
    const { data } = await axiosClient.post<ExpensePayload>(
      ENDPOINTS.EXPENSES,
      payload
    );
    return data;
  },

  /**
   * Update expense by ID
   */
  async update(
    id: string,
    patch: Partial<ExpensePayload>
  ): Promise<ExpensePayload> {
    const { data } = await axiosClient.put<ExpensePayload>(
      `${ENDPOINTS.EXPENSES}/${id}`,
      patch
    );
    return data;
  },

  /**
   * Delete expense by ID
   */
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`${ENDPOINTS.EXPENSES}/${id}`);
  },
};
