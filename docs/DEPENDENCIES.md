# DEPENDENCIES

## Table of Contents

- [DEPENDENCIES](#dependencies)
  - [Table of Contents](#table-of-contents)
  - [Next.js](#nextjs)
  - [shadcn](#shadcn)
  - [Tailwindcss](#tailwindcss)
  - [Supabase](#supabase)
  - [prisma](#prisma)
  - [Zustand](#zustand)
  - [React Query](#react-query)
  - [Nodemailer](#nodemailer)
  - [Browserslist](#browserslist)
  - [Jose (JsonWebToken)](#jose-jsonwebtoken)
  - [Day.js](#dayjs)
  - [qs](#qs)
  - [cookies-next](#cookies-next)
  - [ESLint](#eslint)
  - [Prettier](#prettier)
  - [Troubleshooting](#troubleshooting)

## Next.js

Automatic Installation

```shell
$ npx create-next-app@14.2.30 .

✔ Would you like to use TypeScript? Yes
✔ Would you like to use ESLint? Yes
✔ Would you like to use Tailwind CSS? Yes
✔ Would you like to use `src/` directory? No
✔ Would you like to use App Router? (recommended) Yes
✔ Would you like to customize the default import alias (@/*)? No
```

```shell
node -v > .nvmrc
```

[How to set up a new Next.js project](https://nextjs.org/docs/app/getting-started/installation)

## shadcn

Run the init command to create a new Next.js project or to setup an existing one:

```shell
npx shadcn@latest init -d
```

Use the add command to add components and dependencies to your project.

```shell
npx shadcn@latest add -a
```

This will add/install all shadcn components (overwrite if present).

```shell
npx shadcn@latest add -a -y -o
```

Add `tanstack/react-table` dependency:

```shell
npm install @tanstack/react-table
```

Add the Toaster component. Edit `app/layout.tsx`:

```javascript
import { Toaster } from '@/components/ui/sonner'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
```

[Install and configure Next.js](https://ui.shadcn.com/docs/installation/next)

## Tailwindcss

Install Tailwind CSS

```shell
npm install -D tailwindcss@3 postcss autoprefixer
```

Add Tailwind to your PostCSS configuration. `postcss.config.js`:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
```

[Get started with Tailwind CSS](https://tailwindcss.com/docs/installation/using-postcss)

## Supabase

Install Supabase Auth & CLI

```shell
npm install @supabase/supabase-js @supabase/ssr
npm install supabase --save-dev
```

Initialize configurations for Supabase local development.

```shell
npx supabase init
```

Connect the Supabase CLI to your Supabase account by logging in with your personal access token.

```shell
npx supabase login
```

Link your local development project to a hosted Supabase project.

```shell
npx supabase link --project-ref <project-id>
```

[Supabase CLI](https://supabase.com/docs/reference/cli/introduction)

## prisma

Install Prisma ORM

```shell
npm install prisma --save-dev
npm install tsx --save-dev
# If you're not using a Prisma Postgres database, you won't need the @prisma/extension-accelerate package.
npm install @prisma/extension-accelerate
```

Then, run prisma init to initialize Prisma ORM in your project.

```shell
npx prisma init
npx prisma migrate dev --name init
```

Seed your database

```shell
npx prisma db seed
```

Set up Prisma Client

```shell
npm install @prisma/client
```

[ORM Quickstarts Prisma](https://supabase.com/docs/guides/database/prisma)

## Zustand

Bear necessities for state management in React

```shell
npm install zustand
```

## React Query

Powerful asynchronous state management, server-state utilities and data fetching for the web. TS/JS, React Query, Solid Query, Svelte Query and Vue Query.

```shell
npm install @tanstack/react-query
```

## Nodemailer

Send e-mails with Node.JS.

```shell
npm install nodemailer
npm install --save-dev @types/nodemailer
```

## Browserslist

Share target browsers between different front-end tools, like Autoprefixer, Stylelint and babel-preset-env.

```shell
npm install browserslist
```

Edit `package.json`:

```json
{
  "browserslist": [
    "defaults and fully supports es6-module",
    "maintained node versions"
  ],
}
```

## Jose (JsonWebToken)

JWA, JWS, JWE, JWT, JWK, JWKS for Node.js, Browser, Cloudflare Workers, Deno, Bun, and other Web-interoperable runtimes.

```shell
npm install jose
```

## Day.js

Day.js 2kB immutable date-time library alternative to Moment.js with the same modern API.

```shell
npm install dayjs
```

## qs

A querystring parser with nesting support

```shell
npm install qs @types/qs
```

## cookies-next

Getting, setting and removing cookies on both client and server with next.js

```shell
npm i cookies-next@4
```

## ESLint

ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.

```shell
npm install --save-dev eslint eslint-plugin-react eslint-plugin-react-hooks
npm install --save-dev eslint-plugin-import eslint-import-resolver-typescript
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install --save-dev @next/eslint-plugin-next
```

Find and fix problems in your JavaScript code.

```shell
npx eslint ./app
npx eslint --fix ./{app,components,config,context,hooks,lib,schemas,store,types,utils}
```

## Prettier

Prettier is an opinionated code formatter.

```shell
npm install --save-dev prettier eslint-plugin-prettier eslint-config-prettier
npm install --save-dev eslint-plugin-tailwindcss prettier-plugin-tailwindcss
npm install --save-dev prettier-plugin-prisma
```

To format a file in-place.

```shell
npx prettier --check "./app/**/*.{ts,tsx}"
npx prettier --write "./{app,components,config,context,hooks,lib,schemas,store,types,utils}/**/*.{ts,tsx}"
```

## Troubleshooting

ESLint: Plugin "react-hooks" was conflicted between ".eslintrc.js" and ".eslintrc.js » eslint-config-next » plugin:react-hooks/recommended".

```shell
npm --save-dev install eslint-plugin-react-hooks@4
```

[DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.

```shell
nvm use v20.18.3
node -v > .nvmrc
```
