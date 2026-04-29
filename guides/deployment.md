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

## AWS Production Story

For this deadline, deploy the frontend on Vercel to reduce friction and prove the product end to end. In production, the MCP service could run on AWS ECS, Lambda, or EC2, with a managed database and monitoring.
