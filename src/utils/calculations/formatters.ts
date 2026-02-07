/**
 * Number and Currency Formatting Utilities
 */

/**
 * Format number as currency
 * @param amount - The amount to format
 * @param currency - Currency code (default: PKR for Pakistan Rupee)
 * @param locale - Locale for formatting (default: en-PK)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = "PKR",
  locale: string = "en-PK"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/**
 * Format number with specific decimal places
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Format date to readable string
 * @param date - Date to format (Date object or ISO string)
 * @param format - Format type: 'short' | 'long' | 'datetime'
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  format: "short" | "long" | "datetime" = "short"
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  const formats: Record<string, Intl.DateTimeFormatOptions> = {
    short: { year: "numeric", month: "2-digit", day: "2-digit" },
    long: { year: "numeric", month: "long", day: "numeric" },
    datetime: {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  };

  return new Intl.DateTimeFormat("en-US", formats[format]).format(d);
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation (default: 50)
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * Format phone number (simple version for Pakistan)
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export function formatPhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Format based on length
  if (digits.length === 11) {
    // 03xx-xxxxxxx
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  return phone; // Return as-is if not standard format
}
