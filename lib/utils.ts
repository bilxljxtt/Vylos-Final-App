/**
 * Safely parses a JSON string, handling common AI-generated formatting errors
 * such as raw backslashes and invalid unicode escape sequences.
 */
export function safeJsonParse<T>(text: string, fallback: T): T {
  if (!text) return fallback;
  
  try {
    // Attempt 1: Standard parse
    return JSON.parse(text);
  } catch (e) {
    try {
      // Attempt 2: Clean up common raw backslash issues (e.g., C:\Users -> C:\\Users)
      // This regex looks for a backslash that is not escaping a valid character
      const cleaned = text.replace(/\\(?!["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "\\\\");
      return JSON.parse(cleaned);
    } catch (e2) {
      console.error("Failed to parse JSON even after cleaning:", e2);
      return fallback;
    }
  }
}

/**
 * Sanitizes a string for use in template literals or DB inserts
 * by escaping problematic characters like solo backslashes.
 */
export function sanitizeString(val: string): string {
  if (!val) return "";
  // Escape backslashes that aren't already escaped
  return val.replace(/\\/g, "\\\\");
}

/**
 * Standardized Date Helpers to prevent timezone shifting
 */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function createLocalDate(year: number, monthIndex: number, day: number): Date {
  return new Date(year, monthIndex, day);
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return createLocalDate(y, m - 1, d);
}

export function getTransactionDateKey(t: { transaction_date?: string, date?: string, created_at?: string, createdAt?: string }): string {
  const raw = t.transaction_date || t.date || t.created_at || t.createdAt || "";
  if (!raw) return "";
  
  // If it's already a simple YYYY-MM-DD, just return it
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  
  // Otherwise, it's likely an ISO string. Convert to local date to avoid timezone shift.
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw.split('T')[0]; // Fallback
  
  return toDateKey(d);
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
}

/**
 * Strips confusing prefixes like "Budget Top-up:" or "Budget Allocation:" 
 * from merchant/transaction titles for a cleaner UI.
 */
export function cleanMerchantName(name: string): string {
  if (!name) return "";
  return name
    .replace(/^Budget Top-up:\s*/i, "")
    .replace(/^Budget Allocation:\s*/i, "")
    .replace(/^Top-up:\s*/i, "")
    .replace(/^Allocation:\s*/i, "")
    .trim();
}
