/**
 * Application-wide constants
 *
 * Centralizes all magic strings, numbers, and configuration values
 * used throughout the application.
 */

export const APP_CONSTANTS = {
  // Application
  APP_NAME: "7 Star Traders",

  // LocalStorage Keys
  STORAGE_KEYS: {
    AUTH_USER: "auth_user",
    THEME: "app_theme",
    DRAFT_PREFIX: "draft_",
  },

  // API
  API: {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  },

  // Date Formats
  DATE_FORMATS: {
    DISPLAY: "MMM DD, YYYY",
    DISPLAY_WITH_TIME: "MMM DD, YYYY HH:mm",
    API: "YYYY-MM-DD",
    API_WITH_TIME: "YYYY-MM-DD HH:mm:ss",
  },

  // Currency
  CURRENCY: {
    SYMBOL: "Rs.",
    CODE: "PKR",
    DECIMAL_PLACES: 2,
  },

  // Validation
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_NAME_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
  },

  // Payment Methods
  PAYMENT_METHODS: ["Cash", "Card", "Bank Transfer", "Cheque"] as const,

  // Expense Categories
  EXPENSE_CATEGORIES: [
    "Rent",
    "Utilities",
    "Transportation",
    "Salary",
    "Maintenance",
    "Other",
  ] as const,

  // Invoice Status
  INVOICE_STATUS: {
    DRAFT: "draft",
    PENDING: "pending",
    PAID: "paid",
    CANCELLED: "cancelled",
  } as const,

  // Purchase Order Status
  PO_STATUS: {
    PENDING: "pending",
    PARTIAL: "partial",
    RECEIVED: "received",
    CANCELLED: "cancelled",
  } as const,

  // Table Settings
  TABLE: {
    ROWS_PER_PAGE: 20,
    VIRTUALIZATION_THRESHOLD: 100, // Use virtual scrolling above this
  },

  // Autosave
  AUTOSAVE: {
    DEBOUNCE_DELAY: 2000, // 2 seconds
    ENABLED: true,
  },

  // Print Settings
  PRINT: {
    PAGE_SIZE: "A4",
    ORIENTATION: "portrait",
    MARGIN: "16mm",
  },
} as const;

// Export individual constants for convenience
export const API_TIMEOUT = APP_CONSTANTS.API.TIMEOUT;
export const MAX_ITEMS_LIMIT = 10000; // Maximum items to fetch in a single request
export const LOW_STOCK_THRESHOLD = 15; // Threshold for low stock warnings

export const {
  STORAGE_KEYS,
  DATE_FORMATS,
  CURRENCY,
  PAYMENT_METHODS,
  EXPENSE_CATEGORIES,
} = APP_CONSTANTS;

// Type exports for type safety
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type InvoiceStatus =
  (typeof APP_CONSTANTS.INVOICE_STATUS)[keyof typeof APP_CONSTANTS.INVOICE_STATUS];
export type POStatus =
  (typeof APP_CONSTANTS.PO_STATUS)[keyof typeof APP_CONSTANTS.PO_STATUS];
