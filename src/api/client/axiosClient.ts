import axios, { AxiosError } from "axios";
import { notifications } from "@mantine/notifications";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { getAuthToken, notifyAuthExpired } from "@/lib/auth-storage";

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
  total: number;
  page: number;
  lastPage: number;
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function unwrapPaginated<T>(response: T[] | PaginatedResponse<T>): T[] {
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

export function toPaginatedResponse<T>(
  response: T[] | PaginatedResponse<T>,
  fallbackPage: number = 1,
): PaginatedResponse<T> {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    Array.isArray((response as PaginatedResponse<T>).data)
  ) {
    return response as PaginatedResponse<T>;
  }

  const items = Array.isArray(response) ? response : [];
  return {
    data: items,
    total: items.length,
    page: fallbackPage,
    lastPage: 1,
  };
}

function getErrorMessage(error: AxiosError<{ message?: string | string[] }>) {
  const responseMessage = error.response?.data?.message;

  if (Array.isArray(responseMessage)) {
    return responseMessage.join("\n");
  }

  if (typeof responseMessage === "string" && responseMessage.trim()) {
    return responseMessage;
  }

  return error.message || "Something went wrong";
}

// Request interceptor for logging and authentication
axiosClient.interceptors.request.use(
  (config) => {
    logger.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);

    // Attach token from localStorage first, then cookie fallback.
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    logger.error("API Request Error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor for logging and error handling
axiosClient.interceptors.response.use(
  (response) => {
    logger.log(
      `API Response: ${response.config.method?.toUpperCase()} ${
        response.config.url
      }`,
      response.status,
    );
    return response;
  },
  (error) => {
    const axiosError = error as AxiosError<{ message?: string | string[] }>;
    const status = axiosError.response?.status;
    const message = getErrorMessage(axiosError);

    logger.error("API Response Error:", status, message);

    notifications.show({
      title:
        status === 401
          ? "Session expired"
          : status === 404
            ? "Not found"
            : status && status >= 500
              ? "Server error"
              : "Request failed",
      message,
      color: "red",
    });

    if (status === 401) {
      logger.warn("Unauthorized request - clearing auth session");
      notifyAuthExpired();
    } else if (status === 404) {
      logger.warn("Resource not found:", axiosError.config?.url);
    } else if (status && status >= 500) {
      logger.error("Server error occurred");
    }

    return Promise.reject(axiosError);
  },
);
