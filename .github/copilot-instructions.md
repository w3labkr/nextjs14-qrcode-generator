# Copilot Instructions

This file provides guidelines for GitHub Copilot to reference when performing code generation and other tasks in this project.

## Project Overview

This project is a QR code generator built with Next.js 14. It utilizes a modern tech stack including TypeScript, Tailwind CSS, and shadcn/ui for a robust and well-structured application. The goal is to provide a fast, reliable, and user-friendly QR code generation experience.

## General Guidelines

* **Response Language**: Please provide all suggestions and responses in **Korean**.
* **Maintain Context**: Understand and utilize the context based on the current file you are working on, surrounding code, and other related open files when suggesting code.
* **Adhere to Code Style**: Identify the project's existing code style (indentation, naming conventions, etc.) and generate code with consistent styling.
* **Code Readability**: Prioritize code readability over brevity. Use descriptive variable names, clear function names, and logical code structure. Break down complex logic into smaller, understandable pieces.
* **Avoid Unnecessary Comments**: When generating code, **do not add comments.** Developers will add comments manually as needed.
* **Idiomatic Code**: Write code using common idioms and best practices for the specific programming language and framework.
* **Modularity and Reusability**: Where possible, consider modularizing code and making it reusable.
* **Error Handling**: Endeavor to suggest appropriate error handling mechanisms.

## Tech Stack Specific Guidelines

### Next.js

* **App Router**: Utilize the App Router for routing, layouts, and server components.
* **Server Actions**: Use Server Actions for mutations and data fetching on the server side.
* **API Routes**: For client-side data fetching, use API Routes.
* **HTTP Client**: Use `axios` instead of `fetch` for all API calls to ensure consistent error handling and request/response interceptors.

### React

* **State Management**: Prefer using `react-hook-form` for form state management instead of `useState`. For global state management, use `Zustand`.
* **Componentization**: Break down complex components into smaller, reusable ones.
* **Data Fetching**: Use `@tanstack/react-query` for server state management and caching.

### Authentication

* **NextAuth.js**: Use NextAuth.js v5.0.0-beta.28 with Prisma adapter for authentication.
* **Database**: Authentication data is stored using `@auth/prisma-adapter`.

### Database

* **Prisma**: Use Prisma as the ORM with PostgreSQL.
* **Supabase**: Production database uses Supabase PostgreSQL with Row Level Security (RLS).

### QR Code Generation

* **Libraries**: Use `qr-code-styling` for advanced QR code customization, `qr-code-styling-node` for server-side styling, `qrcode` for basic generation, and `qrcode.react` for React components.
* **Canvas**: Use `canvas` library for server-side QR code rendering.

### shadcn/ui

* **Component Usage**: When using shadcn/ui components, import them from `@/components/ui/...`.
* **Component Creation**: When creating new components, follow the existing structure and style of shadcn/ui components.
* **Radix UI**: All UI components are built on top of Radix UI primitives.

### Tailwind CSS

* **Utility-First**: Embrace the utility-first approach of Tailwind CSS.
* **`tailwind-merge`**: Use the `tailwind-merge` library to handle conflicting CSS classes.
* **`clsx`**: Use the `clsx` library for conditional class names.
* **Animations**: Use `tailwindcss-animate` for component animations.

### Form Handling

* **React Hook Form**: Use `react-hook-form` with `@hookform/resolvers` for form validation.
* **Validation**: Use `zod` for schema validation and type safety.
* **Field Validation**: Always use Zod schema for form field data validation to ensure type safety and consistent validation rules across the application.

### Zustand

* **State Management**: Use Zustand for global state management. Create stores in the `hooks` directory.

### UI Components

* **Tables**: Use `@tanstack/react-table` v8.21.3 for data tables.
* **Notifications**: Use `sonner` v2.0.5 for toast notifications.
* **Date Picker**: Use `react-day-picker` v9.7.0 with `date-fns` v4.1.0 for date handling.
* **Charts**: Use `recharts` v2.15.3 for data visualization.
* **Icons**: Use `lucide-react` v0.515.0 for icons.
* **Carousel**: Use `embla-carousel-react` v8.6.0 for carousel components.
* **Panels**: Use `react-resizable-panels` v3.0.3 for resizable layout panels.
* **Drawer**: Use `vaul` v1.1.2 for mobile drawer components.
* **Command**: Use `cmdk` v1.1.1 for command palette interfaces.
* **OTP**: Use `input-otp` v1.4.2 for OTP input components.
* **Radix UI**: All UI components are built on top of Radix UI primitives including accordion, alert-dialog, aspect-ratio, avatar, checkbox, collapsible, context-menu, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, switch, tabs, toggle, toggle-group, and tooltip.

### Utilities

* **HTTP Client**: Use `axios` v1.10.0 for HTTP requests.
* **Query String**: Use `qs` v6.14.0 for query string parsing.
* **Cookies**: Use `cookies-next` v4.3.0 for cookie management.
* **DOM Manipulation**: Use `jsdom` v26.1.0 for server-side DOM operations.
* **JWT**: Use `jose` v6.0.11 for JWT token handling.
* **Date Libraries**: Use `date-fns` v4.1.0 for date manipulation and `dayjs` v1.11.13 for lightweight date operations.
* **Address Search**: Use `react-daum-postcode` v3.2.0 for Korean address search functionality.
* **Utility Functions**: Use `@toss/utils` v1.6.1 and `es-toolkit` v1.39.5 for modern utility functions.
* **Browser Compatibility**: Use `browserslist` v4.25.0 for browser compatibility configuration.
* **Authentication Library**: Use `auth` v1.2.3 for additional authentication utilities.
* **Layout Management**: Use `overlay-kit` v1.8.2 for overlay and modal management.
* **Database**: Use `pg` v8.16.2 for PostgreSQL client connectivity.
* **CSS Utilities**: Use `class-variance-authority` v0.7.1 for component variant handling and `tailwind-merge` v3.3.1 for class merging.
* **Themes**: Use `next-themes` v0.4.6 for theme management.
* **Development Tools**: Use `tsx` v4.20.3 for TypeScript execution and `ts-node` v10.9.2 for Node.js TypeScript support.

