// Test utilities for generating valid test data

export const TEST_USER_ID = "cm123456789012345678901234"; // Valid CUID
export const TEST_QR_CODE_ID = "cm987654321098765432109876"; // Valid CUID

export const createMockUser = (overrides: any = {}) => ({
  id: TEST_USER_ID,
  email: "test@example.com",
  ...overrides,
});

export const createMockSession = (overrides: any = {}) => ({
  user: createMockUser(overrides.user),
  ...overrides,
});
