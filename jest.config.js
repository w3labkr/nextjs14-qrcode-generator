const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  maxWorkers: "50%",
  cache: true,
  cacheDirectory: "<rootDir>/.jest-cache",
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,ts}",
    "hooks/**/*.{js,ts}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
    "!**/jest.config.js",
    "!**/jest.setup.js",
  ],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 40,
      statements: 40,
    },
  },
  testMatch: [
    "**/__tests__/**/*.(js|jsx|ts|tsx)",
    "**/*.(test|spec).(js|jsx|ts|tsx)",
  ],
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/__tests__/__mocks__/",
    "<rootDir>/__tests__/test-utils.ts",
    "<rootDir>/__mocks__/",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(next-auth|@auth|oauth4webapi|preact-render-to-string|preact|@panva)/)",
  ],
};

module.exports = createJestConfig(customJestConfig);
