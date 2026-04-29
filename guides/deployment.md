# Deployment Guide

## Current Deployment Model

The capstone deployment uses Vercel for the frontend and a separately deployed FastAPI backend.

Current public URLs:

```text
Frontend: https://frontend-nine-taupe-kl5d1l29m1.vercel.app
Backend:  https://customer-report-agent-api.vercel.app
```

The frontend connects to the backend through:

```text
NEXT_PUBLIC_API_URL=https://customer-report-agent-api.vercel.app
```

## Frontend Deployment

Vercel project settings:

```text
Root directory: frontend
Build command: npm run build
Output: Next.js default
```

Required environment variable:

```text
NEXT_PUBLIC_API_URL
```

The API client in `frontend/lib/api.ts` reads `NEXT_PUBLIC_API_URL` and falls back to `http://localhost:8010` for local development.

## Backend Deployment

The backend is a FastAPI app under `backend/api`.

Local command:

```bash
uv run --project backend/api python backend/api/main.py
```

Docker command:

```bash
docker compose up --build
```

Backend endpoints:

- `GET /health`
- `GET /api/summary`
- `GET /api/complaints`
- `GET /api/export.csv`
- `POST /api/chat`

For production, configure CORS so the backend accepts the deployed frontend origin:

```text
CORS_ORIGINS=https://frontend-nine-taupe-kl5d1l29m1.vercel.app
```

## GitHub Actions

### CI

`.github/workflows/ci-cd.yml` runs on push and pull request. It installs frontend dependencies, builds the Next.js app, installs backend dependencies, checks Python syntax, and runs backend unit tests.

### Vercel Production

`.github/workflows/vercel-production.yml` deploys the frontend to Vercel on pushes to `main` that touch the frontend or workflow file. It uses explicit Vercel IDs, so it does not depend on a committed `.vercel` directory.

Required GitHub Actions secrets:

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
NEXT_PUBLIC_API_URL
```

Optional external MCP adapter secrets:

```text
CRM_LOOKUP_WEBHOOK_URL
TICKETING_WEBHOOK_URL
STATUS_PAGE_URL
SLACK_WEBHOOK_URL
CUSTOMER_EMAIL_WEBHOOK_URL
```

When these are absent, the external MCP tools return a safe "not configured" message for demos instead of failing the app.

Where to add them:

```text
GitHub repo -> Settings -> Secrets and variables -> Actions -> New repository secret
```

Where to find them:

- `VERCEL_TOKEN`: Vercel account settings -> Tokens
- `VERCEL_ORG_ID`: Vercel project settings or local `.vercel/project.json` after `vercel link`
- `VERCEL_PROJECT_ID`: Vercel project settings or local `.vercel/project.json` after `vercel link`
- `NEXT_PUBLIC_API_URL`: deployed backend URL

Do not commit `.vercel`. It is local project metadata and should stay ignored.

## Why The Vercel Fix Matters

This error:

```text
Could not retrieve Project Settings. To link your Project, remove the `.vercel` directory and deploy again.
```

usually means GitHub Actions is relying on stale Vercel project metadata. The workflow avoids that by reading `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` from GitHub Secrets.

## Production Hardening Path

- move the backend MCP service to AWS ECS, Lambda, or EC2
- store complaints in a database instead of static JSON
- add authentication for support managers
- add request/tool-call metrics
- add API error alerts
- add a CSV upload/import flow
- add environment-specific frontend/backend URLs
