# Testing

This directory contains automated tests for the Wires portfolio builder.

## Running Tests

- `npm test` - Run tests in watch mode (for development)
- `npm run test:ci` - Run tests once (for CI/CD pipelines)

## Test Structure

Tests are organized by the code they test:

```
__tests__/
├── lib/
│   ├── firebase/
│   │   ├── mutations.test.ts   # Firebase write operations (create, update, delete)
│   │   └── queries.test.ts     # Firebase read operations
│   └── utils/
│       ├── slug.test.ts        # Slug validation and generation
│       ├── password.test.ts    # Password validation
│       └── user.test.ts        # User utility functions
└── components/
    ├── ui/
    │   └── Button.test.tsx     # Reusable UI components
    └── content/
        └── ProjectCard.test.tsx # Content components
```

## Writing Tests

1. **Naming**: Use `.test.ts` or `.test.tsx` suffix
2. **Organization**: Group related tests with `describe()` blocks
3. **Setup**: Use `beforeEach()` for test setup (mocking, etc.)
4. **Assertions**: Use `expect()` for assertions
5. **Mocking**: Mock Firebase and external dependencies

### Example Test

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should do something specific', () => {
    // Arrange
    const input = 'test'

    // Act
    const result = someFunction(input)

    // Assert
    expect(result).toBe('expected')
  })
})
```

## Coverage Goals

- **Firebase mutations** (create, update, delete operations) - HIGH PRIORITY
- **Core utilities** (validation, slug generation, etc.) - HIGH PRIORITY
- **Auth flows** - MEDIUM PRIORITY
- **Component rendering** - MEDIUM PRIORITY
- **Edge cases and error handling** - MEDIUM PRIORITY

## Current Test Coverage

See `package.json` for coverage collection settings. Run `npm test` and check the coverage report.

## Continuous Integration

Tests run automatically on:
- Pull requests
- Before merging to main
- Pre-push checks (via `pre-push` hook)
