import { axiosClient } from "../client/axiosClient";
import { ENDPOINTS } from "../client/apiConfig";
import type { CustomerPayload } from "./salesService";

/**
 * Customer Service
 * Handles all customer-related API calls
 */
export const customerService = {
  /**
   * Get all customers
   */
  async getAll() {
    const { data } = await axiosClient.get<CustomerPayload[]>(
      ENDPOINTS.CUSTOMERS
    );
    return data;
  },

  /**
   * Get customer by ID
   */
  async getById(id: string | number) {
    const { data } = await axiosClient.get(
      `${ENDPOINTS.CUSTOMERS}/${String(id)}`
    );
    return data;
  },

  /**
   * Create a new customer
   */
  async create(payload: CustomerPayload) {
    const { data } = await axiosClient.post<CustomerPayload>(
      ENDPOINTS.CUSTOMERS,
      payload
    );
    return data;
  },

  /**
   * Update customer by ID
   */
  async update(id: string | number, patch: Partial<CustomerPayload>) {
    const { data } = await axiosClient.put<CustomerPayload>(
      `${ENDPOINTS.CUSTOMERS}/${String(id)}`,
      patch
    );
    return data;
  },

  /**
   * Delete customer by ID
   */
  async delete(id: string | number) {
    const { data } = await axiosClient.delete(
      `${ENDPOINTS.CUSTOMERS}/${String(id)}`
    );
    return data;
  },

  /**
   * Search customers by name
   */
  async search(query: string) {
    const { data } = await axiosClient.get<CustomerPayload[]>(
      ENDPOINTS.CUSTOMERS,
      {
        params: { search: query },
      }
    );
    return data;
  },
};
