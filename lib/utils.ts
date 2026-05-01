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
