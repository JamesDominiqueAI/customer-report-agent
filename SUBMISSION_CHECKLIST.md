# Submission Checklist

## Required Links

- GitHub repo URL: `TODO`
- Live Vercel URL: `TODO`
- Video 1, intro: `TODO`
- Video 2, midway progress: `TODO`
- Video 3, final demo: `TODO`

## Demo Prompts

Use these exact prompts:

1. "Summarize today's customer complaints."
2. "Show only urgent complaints."
3. "What are the top recurring customer issues?"
4. "Generate a manager-ready customer support report."

## Local Verification

Backend:

```bash
cd customer-report-agent
uv run --project backend/api python backend/api/main.py
```

Frontend:

```bash
cd customer-report-agent/frontend
NEXT_PUBLIC_API_URL=http://localhost:8010 npm run dev
```

Build:

```bash
cd customer-report-agent/frontend
npm run build
```

Backend API smoke test:

```bash
curl -s -X POST http://127.0.0.1:8010/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"Generate a manager-ready customer support report."}'
```

Expected result includes:

```json
{
  "tool": "generate_manager_report"
}
```

## README Checklist

- Project title
- Problem statement
- Solution overview
- MCP architecture
- Local setup
- Deployment notes
- Demo prompts
- Future improvements
