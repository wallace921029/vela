# Vela

[English](./README.md) | [中文](./README.zh.md)

一个自部署的个人导航面板。把书签整理成可拖拽的分组，通过邀请码与家人或团队共享同一个实例，并随时切换语言与主题。

## 预览

![Dark Theme](./captures/dark_theme.png)  
![Light Theme](./captures/light_theme.png)  
![Invite Code](./captures/invite_code.png)  
![Quick Notes](./captures/quick_notes.png)  
![Keepscreenon](./captures/keepscreenon.png)  

## 功能特性

- **邀请码注册** — 默认关闭注册入口，仅持有有效邀请码的用户可以加入
- **拖拽式导航管理** — 基于 `@dnd-kit` 重排分组与链接，乐观更新并同步到 SQLite
- **浏览器书签导入** — 直接导入主流浏览器导出的 `bookmarks.html`
- **多用户与角色权限** — `ADMIN` 角色拥有系统设置面板，可管理用户和邀请码
- **国际化** — 内置英文与简体中文（`react-i18next`）
- **主题切换** — 浅色 / 深色 / 跟随系统，由 `next-themes` 驱动
- **一键 Docker 部署** — 后端 + 前端 + 持久化 SQLite 卷

## 技术栈

| 层级 | 技术 |
| ---- | ---- |
| 前端 | React 19、Vite、TypeScript、Tailwind CSS v4、shadcn/ui、react-router 7 |
| 后端 | Fastify 5、`@fastify/jwt`、bcryptjs、better-sqlite3 |
| 存储 | SQLite（WAL 模式），数据落盘到宿主机 |
| 部署 | Docker Compose（Nginx 静态资源 + Node.js 后端） |

## Docker 快速开始

需要 Docker 24+ 并启用 Compose 插件。

```sh
git clone <repo-url> vela
cd vela
cp .env.example .env
# 修改 .env：将 JWT_SECRET 设置为一段长随机字符串（如 `openssl rand -base64 48`）
docker compose up -d --build
```

打开 <http://localhost:10000>，使用 `.env` 中 `INITIAL_INVITE_CODE` 配置的邀请码（默认 `000000`）注册第一个管理员账号。该邀请码被使用后，可在 **系统设置 → 邀请码** 页面继续生成新的邀请码。

SQLite 数据会持久化到宿主机的 `./data/` 目录，备份只需复制该目录。

## 本地开发

需要 Node.js 22+（LTS）。

```sh
npm install
npm --prefix backend install
cp .env.example .env        # 首次执行一次即可
./dev.sh                    # 或：npm run dev
```

- 前端：<http://localhost:5173>
- 后端：<http://localhost:3000>

Vite 会把 `/api/*` 代理到后端，前端始终使用相对路径调用接口。

### 常用脚本

| 命令                    | 作用                          |
| ----------------------- | ----------------------------- |
| `npm run dev`           | 同时启动前后端                |
| `npm run dev:frontend`  | 仅启动 Vite 开发服务器        |
| `npm run dev:backend`   | 仅启动 Fastify（`tsx watch`） |
| `npm run build`         | 先构建后端再打包前端          |
| `npm run lint`          | 对前端运行 ESLint             |
| `npm run preview`       | 本地预览已构建的前端          |

## 配置

所有运行时配置都集中在仓库根目录的 `.env` 文件里。

| 变量名 | 是否必填 | 说明 |
| ------ | -------- | ---- |
| `JWT_SECRET`          | 是 | 用于签发 JWT 的密钥，请使用长随机字符串 |
| `INITIAL_INVITE_CODE` | 否 | 首次启动时写入数据库的管理员邀请码，默认 `000000`，被使用后再修改无效 |

## 项目结构

```
vela/
├── src/                # React 前端
│   ├── pages/          # 路由页面（Auth、Dashboard、Account、SystemSettings、About）
│   ├── layouts/        # BaseLayout：顶栏、主题、语言、用户菜单
│   ├── components/     # 共享组件，含 shadcn/ui 基础组件
│   ├── contexts/       # AuthContext：localStorage 中的 token 与用户信息
│   ├── hooks/          # 数据 hooks（如 useNavData）
│   └── router/         # react-router 配置（懒加载路由）
├── backend/
│   └── app/
│       ├── main.ts     # Fastify 入口：CORS、JWT、插件、路由
│       ├── db.ts       # SQLite 初始化与建表
│       ├── plugins/    # authenticate 装饰器
│       └── router/     # auth.ts、admin.ts、nav.ts
├── docker-compose.yml
├── Dockerfile          # 前端镜像（Nginx 托管构建产物）
├── backend/Dockerfile  # 后端镜像（Node.js LTS）
└── nginx.conf          # 静态托管 + /api 反向代理
```

## 开源协议

[MIT](./LICENSE) © 2026 Uzhi
