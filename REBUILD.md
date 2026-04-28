# CampusTalk Rebuild

This repo now keeps the original static frontend as legacy reference files and adds a modern rebuild beside it.

## Target Architecture

- `apps/web`: Next.js + TypeScript frontend.
- `apps/api`: Node.js + Express + TypeScript API.
- `services/python-api`: Python FastAPI service for course search, recommendations, ranking, or data processing.
- `db/migrations`: PostgreSQL schema and seed data.
- `packages/shared`: Shared app types, board metadata, and seed data used by the web and API during local development.

## Current Feature Mapping

| Legacy feature | New home |
| --- | --- |
| `index.html` community feed | `apps/web/src/app/page.tsx` |
| board pages | `apps/web/src/app/boards/[board]/page.tsx` + `GET /api/posts` |
| write post | `apps/web/src/app/write/page.tsx` + `POST /api/posts` |
| login/signup | `apps/web/src/app/login/page.tsx` + `/api/auth/*` |
| course search | `apps/web/src/app/courses/page.tsx` + `/api/courses` + Python `/courses/search` |
| marketplace | `apps/web/src/app/market/page.tsx` + `/api/market-items` |
| timetable | `apps/web/src/app/timetable/page.tsx` + `courses`, `course_meetings`, `timetable_entries` tables |

## Local Setup

1. Install JavaScript dependencies:

   ```bash
   npm.cmd install
   ```

2. Copy environment values:

   ```bash
   copy .env.example .env
   ```

3. Start the Next app and Express API:

   ```bash
   npm.cmd run dev
   ```

4. Optional Python service:

   ```bash
   cd services/python-api
   python -m venv .venv
   .venv\Scripts\python -m pip install -r requirements.txt
   .venv\Scripts\python -m uvicorn app.main:app --reload --port 8001
   ```

## PostgreSQL

Create a database, set `DATABASE_URL`, then run:

```bash
psql "%DATABASE_URL%" -f db/migrations/001_init.sql
```

If `DATABASE_URL` is missing, the Express and Python services fall back to seed data so the frontend can still run.

## Suggested Next Steps

1. Add a real Postgres instance locally and apply `db/migrations/001_init.sql`.
2. Replace the legacy localStorage flows with API calls page by page.
3. Add protected routes and JWT refresh/session handling.
4. Add file upload storage for post attachments and marketplace photos.
5. Add tests for auth, post creation, board filtering, and course search.
