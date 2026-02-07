import { axiosClient } from "../client/axiosClient";
import { ENDPOINTS } from "../client/apiConfig";
import { logger } from "@/lib/logger";
import type { QuotationRecordPayload } from "./salesService";

/**
 * Quotation Service
 * Handles all quotation-related API calls
 */
export const quotationService = {
  /**
   * Get all quotations
   */
  async getAll() {
    const { data } = await axiosClient.get<QuotationRecordPayload[]>(
      ENDPOINTS.QUOTATIONS
    );
    return data;
  },

  /**
   * Get quotation by quotation number
   */
  async getByQuotationNumber(quotationNumber: string) {
    try {
      const { data } = await axiosClient.get(
        `${ENDPOINTS.QUOTATIONS}/${encodeURIComponent(quotationNumber)}`
      );
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      const status = error.response?.status;
      if (status && status === 404) {
        // Fallback: fetch all and find
        const { data } = await axiosClient.get<QuotationRecordPayload[]>(
          ENDPOINTS.QUOTATIONS
        );
        return (data || []).find(
          (q: QuotationRecordPayload) =>
            String(q.quotationNumber) === String(quotationNumber)
        );
      }
      throw error;
    }
  },

  /**
   * Create a new quotation
   */
  async create(payload: QuotationRecordPayload) {
    logger.log("quotationService.create called with payload:", payload);
    try {
      const { data } = await axiosClient.post<QuotationRecordPayload>(
        ENDPOINTS.QUOTATIONS,
        payload
      );
      logger.log("quotationService.create response data:", data);
      return data;
    } catch (error) {
      logger.error("quotationService.create error:", error);
      throw error;
    }
  },

  /**
   * Update quotation by quotation number
   */
  async updateByQuotationNumber(
    quotationNumber: string,
    patch: Partial<QuotationRecordPayload>
  ) {
    try {
      const { data } = await axiosClient.put(
        `${ENDPOINTS.QUOTATIONS}/${encodeURIComponent(quotationNumber)}`,
        patch
      );
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      const status = error.response?.status;
      if (status && status !== 404) throw error;

      // Fallback: fetch and update by ID
      const quotation = await quotationService.getByQuotationNumber(
        quotationNumber
      );
      if (!quotation)
        throw new Error(`Quotation not found: ${quotationNumber}`);
      const id =
        (quotation as { _id?: string })._id ??
        (quotation as { id?: string }).id;
      if (!id)
        throw new Error(`Quotation has no valid ID: ${quotationNumber}`);
      return quotationService.updateById(id, patch);
    }
  },

  /**
   * Update quotation by ID (fallback)
   */
  async updateById(
    id: string | number,
    patch: Partial<QuotationRecordPayload>
  ) {
    const { data } = await axiosClient.put(
      `${ENDPOINTS.QUOTATIONS}/${String(id)}`,
      patch
    );
    return data;
  },

  /**
   * Delete quotation by quotation number
   */
  async deleteByQuotationNumber(quotationNumber: string) {
    try {
      const { data} = await axiosClient.delete(
        `${ENDPOINTS.QUOTATIONS}/${encodeURIComponent(quotationNumber)}`
      );
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      const status = error.response?.status;
      if (status && status !== 404) throw error;

      // Fallback: fetch and delete by ID
      const quotation = await quotationService.getByQuotationNumber(
        quotationNumber
      );
      if (!quotation)
        throw new Error(`Quotation not found: ${quotationNumber}`);
      const id =
        (quotation as { _id?: string })._id ??
        (quotation as { id?: string }).id;
      if (!id)
        throw new Error(`Quotation has no valid ID: ${quotationNumber}`);
      return quotationService.deleteById(id);
    }
  },

  /**
   * Delete quotation by ID (fallback)
   */
  async deleteById(id: string | number) {
    const { data } = await axiosClient.delete(
      `${ENDPOINTS.QUOTATIONS}/${String(id)}`
    );
    return data;
  },
};
