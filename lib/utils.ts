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
 * Standardized Date Formatter for Vylos
 * Formats date to South African style: 1 May 2026
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  
  let date: Date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    // Prevent timezone shifting by parsing as local date
    date = parseDateKey(dateStr);
  } else {
    date = new Date(dateStr);
  }
  
  if (isNaN(date.getTime())) return dateStr;

  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

/**
 * Gets current date/time components for South Africa (Africa/Johannesburg)
 */
export function getSouthAfricanNow() {
  const parts = new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23"
  }).formatToParts(new Date());

  const getPart = (type: string) => parts.find(p => p.type === type)?.value || "0";
  
  const year = parseInt(getPart("year"));
  const month = parseInt(getPart("month"));
  const day = parseInt(getPart("day"));
  const hour = parseInt(getPart("hour"));
  const minute = parseInt(getPart("minute"));

  return {
    year,
    month,
    day,
    hour,
    minute,
    dateKey: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  };
}

/**
 * Calculates derived status of a reminder based on South African current time.
 */
export function getReminderDerivedStatus(reminder: { 
  due_date: string, 
  due_time?: string, 
  status: string, 
  completed_at?: string 
}): "upcoming" | "overdue" | "completed" {
  // If explicitly marked as completed, it's completed
  if (reminder.status === "completed" || (reminder.completed_at && reminder.completed_at.length > 0)) return "completed";

  const saNow = getSouthAfricanNow();
  
  // Compare date keys (YYYY-MM-DD)
  if (reminder.due_date < saNow.dateKey) return "overdue";
  
  if (reminder.due_date === saNow.dateKey) {
    // If no time is specified, it's upcoming for the whole day until it's tomorrow
    if (!reminder.due_time) return "upcoming";
    
    // Parse time
    const timeMatch = reminder.due_time.match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) return "upcoming";

    const h = parseInt(timeMatch[1]);
    const m = parseInt(timeMatch[2]);
    
    // If current SA hour/minute has passed the due time
    if (saNow.hour > h || (saNow.hour === h && saNow.minute >= m)) {
      return "overdue";
    }
  }

  return "upcoming";
}

/**
 * Calculates the next occurrence date for a recurring reminder.
 */
export function getNextOccurrence(currentDueDate: string, pattern: "none" | "daily" | "weekly" | "monthly"): string | null {
  if (pattern === "none") return null;

  const date = parseDateKey(currentDueDate);
  
  switch (pattern) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      // Safely increment month
      const currentMonth = date.getMonth();
      date.setMonth(currentMonth + 1);
      // Handle edge cases like Jan 31 -> Feb 28
      if (date.getMonth() !== (currentMonth + 1) % 12) {
          date.setDate(0); // Go back to last day of previous month
      }
      break;
    default:
      return null;
  }

  return toDateKey(date);
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
