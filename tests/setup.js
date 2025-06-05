/**
 * Vitest Setup File
 * 
 * This file is executed before running tests and sets up global test configuration.
 * It configures Vue Test Utils, provides test utilities, and sets up global mocks.
 */

import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// Configure Vue Test Utils global properties
config.global.plugins = []

// Mock localStorage for testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock console methods to reduce noise in tests (optional)
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn()
}

// Global test utilities
global.TestUtils = {
  // Helper to create a mock task object
  createMockTask: (overrides = {}) => ({
    id: 1,
    title: 'Test Task',
    description: 'Test task description',
    startDate: '2024-01-01',
    endDate: '2024-01-07',
    status: 'pending',
    dependencies: [],
    ...overrides
  }),

  // Helper to create a mock project object
  createMockProject: (overrides = {}) => ({
    id: 1,
    name: 'Test Project',
    description: 'Test project description',
    tasks: [],
    createdAt: new Date().toISOString(),
    ...overrides
  }),

  // Reset all mocks between tests
  resetMocks: () => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    localStorageMock.clear.mockClear()
  }
}

// Reset mocks before each test
beforeEach(() => {
  global.TestUtils.resetMocks()
}) 