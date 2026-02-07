/**
 * Validation Utilities
 * Reusable validation functions for form inputs
 */

export const validators = {
  /**
   * Check if value is not empty
   */
  required: (value: unknown): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },

  /**
   * Validate email format
   */
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  /**
   * Validate phone number (10-15 digits)
   */
  phone: (value: string): boolean => {
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(value.replace(/[\s-]/g, ""));
  },

  /**
   * Check if number is positive
   */
  positiveNumber: (value: number): boolean => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  },

  /**
   * Check if number is non-negative (zero or positive)
   */
  nonNegativeNumber: (value: number): boolean => {
    const num = Number(value);
    return !isNaN(num) && num >= 0;
  },

  /**
   * Validate decimal number with specific decimal places
   */
  decimal: (value: string | number, decimalPlaces: number = 2): boolean => {
    const regex = new RegExp(`^\\d+(\\.\\d{1,${decimalPlaces}})?$`);
    return regex.test(String(value));
  },

  /**
   * Check minimum length
   */
  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  /**
   * Check maximum length
   */
  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  /**
   * Validate number range
   */
  numberInRange: (value: number, min: number, max: number): boolean => {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  },
};

/**
 * Validation schema type
 */
export interface ValidationRule {
  required?: boolean;
  pattern?: RegExp;
  custom?: (value: unknown, data?: unknown) => string | null;
  message?: string;
}

export type ValidationSchema = Record<string, ValidationRule>;

/**
 * Validate data against a schema
 * @param data - Data object to validate
 * @param schema - Validation schema
 * @returns Object with field errors, empty if valid
 */
export function validateSchema(
  data: Record<string, unknown>,
  schema: ValidationSchema
): Record<string, string> {
  const errors: Record<string, string> = {};

  Object.keys(schema).forEach((field) => {
    const rules = schema[field];
    const value = data[field];

    if (rules.required && !validators.required(value)) {
      errors[field] = rules.message || `${field} is required`;
      return;
    }

    if (rules.pattern && typeof value === "string" && !rules.pattern.test(value)) {
      errors[field] = rules.message || `${field} has invalid format`;
      return;
    }

    if (rules.custom) {
      const customError = rules.custom(value, data);
      if (customError) {
        errors[field] = customError;
      }
    }
  });

  return errors;
}
