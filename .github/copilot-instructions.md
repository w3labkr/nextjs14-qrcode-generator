# Copilot Instructions

This file provides guidelines for GitHub Copilot to reference when performing code generation and other tasks in this project.

## Project Overview

This project is a QR code generator built with Next.js 14. It utilizes a modern tech stack including TypeScript, Tailwind CSS, and shadcn/ui for a robust and well-structured application. The goal is to provide a fast, reliable, and user-friendly QR code generation experience.

## General Guidelines

* **Response Language**: Please provide all suggestions and responses in **Korean**.
* **Maintain Context**: Understand and utilize the context based on the current file you are working on, surrounding code, and other related open files when suggesting code.
* **Adhere to Code Style**: Identify the project's existing code style (indentation, naming conventions, etc.) and generate code with consistent styling.
* **Avoid Unnecessary Comments**: When generating code, **do not add comments.** Developers will add comments manually as needed.
* **Idiomatic Code**: Write code using common idioms and best practices for the specific programming language and framework.
* **Modularity and Reusability**: Where possible, consider modularizing code and making it reusable.
* **Error Handling**: Endeavor to suggest appropriate error handling mechanisms.

## Tech Stack Specific Guidelines

### Next.js

* **App Router**: Utilize the App Router for routing, layouts, and server components.
* **Server Actions**: Use Server Actions for mutations and data fetching on the server side.
* **API Routes**: For client-side data fetching, use API Routes.

### React

* **State Management**: Prefer using `react-hook-form` for form state management instead of `useState`. For global state management, use `Zustand`.
* **Componentization**: Break down complex components into smaller, reusable ones.
* **Data Fetching**: Use `@tanstack/react-query` for server state management and caching.

### Authentication

* **NextAuth.js**: Use NextAuth.js v5 (beta) with Prisma adapter for authentication.
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

### Zustand

* **State Management**: Use Zustand for global state management. Create stores in the `hooks` directory.

### UI Components

* **Tables**: Use `@tanstack/react-table` for data tables.
* **Notifications**: Use `sonner` for toast notifications.
* **Date Picker**: Use `react-day-picker` with `date-fns` for date handling.
* **Charts**: Use `recharts` for data visualization.
* **Icons**: Use `lucide-react` for icons.
* **Carousel**: Use `embla-carousel-react` for carousel components.
* **Panels**: Use `react-resizable-panels` for resizable layout panels.
* **Drawer**: Use `vaul` for mobile drawer components.
* **Command**: Use `cmdk` for command palette interfaces.
* **OTP**: Use `input-otp` for OTP input components.

### Utilities

* **HTTP Client**: Use `axios` for HTTP requests.
* **Query String**: Use `qs` for query string parsing.
* **Cookies**: Use `cookies-next` for cookie management.
* **DOM Manipulation**: Use `jsdom` for server-side DOM operations.
* **JWT**: Use `jose` for JWT token handling.
* **Date Libraries**: Use `date-fns` for date manipulation and `dayjs` for lightweight date operations.
* **Address Search**: Use `react-daum-postcode` for Korean address search functionality.

## Directory Structure

* `app/`: Contains the application's routes, layouts, and pages.
  * `actions/`: Server actions for data mutations and business logic.
  * `api/`: API routes for client-side data fetching.
  * `auth/`: Authentication-related pages (signin, error, verify-request).
  * `dashboard/`: Protected dashboard pages and features.
  * `qrcode/`: QR code generation main page.
* `components/`: Contains reusable components.
  * `ui/`: Contains shadcn/ui components (47 components).
  * `qr-code-forms/`: Form components for different QR code types.
  * `qr-code-frames/`: QR code frame selection components.
  * `template-manager/`: Template management components.
* `lib/`: Contains utility functions and constants.
  * Database connection, download utilities, QR code utilities, etc.
* `hooks/`: Contains custom hooks and Zustand stores.
  * Custom hooks for QR code generation, mobile detection, token refresh, etc.
* `types/`: Contains TypeScript type definitions.
  * Type definitions for QR codes, data management, environment, etc.
* `public/`: Contains static assets.
  * PWA manifest, service worker, fonts, etc.
* `prisma/`: Contains database schema and migrations.
* `docs/`: Contains project documentation.
  * PRD.md (Product Requirements Document)
  * DEPENDENCIES.md (Dependencies documentation)
  * RLS_SETUP.md (Row Level Security setup guide)
* `test/`: Contains test files (currently empty).

## Specific Task Guidelines

* **Git Commit Messages**: When generating Git commit messages, please refer to the `.gitmessage.txt` file located in the project root and follow its format and content.

## Feedback and Improvement

If Copilot's suggestions do not meet expectations, actively modify and provide feedback to help Copilot provide better suggestions in the future.

## Project Current Status

* **Version**: v1.2.104 (as of June 2025)
* **File Count**: 170+ TypeScript/JavaScript files
* **Package Count**: 99 npm packages
* **UI Components**: 47 shadcn/ui components
* **QR Code Types**: 7 supported types (URL, TEXT, WIFI, EMAIL, SMS, VCARD, LOCATION)
* **Authentication**: NextAuth.js v5 with Google OAuth
* **Database**: Supabase PostgreSQL with Prisma ORM
* **Security**: Row Level Security (RLS) implemented
