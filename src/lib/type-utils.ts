/**
 * Type utility functions for handling common type transformations
 * and standardizing data structures across the application
 */

/**
 * Normalizes ID fields from various API responses
 * Handles both _id (MongoDB) and id formats
 * 
 * @param obj - Object with potential _id or id field
 * @returns Normalized string ID
 * 
 * @example
 * normalizeId({ _id: "123" }) // "123"
 * normalizeId({ id: 456 }) // "456"
 */
export function normalizeId(obj: { _id?: string | number; id?: string | number }): string {
  return String(obj._id || obj.id || '');
}

/**
 * Type guard to check if an object has a valid ID
 * 
 * @param obj - Object to check
 * @returns True if object has valid _id or id
 */
export function hasId(obj: unknown): obj is { _id: string } | { id: string } {
  if (!obj || typeof obj !== 'object') return false;
  const record = obj as Record<string, unknown>;
  return ('_id' in record && typeof record._id === 'string') ||
         ('id' in record && typeof record.id === 'string');
}

/**
 * Safely extracts a numeric value from unknown input
 * 
 * @param value - Input value
 * @param defaultValue - Default value if extraction fails
 * @returns Numeric value or default
 * 
 * @example
 * safeNumber("123") // 123
 * safeNumber("invalid", 0) // 0
 */
export function safeNumber(value: unknown, defaultValue = 0): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : defaultValue;
  }
  return defaultValue;
}

/**
 * Safely extracts a string value from unknown input
 * 
 * @param value - Input value
 * @param defaultValue - Default value if extraction fails
 * @returns String value or default
 */
export function safeString(value: unknown, defaultValue = ''): string {
  if (typeof value === 'string') return value;
  if (value != null) return String(value);
  return defaultValue;
}

/**
 * Type guard for checking if a value is a non-null object
 * 
 * @param value - Value to check
 * @returns True if value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
