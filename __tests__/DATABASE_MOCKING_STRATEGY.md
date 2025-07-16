# Database Mocking Strategy

This document outlines the standardized approach for mocking database operations in tests.

## Overview

All database operations should be mocked to ensure tests are fast, isolated, and deterministic.

## Mocking Principles

1. **Use the Mock Utility**: Always use `createMockPrismaClient()` from `test-mocks.ts`
2. **Mock at Transaction Level**: When testing transactional operations, mock the `$transaction` method
3. **Return Realistic Data**: Mock returns should match the shape of actual database responses
4. **Test Error Cases**: Always include tests for database errors and edge cases

## Standard Mock Patterns

### Basic CRUD Operations

```typescript
import { createMockPrismaClient } from "@/tests/test-mocks";

const mockPrisma = createMockPrismaClient();

// Find operations
mockPrisma.user.findUnique.mockResolvedValue({
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Create operations
mockPrisma.qrCode.create.mockResolvedValue({
  id: "qr-123",
  userId: "user-123",
  title: "Test QR",
  text: "https://example.com",
  // ... other fields
});

// Update operations
mockPrisma.user.update.mockResolvedValue({
  // ... updated user data
});

// Delete operations
mockPrisma.qrCode.delete.mockResolvedValue({
  // ... deleted record
});
```

### Transaction Mocking

```typescript
mockPrisma.$transaction.mockImplementation(async (callback) => {
  const transactionPrisma = createMockPrismaClient();
  // Set up transaction-specific mocks
  transactionPrisma.user.create.mockResolvedValue(/* ... */);
  
  return callback(transactionPrisma);
});
```

### Error Scenarios

```typescript
// Database connection error
mockPrisma.user.findUnique.mockRejectedValue(
  new Error("P2002: Unique constraint failed")
);

// Record not found
mockPrisma.qrCode.findUnique.mockResolvedValue(null);

// Transaction failure
mockPrisma.$transaction.mockRejectedValue(
  new Error("Transaction failed")
);
```

## Testing with RLS (Row Level Security)

When testing functions that use RLS:

```typescript
jest.mock("@/lib/rls-utils");

const mockWithRLSTransaction = require("@/lib/rls-utils").withRLSTransaction;

mockWithRLSTransaction.mockImplementation(async (userId, callback) => {
  const rlsPrisma = createMockPrismaClient();
  // Set up RLS-specific mocks
  return callback(rlsPrisma);
});
```

## Best Practices

1. **Reset Mocks**: Always reset mocks in `beforeEach` or `afterEach`
   ```typescript
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

2. **Type Safety**: Use TypeScript types for mock data
   ```typescript
   const mockUser: User = {
     id: "test-id",
     email: "test@example.com",
     // ... other required fields
   };
   ```

3. **Consistent Test Data**: Use constants for commonly used test data
   ```typescript
   export const TEST_USER_ID = "test-user-123";
   export const TEST_QR_CODE_ID = "test-qr-123";
   ```

4. **Mock Only What's Needed**: Don't over-mock; only mock the methods actually used in the test

5. **Document Complex Mocks**: Add comments explaining complex mock setups

## Example Test File

```typescript
import { createMockPrismaClient } from "@/tests/test-mocks";
import { TEST_USER_ID } from "@/tests/test-utils";

jest.mock("@/lib/prisma");

describe("User Service", () => {
  const mockPrisma = createMockPrismaClient();
  
  beforeEach(() => {
    jest.clearAllMocks();
    require("@/lib/prisma").prisma = mockPrisma;
  });

  it("should find user by id", async () => {
    const mockUser = {
      id: TEST_USER_ID,
      email: "test@example.com",
      name: "Test User",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const result = await findUserById(TEST_USER_ID);

    expect(result).toEqual(mockUser);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: TEST_USER_ID },
    });
  });

  it("should handle user not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const result = await findUserById("non-existent-id");

    expect(result).toBeNull();
  });
});
```

## Migration Guide

If you have existing tests using custom database mocks:

1. Import `createMockPrismaClient` from `test-mocks.ts`
2. Replace custom mock implementations with the standardized version
3. Update mock method calls to use the new patterns
4. Ensure all tests still pass
5. Remove redundant mock code

## Troubleshooting

### Common Issues

1. **"Cannot read property 'findUnique' of undefined"**
   - Ensure you've properly mocked the Prisma client
   - Check that the mock is assigned to `require("@/lib/prisma").prisma`

2. **"Mock function not called"**
   - Verify the correct method is being mocked
   - Check for typos in method names
   - Ensure the mock is set up before the function is called

3. **Type errors with mock data**
   - Use proper TypeScript types for mock data
   - Include all required fields in mock objects