## Directory Structure

* `app/`: Contains the application's routes, layouts, and pages.
  * `actions/`: Server actions for data mutations and business logic (account-management, data-management, log-management, qr-code-generator, qr-code-management, template-management).
  * `api/`: API routes for client-side data fetching (auth, cron, qrcodes).
  * `auth/`: Authentication-related pages (signin, error).
  * `dashboard/`: Protected dashboard pages and features (account, dashboard, history, settings).
  * `qrcode/`: QR code generation main page with components.
    * `components/`: QR code specific components (card-email, card-location, card-preview, card-sms, card-style, card-textarea, card-url, card-vcard, card-wifi, qr-handlers, qrcode-form).
* `components/`: Contains reusable components.
  * `ui/`: Contains shadcn/ui components (46 components including accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input-otp, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toggle-group, toggle, tooltip).
  * Other utility components (address-search, loading-spinner, user-nav, github-badge, history-button, log-statistics, new-qr-code-button, tailwind-indicator, unauthenticated, user-profile, etc.).
* `lib/`: Contains utility functions and constants.
  * Database connection, download utilities, QR code utilities, auth helpers, error logging, API logging, etc.
  * `supabase/`: Supabase client and related utilities.
* `hooks/`: Contains custom hooks and Zustand stores.
  * Custom hooks for mobile detection (`use-mobile.tsx`), remember me functionality (`use-remember-me.ts`), token refresh (`use-token-refresh.ts`).
* `types/`: Contains TypeScript type definitions.
  * Type definitions for QR codes, data management, environment, authentication, RLS, logs, etc.
* `public/`: Contains static assets.
  * PWA manifest, service worker, fonts, screenshots, etc.
* `prisma/`: Contains database schema and migrations.
* `docs/`: Contains project documentation.
  * PRD.md (Product Requirements Document)
  * DEPENDENCIES.md (Dependencies documentation)
  * RLS.md (Row Level Security setup guide)
  * CRON.md (Cron job documentation)
  * LOGGING.md (Logging system documentation)
* `context/`: Contains React context providers.
  * Authentication provider (`auth-provider.tsx`) and client providers (`client-providers.tsx`).
* `config/`: Contains application configuration.
  * `app.ts`: Application configuration constants.
* `scripts/`: Contains utility scripts.
  * `backup-logs.sql`: SQL script for backing up log data.
  * `cleanup-old-logs.sql`: SQL script for cleaning up old log entries.
  * `migrate-logging-system.sh`: Shell script for migrating the logging system.
  * `setup-rls.sh`: RLS setup script.
  * `setup-unified-rls.sql`: SQL script for unified RLS setup.
  * `test-unified-logging.ts`: TypeScript script for testing the unified logging system.
* `screenshots/`: Contains application screenshots for documentation.
  * Screenshots for all QR code types and dashboard pages.

## Specific Task Guidelines

* **Git Commit Messages**: When generating Git commit messages, please refer to the `.gitmessage.txt` file located in the project root and follow its format and content.

## Development Scripts

The project includes several npm scripts for development and maintenance:

* **Development**: `npm run dev` - Starts the development server with Turbo mode
* **Build**: `npm run build` - Generates Prisma client and builds the application
* **Cleaning**:
  * `npm run clean` - Removes node_modules, .next, and package-lock.json, clears npm cache
  * `npm run clean:files` - Removes files only
  * `npm run clean:cache` - Clears npm cache only
* **Package Management**:
  * `npm run upgrade:latest` - Updates all packages to latest versions
  * `npm run reinstall` - Clean reinstall of all packages
* **Logging System**:
  * `npm run migrate:logging` - Migrates the logging system
  * `npm run logs:test` - Tests the unified logging system
  * `npm run logs:cleanup` - Cleans up old log entries
  * `npm run logs:backup` - Backs up log data
  * `npm run logs:setup-rls` - Sets up unified RLS for logging
* **Documentation**: `npm run docs:update` - Shows documentation update checklist

## Feedback and Improvement

If Copilot's suggestions do not meet expectations, actively modify and provide feedback to help Copilot provide better suggestions in the future.

## Project Current Status

* **Version**: v1.4.32 (as of 2025년 6월 29일)
* **Package Count**: 106 npm packages (74 dependencies + 32 devDependencies)
* **UI Components**: 46 shadcn/ui components
* **QR Code Types**: 7 supported types (URL, TEXTAREA, WIFI, EMAIL, SMS, VCARD, LOCATION)
* **Authentication**: NextAuth.js v5.0.0-beta.28 with Google OAuth
* **Database**: Supabase PostgreSQL with Prisma ORM v6.10.1
* **Security**: Row Level Security (RLS) implemented
* **State Management**: Zustand v5.0.5 stores implemented for global state management
* **Form Handling**: React Hook Form v7.58.0 with Zod v3.25.64 validation integrated
* **Query Management**: React Query v5.80.7 for server state management
* **Code Quality**: ESLint, Prettier, and TypeScript configured with strict rules
* **Development**: Next.js 14.2.30 with Turbo mode enabled for faster development
