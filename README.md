# Vela

[English](./README.md) | [中文](./README.zh.md)

A self-hosted personal navigation dashboard. Organize your bookmarks into draggable groups, share the instance with family or a team via invite codes, and switch language and theme on the fly.

## Preview

| Light | Dark |
| ----- | ---- |
| ![Dashboard — light](./captures/Screenshot%202026-05-14%20at%2001.21.39.png) | ![Dashboard — dark](./captures/Screenshot%202026-05-14%20at%2001.21.18.png) |

![Invite code management](./captures/Screenshot%202026-05-14%20at%2001.22.00.png)

## Features

- **Invite-code registration** — closed by default; only people with a valid invite code can sign up
- **Drag-and-drop navigation** — reorder groups and links with `@dnd-kit`, with optimistic persistence to SQLite
- **Browser bookmark import** — import an exported `bookmarks.html` from any major browser
- **Multi-user with roles** — `ADMIN` users get a system-settings panel to manage users and invite codes
- **Internationalization** — built-in English and Simplified Chinese (`react-i18next`)
- **Theming** — light / dark / system, powered by `next-themes`
- **One-command Docker deploy** — backend + frontend + persistent SQLite volume

## Tech stack

| Layer    | Stack                                                                          |
| -------- | ------------------------------------------------------------------------------ |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui, react-router 7         |
| Backend  | Fastify 5, `@fastify/jwt`, bcryptjs, better-sqlite3                            |
| Storage  | SQLite (WAL mode) on the host filesystem                                       |
| Deploy   | Docker Compose (Nginx static + Node.js backend)                                |

## Quick start with Docker

Requires Docker 24+ with the Compose plugin.

```sh
git clone <repo-url> vela
cd vela
cp .env.example .env
# Edit .env: set JWT_SECRET to a long random string (e.g. `openssl rand -base64 48`)
docker compose up -d --build
```

Open <http://localhost:10000> and register the first administrator with the invite code from `INITIAL_INVITE_CODE` (defaults to `000000`). Once consumed, generate further invite codes from the **System Settings → Invite Codes** page.

SQLite data is persisted to `./data/` on the host. Back it up by copying that directory.

## Local development

Requires Node.js 22+ (LTS).

```sh
npm install
npm --prefix backend install
cp .env.example .env        # only needed once
./dev.sh                    # or: npm run dev
```

- Frontend: <http://localhost:5173>
- Backend:  <http://localhost:3000>

Vite proxies `/api/*` to the backend, so the frontend always calls relative URLs.

### Useful scripts

| Command                       | What it does                                |
| ----------------------------- | ------------------------------------------- |
| `npm run dev`                 | Run backend and frontend concurrently       |
| `npm run dev:frontend`        | Vite dev server only                        |
| `npm run dev:backend`         | Fastify with `tsx watch` only               |
| `npm run build`               | Build backend (tsc) then frontend (vite)    |
| `npm run lint`                | ESLint over the frontend                    |
| `npm run preview`             | Preview the built frontend locally          |

## Configuration

All runtime configuration lives in a single `.env` file at the repository root.

| Variable              | Required | Description                                                                 |
| --------------------- | -------- | --------------------------------------------------------------------------- |
| `JWT_SECRET`          | Yes      | Secret used to sign JWTs. Use a long random string.                         |
| `INITIAL_INVITE_CODE` | No       | Seeded as an ADMIN invite on first boot. Defaults to `000000`. Has no effect after it has been used. |

## Project layout

```
vela/
├── src/                # React frontend
│   ├── pages/          # Route-level pages (Auth, Dashboard, Account, SystemSettings, About)
│   ├── layouts/        # BaseLayout with header, theme, language, profile menu
│   ├── components/     # Shared components, including shadcn/ui primitives
│   ├── contexts/       # AuthContext: token + user in localStorage
│   ├── hooks/          # Data hooks (e.g. useNavData)
│   └── router/         # react-router config (lazy routes)
├── backend/
│   └── app/
│       ├── main.ts     # Fastify entry: CORS, JWT, plugins, routes
│       ├── db.ts       # SQLite init and schema
│       ├── plugins/    # authenticate decorator
│       └── router/     # auth.ts, admin.ts, nav.ts
├── docker-compose.yml
├── Dockerfile          # Frontend (Nginx serving built assets)
├── backend/Dockerfile  # Backend (Node.js LTS)
└── nginx.conf          # Static hosting + /api reverse proxy
```

## License

[MIT](./LICENSE) © 2026 Uzhi
