# Deployment Guide

## Recommended Capstone Deployment

Use Vercel for the frontend demo.

Frontend settings:

- Root directory: `frontend`
- Build command: `npm run build`
- Output: Next.js default
- Environment variable: `NEXT_PUBLIC_API_URL`

```text
NEXT_PUBLIC_API_URL=https://your-backend-url
```

## Backend Deployment

The backend is a FastAPI service under `backend/api`.

Local command:

```bash
uv run --project backend/api python backend/api/main.py
```

Docker command:

```bash
docker compose up --build
```

Vercel backend command from the repo root:

```bash
vercel --yes --env CORS_ORIGINS=https://your-frontend-url
```

The repo root exports the FastAPI app through `app.py`.

Current deployed URLs:

```text
Frontend: https://frontend-nine-taupe-kl5d1l29m1.vercel.app
Backend:  https://customer-report-agent-api.vercel.app
```

## GitHub Production Check

The workflow in `.github/workflows/vercel-production.yml` deploys the frontend to Vercel on every push to `main` that changes the frontend. It also creates a GitHub `production` environment check with the deployed URL.

Required GitHub repository secret:

```text
VERCEL_TOKEN
```

Create the token in Vercel, then add it in GitHub:

```text
GitHub repo -> Settings -> Secrets and variables -> Actions -> New repository secret
```

The workflow uses the current Vercel frontend project IDs and builds from the `frontend/` directory.

## AWS Production Story

For this deadline, deploy the frontend on Vercel to reduce friction and prove the product end to end. In production, the MCP service could run on AWS ECS, Lambda, or EC2, with a managed database and monitoring.
