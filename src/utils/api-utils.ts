/**
 * Utility functions for API response handling and normalization
 */

/**
 * Normalize API responses to arrays
 * Handles various response formats: plain arrays, {data: []}, {items: []}, etc.
 * 
 * @param v - API response to normalize
 * @returns Normalized array
 * 
 * @example
 * normalizeArrayResponse([1, 2, 3]) // Returns [1, 2, 3]
 * normalizeArrayResponse({data: [1, 2, 3]}) // Returns [1, 2, 3]
 * normalizeArrayResponse({items: [1, 2, 3]}) // Returns [1, 2, 3]
 */
export function normalizeArrayResponse(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  if (v && typeof v === "object") {
    // Check for common array wrapper properties
    if (Array.isArray((v as Record<string, unknown>).data))
      return (v as Record<string, unknown>).data as unknown[];
    
    // Find any array property in the object
    const arrProp = Object.values(v).find((val) => Array.isArray(val));
    if (arrProp) return arrProp as unknown[];
  }
  return [];
}

/**
 * Extract property safely from nested objects
 * Tries multiple keys in order and returns the first non-null/undefined value
 * 
 * @param obj - Object to extract from
 * @param keys - Keys to try in order
 * @returns Value if found, undefined otherwise
 * 
 * @example
 * getProp({id: 5}, "id", "_id") // Returns 5
 * getProp({_id: "abc"}, "id", "_id") // Returns "abc"
 * getProp({}, "id", "_id") // Returns undefined
 */
export function getProp<TResult = unknown>(
  obj: Record<string, unknown>,
  ...keys: string[]
): TResult | undefined {
  for (const key of keys) {
    const val = obj[key];
    if (val !== undefined && val !== null) return val as TResult;
  }
  return undefined;
}

/**
 * Safely convert value to string, handling various types
 * @param value - Value to convert
 * @param fallback - Fallback value if conversion fails
 * @returns String representation
 */
export function safeString(value: unknown, fallback: string = ""): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  return fallback;
}

/**
 * Safely convert value to number
 * @param value - Value to convert
 * @param fallback - Fallback value if conversion fails
 * @returns Number representation
 */
export function safeNumber(value: unknown, fallback: number = 0): number {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}
