// Test utilities for generating valid test data

export const TEST_USER_ID = "c123456789012345678901234"; // Valid CUID
export const TEST_QR_CODE_ID = "c987654321098765432109876"; // Valid CUID

export const createMockUser = (overrides: any = {}) => ({
  id: TEST_USER_ID,
  email: "test@example.com",
  ...overrides,
});

export const createMockSession = (overrides: any = {}) => ({
  user: createMockUser(overrides.user),
  ...overrides,
});

export const mockQrCode = {
  id: TEST_QR_CODE_ID,
  userId: TEST_USER_ID,
  type: "text",
  title: "Test QR Code",
  content: "Test content",
  settings: '{"size": 200, "bgColor": "#ffffff", "fgColor": "#000000"}',
  isFavorite: false,
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
};
