// Mock implementation of lib/utils for testing
const actual = jest.requireActual("@/lib/utils");

export const cn = jest.fn(
  (...classes: (string | undefined | null | boolean)[]) => {
    return classes.filter(Boolean).join(" ");
  },
);

// Export all other utilities from the actual module
module.exports = {
  ...actual,
  cn,
};
