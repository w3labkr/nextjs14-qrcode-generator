/* eslint-env node */
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "next",
    "plugin:prettier/recommended",
    "plugin:tailwindcss/recommended",
  ],
  plugins: ["import", "react", "react-hooks", "@typescript-eslint"],
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {},
    },
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    ecmaFeatures: { jsx: true },
    ecmaVersion: 12,
    sourceType: "module",
    tsconfigRootDir: __dirname,
  },
  // Ignore Files in v9 (Deprecated)
  // https://eslint.org/docs/latest/use/configure/ignore-deprecated
  ignorePatterns: [
    "/build/",
    "/dist/",
    "/out/",
    "/supabase/",
    "/types/supabase.ts",
    "/components/ui/",
    "/components/custom-ui/",
    ".eslintrc.js",
    "*.config.mjs",
  ],
  rules: {
    // ... is defined but never used.
    "no-unused-vars": "off", // Disabled in favor of @typescript-eslint/no-unused-vars
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    // ... is never reassigned. Use 'const' instead.
    "prefer-const": "warn",
    // Using `<img>` could result in slower LCP and higher bandwidth.
    "@next/next/no-img-element": "off",
    // Unexpected any. Specify a different type.
    "@typescript-eslint/no-explicit-any": "off",
    // An empty interface declaration allows any non-nullish value
    "@typescript-eslint/no-empty-object-type": "off", // Or consider "@typescript-eslint/no-empty-interface": "off" if that was the intent

    // React specific rules
    "react/prop-types": "off", // Not needed in TypeScript projects
    "react/react-in-jsx-scope": "off", // Not needed with Next.js and modern React

    // Import order
    "import/order": [
      "warn",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          ["parent", "sibling", "index"],
        ],
        pathGroups: [
          {
            pattern: "react",
            group: "external",
            position: "before",
          },
          {
            pattern: "@/**",
            group: "internal",
          },
        ],
        pathGroupsExcludedImportTypes: ["react"],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
  },
};
