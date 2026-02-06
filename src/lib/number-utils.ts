/**
 * Formats a number with a leading zero if it's less than 10
 * @param value - The number to format
 * @returns Formatted string with leading zero if needed
 */
export function formatNumberWithLeadingZero(value: number | string | undefined | null): string {
    if (value === undefined || value === null || value === '') {
        return '';
    }

    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) {
        return '';
    }

    // Only add leading zero for whole numbers less than 10 and greater than or equal to 0
    if (num >= 0 && num < 10 && Number.isInteger(num)) {
        return `0${String(num)}`;
    }

    return String(num);
}

/**
 * Parses a number string that might have a leading zero
 * @param value - The string value from input
 * @returns The parsed number
 */
export function parseNumberWithLeadingZero(value: string | number): number {
    if (typeof value === 'number') {
        return value;
    }

    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
}
