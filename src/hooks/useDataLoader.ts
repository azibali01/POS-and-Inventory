/**
 * Generic data loader hook with deduplication and caching
 * Extracted from DataContext to be reusable across the application
 */

import { useRef, useCallback } from "react";
import { logger } from "../lib/logger";

/**
 * Custom hook for managing data loading with deduplication
 * Prevents multiple simultaneous requests for the same data
 * 
 * @param normalizeResponse - Function to normalize API responses to expected format
 * @returns Object with runLoader function and loader state refs
 * 
 * @example
 * const { runLoader, loaderLoadedRef } = useDataLoader(normalizeArrayResponse);
 * runLoader("customers", api.getCustomers, setCustomers);
 */
export function useDataLoader<T = unknown[]>(
  normalizeResponse: (v: unknown) => T
) {
  const loaderPromisesRef = useRef<Record<string, Promise<unknown> | null>>({});
  const loaderLoadedRef = useRef<Record<string, boolean>>({});

  const runLoader = useCallback(
    (
      key: string,
      fn: () => Promise<unknown>,
      setter: (v: T) => void
    ): Promise<unknown> => {
      // If already loading, return existing promise
      if (loaderPromisesRef.current[key]) {
        if (import.meta.env.MODE !== "production") {
          try {
            const trace = new Error().stack || "";
            logger.debug(
              `[DataLoader] runLoader: reusing in-flight loader "${key}"`,
              trace.split("\n").slice(2, 6)
            );
          } catch {
            logger.debug(
              `[DataLoader] runLoader: reusing in-flight loader "${key}"`
            );
          }
        }
        return loaderPromisesRef.current[key]!;
      }

      // Start new loading operation
      if (import.meta.env.MODE !== "production") {
        try {
          const trace = new Error().stack || "";
          logger.debug(
            `[DataLoader] runLoader: starting loader "${key}"`,
            trace.split("\n").slice(2, 8)
          );
        } catch {
          logger.debug(`[DataLoader] runLoader: starting loader "${key}"`);
        }
      }

      loaderPromisesRef.current[key] = (async () => {
        try {
          const res = await fn();
          const data = normalizeResponse(res);
          setter(data);
          loaderLoadedRef.current[key] = true;
          return data;
        } finally {
          loaderPromisesRef.current[key] = null;
        }
      })();

      return loaderPromisesRef.current[key]!;
    },
    [normalizeResponse]
  );

  return {
    runLoader,
    loaderLoadedRef,
  };
}
