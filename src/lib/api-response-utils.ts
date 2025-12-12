/**
 * API Response Validation Utilities
 *
 * Helpers for validating and normalizing API responses.
 */

import { logger } from "./logger";

/**
 * Validates that a response is an array or wraps it in an array
 * @param data - API response data
 * @param name - Name of the resource for error logging
 * @returns Array of data or empty array
 */
export function ensureArray<T>(data: unknown, name: string): T[] {
  // Check if it's already an array
  if (Array.isArray(data)) {
    return data as T[];
  }

  // Check if it's wrapped in a data property
  if (data && typeof data === "object") {
    const wrapped = data as { data?: unknown };
    if (Array.isArray(wrapped.data)) {
      return wrapped.data as T[];
    }
  }

  // Log warning and return empty array
  logger.warn(`Unexpected response shape for ${name}:`, data);
  return [];
}

/**
 * Original validate function (used by existing DataContext)
 * Returns undefined if valid, warning string if invalid
 */
export function validateArrayResponse(
  name: string,
  v: unknown
): string | undefined {
  if (Array.isArray(v)) return undefined;
  if (v && typeof v === "object") {
    const maybe = v as { [k: string]: unknown };
    if (Array.isArray(maybe.data)) return undefined;
  }
  return `Unexpected response shape for ${name}: expected array or { data: [...] }`;
}
