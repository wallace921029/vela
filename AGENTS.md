# Repository Guidelines

## Project Structure & Module Organization

This repository is a Vite + React + TypeScript frontend with a separate Fastify backend package. Frontend code lives in `src/`: pages are under `src/pages`, shared layouts in `src/layouts`, reusable UI primitives in `src/components/ui`, dashboard-specific components in `src/components/dashboard`, hooks in `src/hooks`, utilities in `src/utils`, and shared types in `src/types`. Routing is defined in `src/router/index.tsx`, app entry is `src/main.tsx`, and global styles are in `src/index.css`. Backend code lives in `backend/app`, with `backend/app/main.ts` as the entry point, route modules in `backend/app/router`, package metadata in `backend/package.json`, and SQLite files under `backend/db`. Static browser assets belong in `public`.

## Build, Test, and Development Commands

- `npm run dev` starts both the Fastify backend and Vite frontend via `concurrently`.
- `npm run dev:frontend` starts only the Vite dev server.
- `npm run dev:backend` delegates to `backend/package.json` and runs `tsx watch index.ts`.
- `npm run build` builds the backend with `tsc`, then builds the frontend bundle in `dist`.
- `npm --prefix backend run build` compiles the backend to `backend/dist`.
- `npm --prefix backend run start` runs the compiled backend.
- `npm run lint` runs the frontend ESLint config from the repository root.
- `npm run preview` serves the built frontend locally.

Install frontend dependencies with `npm install` at the repository root and backend dependencies with `npm install` inside `backend` or via `npm --prefix backend install`. Keep both lockfiles committed when dependency changes are intentional.

## Coding Style & Naming Conventions

Use TypeScript for app and backend code. React components use PascalCase file and export names, such as `Dashboard.tsx` and `TimeWeatherWidget.tsx`; hooks use `useX` naming; utility modules use camelCase names. Prefer the `@/` alias for imports from `src` where existing code does. Styling is Tailwind-first, with shared class composition through `cn` from `src/lib/utils.ts`. Follow the existing ESLint flat config in `eslint.config.js`; run `npm run lint` before opening a PR.

## Testing Guidelines

No test runner is configured yet. Until one is added, validate changes with `npm run lint`, `npm run build`, and manual checks through `npm run dev`. When adding tests, colocate focused tests near the code they cover or place broader integration tests in a clearly named test directory, and document the new command in `package.json` and this guide.

## Commit & Pull Request Guidelines

The current history uses short, imperative summaries, for example `Initial project import: frontend, backend, assets`. Keep commits concise and scoped to one logical change. Pull requests should include a brief description, the commands run for validation, linked issues when applicable, and screenshots or screen recordings for visible UI changes.

## Security & Configuration Tips

Do not commit production secrets. The backend currently contains development defaults such as an open CORS policy and a hard-coded JWT secret; replace these with environment-based configuration before production deployment. Treat `backend/db` contents as local development data unless a migration or seed file is explicitly required.
