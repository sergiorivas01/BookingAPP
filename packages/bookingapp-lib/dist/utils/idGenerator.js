"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = generateId;
exports.resetIdCounter = resetIdCounter;
/**
 * Simple ID generator for testing purposes
 * Generates short, readable IDs instead of UUIDs
 */
let counter = 0;
/**
 * Generate a simple, short ID
 * Format: timestamp-counter (e.g., "1704123456-1")
 */
function generateId() {
    counter++;
    const timestamp = Date.now();
    return `${timestamp}-${counter}`;
}
/**
 * Reset the counter (useful for testing)
 */
function resetIdCounter() {
    counter = 0;
}
//# sourceMappingURL=idGenerator.js.map