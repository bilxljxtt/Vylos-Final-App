/**
 * Utility functions for handling and formatting currency across the Vylos application.
 */

/**
 * Formats a given numeric value into South African Rand (ZAR) string format.
 * E.g., 20.30 becomes "R 20.30"
 * 
 * @param value The raw number to format
 * @returns Formatted ZAR string representation
 */
export const formatZAR = (value: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
