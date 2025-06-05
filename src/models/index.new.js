/**
 * Models Main Export File
 * Clean aggregator that re-exports all model functionality from modular files
 */

// ===== CONSTANTS =====
export * from './constants.js'

// ===== UTILITIES =====
export * from './utils/index.js'

// ===== CORE MODELS =====
export * from './project.js'
export * from './task.js'

// ===== VALIDATION =====
export * from './validation/index.js'

// ===== BUSINESS LOGIC =====
export * from './calculations/index.js'
export * from './dependencies/index.js'
export * from './hierarchy/index.js'

// ===== TEMPLATES & STATE =====
export * from './state/index.js'
export * from './templates/index.js'

// ===== LEGACY COMPATIBILITY =====
// Re-export utilities with original names for backward compatibility
export { DateUtils } from './utils/date-utils.js'
export { generateId } from './utils/id-generator.js'

// Deprecated - use individual modules instead
