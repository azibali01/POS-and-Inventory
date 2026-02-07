/**
 * API Services Barrel Export
 * Import services from a single location
 */

export { salesService, saleReturnService } from "./services/salesService";
export { quotationService } from "./services/quotationService";
export { customerService } from "./services/customerService";
export { inventoryService, colorService, categoryService } from "./services/inventoryService";
export { axiosClient, unwrapPaginated } from "./client/axiosClient";
export { ENDPOINTS } from "./client/apiConfig";

// Re-export types
export type {
  InventoryItemPayload,
  PaymentMethod,
  CustomerPayload,
  SaleRecordPayload,
  QuotationRecordPayload,
} from "./services/salesService";

export type { ColorPayload, CategoryPayload } from "./services/inventoryService";
