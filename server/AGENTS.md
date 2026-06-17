# server/AGENTS.md

## Module Context

Bun HTTP server on port 3002. Sole responsibility: receive prompt + provider from the frontend, call the appropriate AI API, post-process the returned code, and return it. No business logic beyond this.

## Tech Stack & Constraints

- Runtime: Bun (`Bun.serve()`) — no Node.js `http`/`express`.
- Fetch: use native `fetch` — no axios or node-fetch.
- Type imports from `@types/bun` are available via `devDependencies`.

## Implementation Patterns

**Modifying AI behavior:** Edit `SYSTEM_PROMPT` at the top of `index.ts`. This single constant controls all generated code quality. Key invariants in the prompt that must not be removed:
- No `import` statements.
- Inline styles only.
- No TypeScript syntax.
- End with `render(<ComponentName />)`.

**Adding a new AI provider:** Follow the existing `callAnthropic` / `callGoogle` pattern — a standalone async function returning `Promise<string>`. Register the provider string in the `Provider` type and `ENV_KEYS` map.

**Post-processing pipeline (order is fixed):**
1. `stripCodeFences(text)` — removes markdown fences from AI response.
2. `ensureRenderCall(code)` — appends `render(<Name />)` if missing.

## Local Golden Rules

**Sensitive Files:**
- `.env.local` — contains `ANTHROPIC_API_KEY` and `GOOGLE_API_KEY`. Never log or expose these values.

**Do:**
- Return `{ error: string }` JSON with an appropriate HTTP status for all error cases.
- Map `429`/`503` API errors to the same status codes in the response.
- Keep `CORS_HEADERS` on every response — the Vite proxy already handles CORS in dev, but the header is needed for any direct access.

**Don't:**
- Don't log or return raw API keys in error messages.
- Don't expose API key presence/values through any endpoint — only return boolean `hasKey` flags if needed.
- Don't add persistent state (database, in-memory cache) — the server is stateless by design.
- Don't change the port from `3002` without updating `vite.config.ts` proxy target simultaneously.
