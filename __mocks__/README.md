# Mock Files Structure

This directory contains mock implementations for testing.

## Directory Structure

```
__mocks__/
├── @/                    # Application-specific mocks
│   └── lib/             # Library mocks
│       ├── rls-utils.js
│       ├── unified-logging.js
│       └── utils.ts
├── next-auth/           # Next-auth related mocks
│   └── react.js
└── README.md            # This file
```

## Usage

These mocks are automatically loaded by Jest when the corresponding modules are imported in test files.

### Adding New Mocks

1. Create the appropriate directory structure matching the import path
2. Add the mock file with the same name as the original module
3. Export the same interface as the original module

### Example

```javascript
// __mocks__/@/lib/example.js
module.exports = {
  exampleFunction: jest.fn(() => 'mocked result'),
  exampleClass: jest.fn().mockImplementation(() => ({
    method: jest.fn()
  }))
};
```