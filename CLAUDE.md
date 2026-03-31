# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands use **Bun** as the runtime (Bun 1.2+ required).

```bash
bun test                        # Run all tests
bun test tests/client.test.ts   # Run a single test file
bun run lint                    # TypeScript strict type check (tsc --noEmit)
bun run format                  # Prettier format (120 chars, single quotes, no semis)
bun run build                   # Full build: clean + ESM + CJS + types
```

## Architecture

This is a zero-dependency TypeScript library wrapping the Inoreader RSS API. It targets universal runtime compatibility (Node.js 18+, Bun, Deno, browsers) via the native Fetch API.

### Source layout (`src/`)

| File | Role |
|------|------|
| `client.ts` | `InoreaderClient` — primary API surface; 20+ methods for subscriptions, tags, streams, articles, preferences |
| `auth.ts` | `InoreaderAuth` — OAuth 2.0 flows (authorization URL, token exchange, refresh) and legacy ClientLogin |
| `config.ts` | Default configs, stream ID constants, stream parameter presets, `ConfigBuilder`, environment loading, validation |
| `types.ts` | All request/response TypeScript interfaces |
| `errors.ts` | Error hierarchy: `InoreaderError` base + 7 specific subclasses (Authentication, RateLimit, Token, etc.) |
| `helpers.ts` | High-level pagination helpers: `fetchAllArticles`, `fetchUnreadArticles`, `fetchStarredArticles`, etc. |
| `utils.ts` | Encoding, validation, crypto, JSON parsing, timestamp utilities |
| `version.ts` | Exports `VERSION` constant (kept in sync with `package.json`) |
| `index.ts` | Public barrel export |

### Key design patterns

- `InoreaderClient` wraps `InoreaderAuth` internally; tokens are refreshed automatically before requests.
- Rate limit info is parsed from response headers and exposed on the client.
- `ConfigBuilder` provides a fluent interface for constructing client config; environment variable loading is also supported.
- Stream IDs follow Inoreader conventions (e.g., `user/-/state/com.google/reading-list`); constants live in `config.ts`.

### Build output

The build produces three formats in `dist/`:
- `dist/esm/` — ES Modules (browser/bundler)
- `dist/cjs/` — CommonJS (Node.js `require`)
- `dist/types/` — `.d.ts` declaration files

Each subdirectory contains its own `package.json` with the correct `"type"` field so consumers can import without extra config.
