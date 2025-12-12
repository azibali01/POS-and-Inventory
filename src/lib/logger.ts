/**
 * Development-only logger utility
 *
 * Automatically disabled in production builds to prevent:
 * - Security risks (sensitive data in console)
 * - Performance overhead
 * - Unprofessional appearance
 *
 * Usage:
 * import { logger } from '@/lib/logger';
 * logger.log('Debug info:', data);
 * logger.error('Error occurred:', error);
 */

const isDevelopment = import.meta.env.DEV;

type LogLevel = "log" | "info" | "warn" | "error" | "debug";

class Logger {
  private isDev: boolean;

  constructor(isDev: boolean) {
    this.isDev = isDev;
  }

  /**
   * Log general information (only in development)
   */
  log(...args: unknown[]): void {
    if (this.isDev) {
      console.log(...args);
    }
  }

  /**
   * Log informational messages (only in development)
   */
  info(...args: unknown[]): void {
    if (this.isDev) {
      console.info(...args);
    }
  }

  /**
   * Log warnings (only in development)
   */
  warn(...args: unknown[]): void {
    if (this.isDev) {
      console.warn(...args);
    }
  }

  /**
   * Log errors (always logged, but in production goes to error reporting service)
   */
  error(...args: unknown[]): void {
    if (this.isDev) {
      console.error(...args);
    } else {
      // In production, you would send to error reporting service
      // e.g., Sentry, LogRocket, etc.
      // For now, we still log to console in production for errors
      console.error(...args);
    }
  }

  /**
   * Log debug information (only in development)
   */
  debug(...args: unknown[]): void {
    if (this.isDev) {
      console.debug(...args);
    }
  }

  /**
   * Group related logs together (only in development)
   */
  group(label: string, fn: () => void): void {
    if (this.isDev) {
      console.group(label);
      fn();
      console.groupEnd();
    } else {
      fn();
    }
  }

  /**
   * Log with a specific level
   */
  logWithLevel(level: LogLevel, ...args: unknown[]): void {
    this[level](...args);
  }
}

export const logger = new Logger(isDevelopment);

// Export for testing purposes
export { Logger };
