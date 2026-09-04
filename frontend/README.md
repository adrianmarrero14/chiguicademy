# Frontend (Next.js)

Frontend service for Chiguicademy.

## Stack

- Next.js 16 (App Router, `src/app/`)
- React 19
- TypeScript
- Tailwind CSS 4
- axios, TanStack Query, Zustand (installed, not wired yet)

## Run from Monorepo Root

The container starts `npm run dev` on its own:

```bash
make up
make logs-frontend
make npm c="run lint"
```

## URL

- App: `http://localhost:3000`
- API (through nginx): `http://localhost:8080/api`

## Environment

- Template: `frontend/.env.local.example`
- Local file: `frontend/.env.local` (created by `make init`)
- Required value: `NEXT_PUBLIC_API_URL=http://localhost:8080`

The API allows credentialed requests from `http://localhost:3000` (see `CORS_ORIGINS` in `api/.env`).

## Current State

Scaffolded with the default App Router page. Auth flows, dashboard and course UI are the next steps.

## References

- Monorepo docs: `../README.md`
- Architecture and conventions: `../CLAUDE.md`
- Next.js docs: https://nextjs.org/docs
