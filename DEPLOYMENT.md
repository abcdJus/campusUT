# Deploying CampusTalk

## Recommended Production Setup

Use Netlify for the Next.js frontend, then deploy the API and database separately:

- Frontend: Netlify, from `apps/web`
- Express API: Render, Railway, Fly.io, or another Node host
- Python API: Render, Railway, Fly.io, or another Python host
- PostgreSQL: Neon, Supabase, Railway, Render, or a self-managed Postgres instance

Netlify can run the Next.js app, including server-rendered pages, but this repository currently has a separate long-running Express API and a separate Python FastAPI service. Those should not be treated as static frontend assets.

## Netlify Settings

The root `netlify.toml` already sets:

```toml
[build]
  command = "npm run build --workspace apps/web"
  publish = "apps/web/.next"
```

When creating the site in Netlify:

1. Push this folder to GitHub.
2. In Netlify, choose **Add new project** and import the GitHub repo.
3. Keep the base directory as the repository root.
4. Let Netlify use the build command and publish directory from `netlify.toml`.
5. Set the site name to:

   ```text
   campusut
   ```

   If the name is available, the production URL will be:

   ```text
   https://campusut.netlify.app
   ```

   Netlify site names are global, so if `campusut` is already taken, choose a close variant such as `campus-ut`, `campusut-app`, or `campusut-community`.

6. Add these environment variables in Netlify:

   ```text
   NEXT_PUBLIC_API_BASE_URL=https://your-api-host.example.com
   NETLIFY_NEXT_SKEW_PROTECTION=true
   ```

If you deploy only the frontend first, the app will still render with seed data, but login and post creation need a deployed API.

## Backend Settings

Deploy `apps/api` to a Node host with:

```bash
npm install
npm --workspace apps/api run build
npm --workspace apps/api run start
```

Environment variables for the API:

```text
PORT=4000
DATABASE_URL=postgresql://...
JWT_SECRET=replace-with-a-long-random-secret
```

Apply the Postgres schema before using the API:

```bash
psql "%DATABASE_URL%" -f db/migrations/001_init.sql
```

Deploy `services/python-api` separately if you want the Python course/recommendation endpoints online:

```bash
python -m pip install -r services/python-api/requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001
```

## Fast Static-Only Option

If you only want to publish the old frontend quickly, Netlify can also host the legacy static files by dragging the current folder into Netlify Drop. That version will be frontend-only and will keep using browser storage, so it is not the real rebuild.
