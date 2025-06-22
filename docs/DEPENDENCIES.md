# DEPENDENCIES

## Table of Contents

- [DEPENDENCIES](#dependencies)
  - [Table of Contents](#table-of-contents)
  - [Git](#git)
  - [Next.js](#nextjs)
  - [shadcn](#shadcn)
  - [Tailwindcss](#tailwindcss)
  - [Zustand](#zustand)
  - [Axios](#axios)
  - [React Query](#react-query)
  - [Browserslist](#browserslist)
  - [Jose (JsonWebToken)](#jose-jsonwebtoken)
  - [Day.js](#dayjs)
  - [qs](#qs)
  - [cookies-next](#cookies-next)
  - [QRCode](#qrcode)
  - [ESLint](#eslint)
  - [Prettier](#prettier)
  - [Troubleshooting](#troubleshooting)

## Git

Auto-increments patch version and stages files on commit

```bash
$ chmod +x pre-commit.sh
$ ./pre-commit.sh
```

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

## Zustand

Bear necessities for state management in React

```shell
npm install zustand
```

## Axios

```shell
npm install axios
```

## React Query

Powerful asynchronous state management, server-state utilities and data fetching for the web. TS/JS, React Query, Solid Query, Svelte Query and Vue Query.

```shell
npm install @tanstack/react-query
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

## QRCode

```shell
npm install qrcode.react
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
