# Tests Directory

This directory contains all automated tests for the SchoolGantt application.

## Testing Framework

The project uses **Vitest** as the primary testing framework with the following stack:

- **Vitest**: Modern testing framework that integrates with Vite
- **Vue Test Utils**: Official testing utilities for Vue.js components
- **@testing-library/vue**: Additional testing utilities for user-centric tests
- **happy-dom**: Lightweight DOM implementation for testing
- **@vitest/ui**: Optional UI for test results visualization

## Directory Structure

```
tests/
├── unit/           # Unit tests for individual functions and components
├── integration/    # Integration tests for module interactions
├── e2e/            # End-to-end tests (full user scenarios)
├── utils/          # Test utilities and helpers
├── setup.js        # Global test setup and configuration
└── README.md       # This file
```

## Available Test Scripts

```bash
# Run tests in watch mode (default)
npm test

# Run tests once without watching
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Run tests with UI interface
npm run test:ui

# Run tests in watch mode
npm run test:watch
```

## Writing Tests

### Basic Test Structure

```javascript
import { describe, it, expect, beforeEach } from 'vitest'

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
  })

  it('should behave correctly', () => {
    // Test implementation
    expect(actualValue).toBe(expectedValue)
  })
})
```

### Testing Vue Components

```javascript
import { mount } from '@vue/test-utils'
import MyComponent from '@/components/MyComponent.vue'

it('should render correctly', () => {
  const wrapper = mount(MyComponent, {
    props: {
      title: 'Test Title'
    }
  })
  
  expect(wrapper.text()).toContain('Test Title')
})
```

### Using Test Utilities

The global `TestUtils` object provides helpful utilities:

```javascript
// Create mock task
const task = TestUtils.createMockTask({
  title: 'Custom Title',
  status: 'in-progress'
})

// Create mock project
const project = TestUtils.createMockProject({
  name: 'Custom Project'
})

// Reset all mocks
TestUtils.resetMocks()
```

## Test Configuration

Tests are configured in:
- `vite.config.js` - Main Vitest configuration
- `tests/setup.js` - Global setup and utilities
- `tsconfig.json` - TypeScript configuration for tests

## Mocks and Test Data

The test setup automatically mocks:
- `localStorage` - Browser storage API
- Console methods (warn, error) - To reduce test noise

## Coverage Reporting

Coverage reports are generated in multiple formats:
- Text output in terminal
- HTML report in `coverage/` directory
- JSON report for CI integration

## Best Practices

1. **Descriptive Test Names**: Use clear, descriptive test names
2. **Arrange-Act-Assert**: Structure tests with clear setup, action, and assertion phases
3. **Test Isolation**: Each test should be independent and not rely on others
4. **Mock External Dependencies**: Mock APIs, localStorage, and other external services
5. **Test Edge Cases**: Include tests for error conditions and edge cases
6. **Keep Tests Simple**: Each test should focus on one specific behavior

## Running Specific Tests

```bash
# Run specific test file
npm test models.test.js

# Run tests matching a pattern
npm test -- --grep "Task Dependencies"

# Run tests in specific directory
npm test tests/unit/
```

## Debugging Tests

1. Use `console.log()` in tests for debugging
2. Use VS Code debugger with test files
3. Run tests with `--reporter=verbose` for detailed output
4. Use `test.only()` to run a single test during debugging

## Adding New Tests

1. Create test files with `.test.js` or `.spec.js` extension
2. Place unit tests in `tests/unit/`
3. Place integration tests in `tests/integration/`
4. Place e2e tests in `tests/e2e/`
5. Import necessary testing utilities
6. Follow existing test patterns and naming conventions

## CI Integration

Tests are configured to run in continuous integration with:
- Automatic test execution on code changes
- Coverage reporting
- Browser compatibility testing
- Performance testing validation 