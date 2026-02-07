import axios from "axios";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

/**
 * Centralized Axios instance with base configuration
 */
export const axiosClient = axios.create({
  baseURL: env.API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Helper function to unwrap paginated API responses
 * Handles both direct arrays and paginated response objects
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function unwrapPaginated<T>(
  response: T[] | PaginatedResponse<T>
): T[] {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    Array.isArray((response as PaginatedResponse<T>).data)
  ) {
    return (response as PaginatedResponse<T>).data;
  }
  return Array.isArray(response) ? response : [];
}

// Request interceptor for logging and authentication
axiosClient.interceptors.request.use(
  (config) => {
    logger.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);

    // Attach token from localStorage if available
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    logger.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
axiosClient.interceptors.response.use(
  (response) => {
    logger.log(
      `API Response: ${response.config.method?.toUpperCase()} ${
        response.config.url
      }`,
      response.status
    );
    return response;
  },
  (error) => {
    logger.error("API Response Error:", error.response?.status, error.message);

    // Handle common error scenarios
    if (error.response?.status === 401) {
      // Handle unauthorized - could trigger logout
      logger.warn("Unauthorized request - user may need to login again");
    } else if (error.response?.status === 404) {
      logger.warn("Resource not found:", error.config?.url);
    } else if (error.response?.status >= 500) {
      logger.error("Server error occurred");
    }

    return Promise.reject(error);
  }
);
