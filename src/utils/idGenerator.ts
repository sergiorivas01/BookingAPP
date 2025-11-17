/**
 * Simple ID generator for testing purposes
 * Generates short, readable IDs instead of UUIDs
 */
let counter = 0;

/**
 * Generate a simple, short ID
 * Format: timestamp-counter (e.g., "1704123456-1")
 */
export function generateId(): string {
  counter++;
  const timestamp = Date.now();
  return `${timestamp}-${counter}`;
}

/**
 * Reset the counter (useful for testing)
 */
export function resetIdCounter(): void {
  counter = 0;
}

