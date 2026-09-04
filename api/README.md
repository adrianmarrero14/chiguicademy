# API (NestJS)

Backend service for Chiguicademy.

## Stack

- NestJS 12 (TypeScript, ESM, Node 24)
- PostgreSQL 18 via Prisma 7 (pg driver adapter)
- Redis 7 via BullMQ (queues) and ioredis
- MinIO / S3 via AWS SDK v3
- Swagger (OpenAPI) at `/docs/api`
- Vitest, oxlint, Prettier

## Processes

| Entry | Role | Compose service |
|---|---|---|
| `src/main.ts` | HTTP API on port 3001, global prefix `/api` | `api` |
| `src/worker.ts` | BullMQ processors and scheduled tasks | `worker` |

Both share the same modules; see `../CLAUDE.md` for the architecture and conventions.

## Run from Monorepo Root

```bash
make up
make logs-api
make nest c="g module courses"
make migrate n="add_courses"
make typecheck && make lint && make test
```

## Run without Docker (optional)

Needs local PostgreSQL and Redis. Point `DATABASE_URL` and `REDIS_HOST` at them in `.env`.

```bash
npm install            # also runs `prisma generate`
npm run start:dev      # HTTP
npm run start:worker:dev
```

## Main URLs (through nginx)

- Liveness: `http://localhost:8080/api/health/live`
- Readiness: `http://localhost:8080/api/health/ready`
- Swagger UI: `http://localhost:8080/docs/api`

## Environment

- Local file: `api/.env` (copied from `api/.env.example` by `make init`)
- All variables are validated at startup by `src/config/env.ts`; the app refuses to boot with an invalid config.

## Database migrations

```bash
make migrate n="describe_change"   # dev: create + apply + regenerate client
make migrate-deploy                # CI/prod: apply pending migrations
make migrate-reset                 # drop and recreate (local only)
```

## Production image

`docker/api/Dockerfile` target `prod` builds a small image with compiled `dist/`.
Run `node dist/main.js` for HTTP and `node dist/worker.js` for the worker.
Apply migrations before starting: `npx prisma migrate deploy`.
