# Chiguicademy

Monorepo for an online learning platform: a NestJS API (HTTP + background worker) and a Next.js frontend, orchestrated with Docker Compose.

Repository: `https://github.com/adrianmarrero14/chiguicademy`

## Current Status

Foundation stage:

- Dockerized infrastructure is ready (API, worker, nginx, PostgreSQL, Redis, MinIO, Mailpit)
- NestJS API boots with validated config, Prisma, BullMQ, health checks and Swagger
- Next.js app is scaffolded with the App Router
- Domain features (courses, enrollment, dashboards, AI add-ons) are not implemented yet

## Technology Stack

| Component | Technology |
|-----------|------------|
| API | NestJS 12 + TypeScript (ESM, Node 24) |
| ORM / Migrations | Prisma 7 |
| Frontend | Next.js 16 + React 19 + TypeScript + Tailwind |
| Database | PostgreSQL 18 |
| Queues / Cache | Redis 7 + BullMQ |
| Storage | MinIO locally, S3-compatible in the cloud |
| Reverse Proxy | Nginx |
| Local Mail | Mailpit |

## Monorepo Structure

```text
chiguicademy/
├── api/                 # NestJS app: src/main.ts (HTTP) + src/worker.ts (queues)
├── frontend/            # Next.js app
├── docker/              # Dockerfiles (api, node) + nginx config
├── docker-compose.yml   # Local services orchestration
├── Makefile             # Main developer commands (`make help`)
├── CLAUDE.md            # Architecture and conventions (for people and AI agents)
├── .env.example         # Template for infra credentials used by Compose
└── README.md
```

## Requirements

- Docker Engine with the Compose plugin (`docker compose`)
- GNU Make

On Windows use WSL2 and keep the project inside the Linux filesystem.

```bash
docker --version
docker compose version
make --version
```

## Quick Start

```bash
git clone https://github.com/adrianmarrero14/chiguicademy.git
cd chiguicademy
make init
```

`make init` is safe to rerun. It creates the env files from their templates, builds the images, starts every service, waits for the API to be healthy and applies database migrations.

## Environment Files

| File | Template | Used by |
|------|----------|---------|
| `.env` | `.env.example` | Docker Compose (database, MinIO and pgAdmin credentials) |
| `api/.env` | `api/.env.example` | NestJS API and worker (validated at startup) |
| `frontend/.env.local` | `frontend/.env.local.example` | Next.js (`NEXT_PUBLIC_API_URL`) |

Keep `DATABASE_URL` and `S3_*` in `api/.env` consistent with the root `.env`.

## Services and URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API base | http://localhost:8080/api |
| API readiness | http://localhost:8080/api/health/ready |
| API docs (Swagger) | http://localhost:8080/docs/api |
| Mailpit | http://localhost:8025 |
| MinIO Console | http://localhost:9001 |
| pgAdmin (`--profile tools`) | http://localhost:5050 |

## Day-to-Day Commands

```bash
make help              # list every command
make up / make down    # start / stop
make logs-api          # API logs (also: logs-worker, logs-frontend)
make ps                # container status

make nest c="g module courses"     # Nest CLI generators
make migrate n="add_courses"       # Prisma migration from schema changes
make typecheck && make lint && make test
make test-e2e                      # needs running services
make npm c="run lint"              # npm inside the frontend container
```

## Verification Before Committing

From the repo root with services running:

```bash
make typecheck && make lint && make test
```

## Git and Workflow

Single Git repository at the root. Recommended commit scopes:

- `feat(api): ...`
- `feat(frontend): ...`
- `chore(infra): ...`
- `docs: ...`

## Troubleshooting

### API container restarts or stays unhealthy

```bash
make logs-api
```

An invalid `api/.env` aborts startup with a list of the offending variables.

### Frontend hot reload is slow or inconsistent

`docker-compose.yml` enables `WATCHPACK_POLLING` and `CHOKIDAR_USEPOLLING`. If it still lags, `make restart`.

### Reset the database

```bash
make migrate-reset
```

### Start from scratch

```bash
make destroy && make init
```

## Service-Specific Docs

- Architecture and conventions: `CLAUDE.md`
- Backend details: `api/README.md`
- Frontend details: `frontend/README.md`

## License

MIT
