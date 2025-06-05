/**
 * Utility function to generate UUID v4
 * Creates a random UUID following the standard format
 */
export function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Generate a shorter, more readable ID for display purposes
 * Format: XXXX-XXXX (8 characters)
 */
export function generateShortId() {
  return generateId().substr(0, 8).toUpperCase()
}

/**
 * Validate UUID format
 */
export function isValidId(id) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return typeof id === 'string' && uuidRegex.test(id)
}

/**
 * Generate a deterministic ID from a string (for testing/seeding)
 */
export function generateDeterministicId(seed) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Convert to UUID-like format
  const hex = Math.abs(hash).toString(16).padStart(8, '0')
  return `${hex.substr(0, 8)}-${hex.substr(0, 4)}-4${hex.substr(1, 3)}-8${hex.substr(2, 3)}-${hex.padEnd(12, '0')}`
}
