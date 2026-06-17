# AGENTS.md

## Operational Commands

Package manager: `bun` exclusively — never use npm, yarn, or pnpm.

```bash
bun install          # install dependencies
bun run dev          # start both API server (3002) + Vite (5173)
bun run server       # API server only with hot reload
bun run build        # TypeScript check + Vite bundle
bun run lint         # ESLint
bun run preview      # preview build output
bun run test         # Vitest watch mode
bun run test:run     # Vitest single run
bun run test:coverage  # coverage report (v8)
```

## Project Context

AI-powered React component generator: user submits a text prompt, the backend proxies to Anthropic or Google, and the returned component code is rendered live in the browser via `react-live`.

Tech stack: React 19, TypeScript, Vite, Bun, react-live, Anthropic Claude API, Google Gemini API.

## Golden Rules

**Immutable:**
- Never commit API keys. Keys go in `.env` only.
- Never add a `server/` dependency outside the root `package.json` — there is no separate server package.json.
- The `render(<ComponentName />)` call at the end of generated code is mandatory for `react-live`'s `noInline` mode; `ensureRenderCall()` handles the fallback — do not remove it.

**Do:**
- Use `Bun.serve()` for all server-side HTTP handling.
- Keep AI-facing rules in `SYSTEM_PROMPT` at the top of `server/index.ts`.
- Accept both env-var keys and client-supplied keys; client key takes precedence.

**Don't:**
- Don't add CSS files or Tailwind — the project uses inline styles only.
- Don't use `import` in AI-generated component code — React is a global in `react-live` scope.
- Don't expose raw API key values through `GET /api/config` — return boolean presence only.

## Standards & References

- Commit format: `type: 한국어 설명` (e.g., `feat: 컴포넌트 재생성 기능 추가`)
- TypeScript strict mode is enabled; avoid `any`.
- No test framework is configured; verify changes by running `bun run dev` and testing in browser.
- If rules in this file diverge from actual code behavior, update this file to match.

## Context Map

- **[AI 프록시 서버 수정 (server/)](./server/AGENTS.md)** — SYSTEM_PROMPT 수정, API 엔드포인트 추가, 후처리 함수 변경 시.
- **[React 프론트엔드 수정 (src/)](./src/AGENTS.md)** — 컴포넌트, 훅, 타입 작업 시.
