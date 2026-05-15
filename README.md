# Vela

[English](./README.md) | [中文](./README.zh.md)

Vela is a self-hosted personal navigation workspace for organizing frequently used websites, importing browser bookmarks, keeping quick notes, and sharing one instance with multiple users through invite-based registration.

## Preview

![Dark Theme](./captures/dark_theme.png)
![Light Theme](./captures/light_theme.png)
![Invite Code](./captures/invite_code_feature.png)
![Quick Note](./captures/quick_note_feature.png)
![Keep Screen On](./captures/keepsceenon_feature.png)

## Features

- Group, search, sort, and resize navigation cards
- Import browser bookmarks from an HTML export file
- Quick notes for lightweight text records
- Invite-code registration; public sign-up is not open by default
- Multi-user support with roles; admins can manage users and invite codes
- Homepage clock, weather, search, and keep-screen-on mode
- SQLite storage, suitable for a personal server or NAS

## Docker Deployment

Requirements: Docker 24+ with the Compose plugin.

```sh
git clone https://github.com/wallace921029/vela.git
cd vela
cp .env.example .env
```

Edit `.env`:

```env
JWT_SECRET=replace-this-with-a-long-random-string
INITIAL_INVITE_CODE=000000
```

Start the app:

```sh
docker compose up -d --build
```

Open:

```text
http://localhost:10000
```

Use `INITIAL_INVITE_CODE` for the first registration. After that invite code is used, changing the value in `.env` will not create a new invite code automatically. Generate new invite codes from System Settings.

## Local Development

Requirements: Node.js 22+.

```sh
npm install
npm --prefix backend install
cp .env.example .env
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

Useful commands:

```sh
npm run dev              # Start frontend and backend
npm run build            # Build backend and frontend
npm run build:frontend   # Build frontend only
npm run build:backend    # Build backend only
npm run lint             # Run ESLint
```

## Back Up the Database Before Updating

Before updating, stop the service and back up the database. Vela uses SQLite in WAL mode, so the database may consist of multiple files.

For Docker deployment, the database is stored on the host at:

```text
./data/
```

For local development, the database is stored at:

```text
backend/db/
```

Back up these files:

```text
vela.db
vela.db-wal
vela.db-shm
```

The safest option is to stop the service and copy the whole directory:

```sh
docker compose down
cp -a ./data ./backup-data-$(date +%Y%m%d-%H%M%S)
```

On Windows PowerShell:

```powershell
docker compose down
Copy-Item -Recurse -Force .\data ".\backup-data-$(Get-Date -Format yyyyMMdd-HHmmss)"
```

For local development, replace `./data` with `./backend/db`.

## Update Procedure

Recommended Docker update flow:

```sh
docker compose down
cp -a ./data ./backup-data-$(date +%Y%m%d-%H%M%S)
git pull
docker compose up -d --build
docker compose logs -f --tail=100
```

After confirming that the site and login work correctly, keep a few recent backups and remove older backup directories as needed.

## Restore the Database

Stop the service first:

```sh
docker compose down
```

Copy the backup files back into the data directory:

```sh
cp -a ./backup-data-YYYYMMDD-HHMMSS/. ./data/
docker compose up -d
```

On Windows PowerShell:

```powershell
docker compose down
Copy-Item -Recurse -Force ".\backup-data-YYYYMMDD-HHMMSS\*" .\data\
docker compose up -d
```

When restoring, make sure `vela.db`, `vela.db-wal`, and `vela.db-shm` come from the same backup to avoid SQLite inconsistency.

## Security Notes

- Set `JWT_SECRET` to a long random string. Do not use the default value.
- Do not commit `.env`, database files, or backup directories.
- Changing `JWT_SECRET` invalidates existing login tokens and users will need to sign in again.
- Use HTTPS through a reverse proxy for public deployments.
- Back up `./data` or `backend/db` regularly, especially before updates, server migrations, or database changes.
- `INITIAL_INVITE_CODE` is only used during initial setup. After it is consumed, create new invite codes from System Settings.

## License

[MIT](./LICENSE) © 2026 Uzhi
