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

### shadcn/ui

* **Component Usage**: When using shadcn/ui components, import them from `@/components/ui/...`.
* **Component Creation**: When creating new components, follow the existing structure and style of shadcn/ui components.

### Tailwind CSS

* **Utility-First**: Embrace the utility-first approach of Tailwind CSS.
* **`tailwind-merge`**: Use the `tailwind-merge` library to handle conflicting CSS classes.
* **`clsx`**: Use the `clsx` library for conditional class names.

### Zustand

* **State Management**: Use Zustand for global state management. Create stores in the `hooks` directory.

## Directory Structure

* `app/`: Contains the application's routes, layouts, and pages.
* `components/`: Contains reusable components.
  * `ui/`: Contains shadcn/ui components.
* `lib/`: Contains utility functions and constants.
* `hooks/`: Contains custom hooks.
* `types/`: Contains TypeScript type definitions.
* `public/`: Contains static assets.

## Specific Task Guidelines

* **Git Commit Messages**: When generating Git commit messages, please refer to the `.gitmessage.txt` file located in the project root and follow its format and content.

## Feedback and Improvement

If Copilot's suggestions do not meet expectations, actively modify and provide feedback to help Copilot provide better suggestions in the future.
