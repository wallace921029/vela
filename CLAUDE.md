# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Vela

A self-hosted personal navigation/bookmark dashboard. Users organize bookmarks into draggable groups and items. Auth is invite-code gated; the first admin invite code is `00000000`.

## Development

Install dependencies before first run:
```sh
npm install
npm --prefix backend install
```

Start both servers (frontend: http://localhost:5173, backend: http://localhost:3000):
```sh
./dev.sh        # checks deps, then runs npm run dev
npm run dev     # shortcut without dep check
```

Run only one side:
```sh
npm run dev:frontend
npm run dev:backend
```

Build:
```sh
npm run build           # backend tsc, then frontend vite build
npm run build:frontend  # tsc -b && vite build
npm run build:backend   # tsc in backend/
```

Lint:
```sh
npm run lint
```

No test runner is configured. Validate changes with `npm run lint`, `npm run build`, and manual checks in the browser.

## Architecture

### Monorepo layout

Two independent npm packages in one repo:
- Root (`package.json`) — React 19 + Vite + Tailwind CSS v4 frontend
- `backend/` (`backend/package.json`) — Fastify 5 + better-sqlite3 backend

### API proxy

During development Vite proxies all `/api/*` requests to `http://localhost:3000` (`vite.config.ts`). The frontend never uses an explicit backend URL — always call `/api/...`.

### Authentication flow

JWT tokens are issued by the backend and stored in `localStorage` under `vela_token` and `vela_user`. `AuthContext` (`src/contexts/AuthContext.tsx`) wraps the entire app and exposes `useAuth()`. `RequireAuth` (`src/components/RequireAuth.tsx`) gates all protected routes. All routes under `/` in the router are wrapped in `RequireAuth`.

User roles are `ADMIN` and regular user. Admin-only UI (system settings menu item, `/system` routes) is shown conditionally based on `user.role === 'ADMIN'`.

### Backend structure

- `backend/app/main.ts` — Fastify entry: registers CORS, JWT, plugins, and route modules
- `backend/app/db.ts` — SQLite init (WAL mode); tables: `users`, `invite_codes`, `groups`, `items`
- `backend/app/plugins/authenticate.ts` — `fastify.authenticate` decorator used to guard routes
- `backend/app/router/auth.ts` — login, register (invite-code required), profile update
- `backend/app/router/nav.ts` — GET/PUT `/api/nav` for the user's groups+items
- `backend/app/router/admin.ts` — user management and invite code endpoints (ADMIN only)

The JWT secret is hardcoded as a dev default; set it via environment variable before production.

### Frontend structure

- `src/router/index.tsx` — all routes, lazy-loaded
- `src/layouts/BaseLayout.tsx` — sticky header (theme toggle, language toggle, user menu with bookmark import); renders `<Outlet />`
- `src/contexts/AuthContext.tsx` — auth state and `useAuth()` hook
- `src/hooks/useNavData.ts` — fetches/persists groups and items; exposes the full CRUD + reorder API consumed by the dashboard
- `src/types/index.ts` — `NavItem` and `NavGroup` types shared across the app
- `src/components/ui/` — shadcn/ui primitives; use existing components before adding new ones
- `src/lib/utils.ts` — `cn()` for class composition

### Navigation data model

```
NavGroup { id, title, items: NavItem[] }
NavItem  { id, url, title, icon?, description? }
```

Groups and items are persisted per-user in SQLite. `useNavData` does optimistic local state updates then fires a `PUT /api/nav` to sync.

### i18n

`i18next` with `en` and `zh` locales. Language preference persisted to `localStorage` as `vela_language`. Translation keys live in `src/i18n.ts`.

## Coding conventions

- `@/` alias resolves to `src/`
- Styling is Tailwind-first; compose classes with `cn()` from `src/lib/utils.ts`
- React components: PascalCase files and exports; hooks: `useX` naming; utils: camelCase
- Backend uses `.js` extensions in imports (ESM with `"type": "module"`)
