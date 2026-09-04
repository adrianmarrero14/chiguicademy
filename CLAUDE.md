# Chiguicademy

Online learning platform. Monorepo: `api/` (NestJS 12, TypeScript, ESM) + `frontend/` (Next.js 16) + `docker/`.
Everything runs through Docker Compose; use the root `Makefile` (`make help`).

## Commands (run from repo root)

| Task | Command |
|---|---|
| First setup | `make init` |
| Start / stop | `make up` / `make down` |
| API logs | `make logs-api`, `make logs-worker` |
| Generate Nest artifacts | `make nest c="g module courses"` |
| Schema change → migration | edit `api/prisma/schema.prisma`, then `make migrate n="add_courses"` |
| Verify API | `make typecheck && make lint && make test` |
| E2E (needs services) | `make test-e2e` |

Inside `api/` without Docker: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.

## API architecture (`api/src`)

```
main.ts               HTTP process (global prefix /api, Swagger at /docs/api)
worker.ts             Worker process (BullMQ processors + @nestjs/schedule)
app.module.ts         HTTP root: imports infrastructure + feature modules
worker.module.ts      Worker root: imports infrastructure + job modules
config/               env.ts (zod schema, single source of env), config.module.ts
infrastructure/       Technical modules, no business rules
  prisma/             PrismaService (Prisma 7 + pg adapter). The only DB entry point.
  redis/              REDIS_CLIENT token (ioredis) for cache/locks/health
  queue/              QueueModule (BullMQ root) + queue.constants.ts (queue and job names)
  storage/            StorageService (S3 SDK; MinIO locally, S3 in cloud)
modules/<feature>/    Business features exposed over HTTP
jobs/<queue>/         Background processors, one folder per queue
generated/prisma/     Generated Prisma client (gitignored, `prisma generate`)
```

### Feature module layout (`modules/<feature>/`)

```
<feature>.module.ts
<feature>.controller.ts      HTTP only: routing, DTO validation, status codes, Swagger decorators
<feature>.service.ts         Business rules; injects PrismaService and other services
dto/                         class-validator DTOs (create-x.dto.ts, update-x.dto.ts, x-query.dto.ts)
<feature>.controller.spec.ts / <feature>.service.spec.ts   Vitest unit tests next to the code
```

Rules:
- Controllers never call Prisma. Services own persistence and rules. Split a repository class out only when a service grows past a few queries.
- DTOs are classes with `class-validator` decorators. The global `ValidationPipe` uses `whitelist` + `forbidNonWhitelisted` + `transform`, so undeclared fields are rejected.
- Response shapes are explicit classes or interfaces; never return raw Prisma models that expose sensitive columns (e.g. `passwordHash`).
- Use Nest exceptions (`NotFoundException`, `ConflictException`, ...) for error paths.
- Feature modules import each other's modules and inject exported services; never import another feature's internals.

### Background jobs (`jobs/<queue>/`)

- Declare queue and job names in `infrastructure/queue/queue.constants.ts` with a typed data interface per job.
- Producer: inject `@InjectQueue(QUEUES.X)` in a service and call `queue.add(JOB_NAME, data)`.
- Processor: `@Processor(QUEUES.X) class XProcessor extends WorkerHost`, `switch (job.name)`. Register it in `jobs/<queue>/<queue>.module.ts` and import that module in `worker.module.ts`.
- Heavy media work (transcoding, transcription, dubbing) always goes through a queue, never inside an HTTP request.
- Scheduled tasks use `@Cron` from `@nestjs/schedule` and live in the worker.

### Configuration

- Add every env variable to `config/env.ts` (zod) and to `api/.env.example`. Never read `process.env` outside that file.
- Inject `ConfigService<Env, true>` and call `config.get('KEY', { infer: true })`.
- Infra credentials for Compose live in root `.env` (`.env.example`); keep them consistent with `api/.env`.

### Database

- Prisma 7: connection URL is in `api/prisma.config.ts`, not in `schema.prisma`.
- Models use `@map`/`@@map` to snake_case columns and plural table names. IDs are UUID strings.
- Every schema change ships with a migration (`make migrate n="..."`). Never edit applied migrations.

## Conventions

- ESM with `nodenext`: relative imports end in `.js` even for `.ts` sources. No path aliases.
- Formatting: Prettier (single quotes, trailing commas). Lint: oxlint. Tests: Vitest with globals (`describe`, `it`, `vi`).
- Filenames kebab-case with Nest suffixes: `courses.service.ts`, `create-course.dto.ts`, `media.processor.ts`.
- Commit scopes: `feat(api)`, `feat(frontend)`, `chore(infra)`, `docs`.
- Before finishing a task in `api/`: `npm run typecheck && npm run lint && npm test` must pass.

## Endpoints that already exist

- `GET /api/health/live` liveness, `GET /api/health/ready` checks Postgres + Redis.
- Swagger UI: `http://localhost:8080/docs/api` (behind nginx).
