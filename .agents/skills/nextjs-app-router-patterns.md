---
name: Next.js App Router Patterns
description: Rules for using the App router effectively, server vs. client components
---
# Next.js App Router Patterns

1.  **Server Components Default**: Always default to Server Components for performance and SEO. Add `"use client";` only when React hooks (`useState`, `useEffect`) or browser APIs are strictly necessary.
2.  **Data Fetching**: Fetch data in Server Components and pass it down as props. Use Next.js extended `fetch` for caching where appropriate.
3.  **Route Handlers**: Keep logical endpoints in `app/api/.../route.ts`. Use standard Web Request and Response objects.
4.  **Colocation**: Keep components, tests, and styles colocated within their respective route folders where it makes sense, or use a clean `@/components` alias for shared UI.
5.  **Actions**: Prefer Server Actions for form submissions and simple mutations instead of manual API routes when operating within the UI.
