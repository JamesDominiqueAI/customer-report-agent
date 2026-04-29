# MCP Customer Report Agent

An MCP-powered customer report chatbot that turns raw customer complaints into instant summaries, urgent issue lists, sentiment snapshots, and manager-ready reports.

## Problem Statement

Support managers often receive raw complaint logs that are hard to scan quickly. They need a fast way to identify urgent cases, recurring issues, customer sentiment, and a concise report they can act on.

## Solution Overview

This app provides a simple chat and voice interface for asking operational questions about customer complaints. The backend routes each request to MCP-style tools that retrieve and summarize a static complaint dataset, then returns a clean markdown response for the manager.

## Demo Features

- Voice `Talk` input with transcript confirmation.
- Tool activity log showing selected MCP tool, dataset, and response time.
- Download latest manager report as Markdown.
- Search, sentiment filter, urgency filter, and clickable complaint detail view.
- CSV export for the filtered complaint list.
- Manager action plan tool with owners, SLA, and next steps.
- Backend-powered dashboard summary cards.

## Demo Prompts

- Summarize today's customer complaints.
- Show only urgent complaints.
- What are the top recurring customer issues?
- Generate a manager-ready customer support report.

## Architecture

```text
customer-report-agent/
  frontend/       Next.js Pages Router chat and voice UI
  backend/api/    FastAPI HTTP API
  backend/mcp/    MCP server and complaint tools
  data/           Static complaint dataset
  scripts/        Local runner
```

Request flow:

```text
User voice/text
  -> frontend/components/ChatBox.tsx
  -> backend/api/main.py POST /api/chat
  -> backend/mcp/tools.py
  -> data/complaints.json
  -> response with selected MCP tool
```

The app keeps the demo reliable by using deterministic MCP tools over a static JSON dataset. The required tools are implemented in `backend/mcp/tools.py` and exposed through `backend/mcp/server.py`:

- `get_all_complaints`
- `get_urgent_complaints`
- `summarize_issues`
- `generate_manager_report`
- `generate_action_plan`
- `analyze_sentiment`

## Run Locally

Terminal 1:

```bash
cd customer-report-agent
uv run --project backend/api python backend/api/main.py
```

Terminal 2:

```bash
cd customer-report-agent/frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8010 npm run dev
```

Open `http://localhost:3000`.

You can also start the backend with:

```bash
python scripts/run_local.py
```

## Deploy

For the live capstone demo, deploy the `frontend/` directory to Vercel and set:

```text
NEXT_PUBLIC_API_URL=https://your-backend-url
```

Deploy `backend/` as the API service. For the deadline, Vercel is the primary frontend deployment target. In production, the MCP service can run on AWS ECS, Lambda, or EC2 with a managed database and monitoring.

Current deployed URLs:

```text
Frontend: https://frontend-nine-taupe-kl5d1l29m1.vercel.app
Backend:  https://customer-report-agent-api.vercel.app
```

## Submission Links

- GitHub repo: `https://github.com/JamesDominiqueAI/customer-report-agent`
- Live Vercel URL: `https://frontend-nine-taupe-kl5d1l29m1.vercel.app`
- Video 1: `TODO`
- Video 2: `TODO`
- Video 3: `TODO`

See `SUBMISSION_CHECKLIST.md` for the final submission checklist.

## Video Scripts

### Video 1: What I Will Build

"I am building an MCP-powered Customer Report Agent Chatbot. The goal is to help support teams turn raw customer complaints into instant summaries and manager-ready reports. The app will use MCP tools to retrieve complaints, identify urgent cases, summarize recurring issues, and generate a report. I will deploy the frontend on Vercel for speed, and I can describe AWS as the production path."

### Video 2: Midway Progress

"At this stage, the project structure is ready, the complaint dataset is prepared, and the MCP server exposes the core tools. The UI is connected to the backend, and I am now polishing the final agent response and preparing deployment."

### Video 3: Final Demo

"This is the final MCP Customer Report Agent Chatbot. A user can ask for urgent complaints, recurring issues, or a manager-ready summary. Behind the scenes, the app uses MCP tools to retrieve and process complaint data, then returns a business-friendly report. The code is on GitHub and the app is deployed on Vercel."

## Production Extension

For a production build, add authentication, store complaints in a database, and deploy the backend components on AWS while keeping the Next.js frontend on Vercel.

## Future Improvements

- Replace the static JSON file with a database.
- Add authentication for support managers.
- Add CSV upload for new complaint batches.
- Add observability around MCP tool calls.
- Add deployment automation for the backend service.
