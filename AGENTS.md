# Repository Guidelines

## Project Structure & Module Organization

- `apps/web` (Vue 3 + Vite) — main web app.
- `apps/vscode` — VS Code extension sources.
- `packages/core`, `packages/shared`, `packages/config` — reusable libraries and configs.
- `packages/md-cli` — packaged CLI build output and release assets.
- `public`, `docs`, `scripts`, `docker`, `prd` — static assets, docs, helper scripts, Docker files, product notes.

## Build, Test, and Development Commands

- Install: `pnpm i` (Node 22, see `.nvmrc`/`volta`).
- Dev (web): `pnpm start` → runs `apps/web` with Vite on your LAN.
- Build (web): `pnpm web build` or `pnpm --filter @md/web build`.
- Preview (web): `pnpm --filter @md/web preview`.
- Type check: `pnpm run type-check` (project-wide `vue-tsc`).
- Lint/format: `pnpm run lint` (ESLint autofix via `@antfu/eslint-config`).
- Build CLI package: `pnpm run build:cli` (packs web dist into `packages/md-cli/`).

## Coding Style & Naming Conventions

- Language: TypeScript, Vue SFC; 2‑space indentation, UTF‑8.
- Filenames: Vue components PascalCase (e.g., `AppHeader.vue`), utilities kebab‑case (e.g., `markdown-utils.ts`).
- Imports: use ESM paths; group std/libs/local in that order.
- Linting: ESLint + Prettier 3; fix before commit (see `simple-git-hooks`/`lint-staged`).

## Testing Guidelines

- Currently no project‑wide automated tests.
- When adding tests: prefer Vitest; colocate as `*.spec.ts` next to source; keep fast and deterministic.
- Aim for critical logic in `packages/core` first; include minimal fixtures.

## Commit & Pull Request Guidelines

- Commits: short imperative subject; optional Conventional Commits (`feat:`, `fix:`, `chore:`).
- PRs must include: scope/goal, screenshots for UI changes, reproduction or verification steps, and linked issues.
- CI expectations: lint + type‑check must pass; builds should be reproducible.

## Security & Configuration Tips

- Do not commit secrets (S3/Qiniu/COS keys, etc.). Use env vars or per‑platform secret managers.
- Prefer `.env.local` (ignored) for local overrides.
- Validate uploads and sanitize HTML; keep dependencies up to date.

## Architecture Overview (Brief)

- Frontend: Vue 3 + Pinia + Vite + Tailwind; Markdown via `marked`/`unified`.
- Libraries: shared logic in `packages/*`; web app consumes via workspace links.
