# src/AGENTS.md

## Module Context

React 19 frontend served by Vite on port 5173. All AI API calls go through `/api/...` — Vite proxies these to `localhost:3002`. The frontend never calls external APIs directly.

## Tech Stack & Constraints

- React 19 with TypeScript strict mode.
- `react-live` for runtime component rendering — version 4.x API.
- No CSS framework. Inline styles everywhere; no `.css` imports in components.
- State management: React built-ins only (`useState`, `useEffect`) — no external state library.

## Implementation Patterns

**react-live integration (`LivePreview.tsx`):**
- `LiveProvider` must use `noInline={true}` because generated components use `render()` explicitly.
- `LiveError` and `LivePreview` must always be rendered together inside `LiveProvider`.
- Never pass `scope` with React — `react-live` v4 provides React globally.

**Hook pattern (`useComponentGenerator.ts`):**
- Single hook owns all generation state: `components[]`, `isLoading`, `error`.
- POST body shape: `{ prompt, apiKey?, provider? }`.
- On success, prepend new `GeneratedComponent` to the list (newest first).

**Component ID format:** `` `${Date.now()}-${Math.random().toString(36).slice(2)}` ``

**File naming:** PascalCase for components (`ComponentCard.tsx`), camelCase for hooks (`useComponentGenerator.ts`).

## Local Golden Rules

**Do:**
- Keep provider/API key state in the top-level `App.tsx` and pass down — do not lift it into the hook.
- Use `GET /api/config` on mount to determine whether to show the API key input UI.

**Don't:**
- Don't add TypeScript type annotations to generated component code passed to `LiveProvider` — the sandbox runs plain JS.
- Don't use `React.FC` — use plain function declarations.
- Don't add `import React` — React 19 JSX transform handles it automatically.
