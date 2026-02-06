/**
 * Utility functions for document number generation and manipulation
 * Used across Purchase Orders, Invoices, Quotations, etc.
 */

/**
 * Generate next document number in a series (e.g., PO-0001, INV-0002, QUOT-0003)
 * @param prefix - Document prefix (e.g., "PO", "INV", "QUOT", "PINV", "PRET")
 * @param existingNumbers - Array of existing document numbers
 * @param digits - Number of digits for padding (default: 4)
 * @returns Next document number in the series
 * 
 * @example
 * generateNextDocumentNumber("PO", ["PO-0001", "PO-0002"], 4) // Returns "PO-0003"
 * generateNextDocumentNumber("INV", [], 4) // Returns "INV-0001"
 */
export function generateNextDocumentNumber(
  prefix: string,
  existingNumbers: string[],
  digits: number = 4
): string {
  const pattern = new RegExp(`^${prefix}-(\\d+)$`, "i");
  const numbers = existingNumbers
    .map((num) => {
      const match = num?.match(pattern);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n) && n > 0);

  const max = numbers.length > 0 ? Math.max(...numbers) : 0;
  const next = max + 1;
  return `${prefix}-${String(next).padStart(digits, "0")}`;
}

/**
 * Parse document number to extract numeric part
 * @param docNumber - Document number to parse (e.g., "PO-0042")
 * @returns Numeric part of the document number (e.g., 42)
 * 
 * @example
 * parseDocumentNumber("PO-0042") // Returns 42
 * parseDocumentNumber("INV-0123") // Returns 123
 */
export function parseDocumentNumber(docNumber: string): number {
  const match = docNumber?.match(/(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Validate document number format
 * @param docNumber - Document number to validate
 * @param prefix - Expected prefix (optional)
 * @returns True if valid, false otherwise
 * 
 * @example
 * validateDocumentNumber("PO-0001", "PO") // Returns true
 * validateDocumentNumber("INVALID", "PO") // Returns false
 */
export function validateDocumentNumber(
  docNumber: string,
  prefix?: string
): boolean {
  if (!docNumber || typeof docNumber !== "string") return false;
  
  const pattern = prefix
    ? new RegExp(`^${prefix}-\\d+$`, "i")
    : /^[A-Z]+-\d+$/i;
  
  return pattern.test(docNumber);
}
