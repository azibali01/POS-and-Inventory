/**
 * Environment configuration with validation
 *
 * Provides type-safe access to environment variables with proper defaults
 * and validation. Centralizes all environment configuration.
 *
 * Usage:
 * import { env } from '@/lib/env';
 * const apiUrl = env.API_URL;
 */

interface EnvConfig {
  API_URL: string;
  NODE_ENV: "development" | "production" | "test";
  IS_DEV: boolean;
  IS_PROD: boolean;
  APP_NAME: string;
  APP_VERSION: string;
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, defaultValue: string = ""): string {
  return import.meta.env[key] ?? defaultValue;
}

/**
 * Validate required environment variables
 */
function validateEnv(): void {
  const required: string[] = [];

  const missing = required.filter((key) => !import.meta.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        "Please check your .env file."
    );
  }
}

/**
 * Build environment configuration object
 */
function buildEnvConfig(): EnvConfig {
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;

  // Default API URLs
  const API_URL_LOCAL = "http://localhost:3000";
  const API_URL_PRODUCTION = "https://7star-traders-api.onrender.com";

  return {
    // API Configuration
    API_URL: getEnvVar(
      "VITE_API_URL",
      isDev ? API_URL_LOCAL : API_URL_PRODUCTION
    ),

    // Environment
    NODE_ENV:
      (import.meta.env.MODE as "development" | "production" | "test") ||
      "development",
    IS_DEV: isDev,
    IS_PROD: isProd,

    // App Info
    APP_NAME: getEnvVar("VITE_APP_NAME", "7 Star Traders"),
    APP_VERSION: getEnvVar("VITE_APP_VERSION", "1.0.0"),
  };
}

// Validate on module load (only in development)
if (import.meta.env.DEV) {
  try {
    validateEnv();
  } catch (error) {
    console.error(error);
  }
}

/**
 * Typed environment configuration
 */
export const env = buildEnvConfig();

/**
 * Type-safe environment variable access
 */
export type { EnvConfig };
