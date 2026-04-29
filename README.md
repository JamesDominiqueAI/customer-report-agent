# MCP Customer Report Agent

An MCP-powered customer report chatbot that turns raw customer complaints into instant summaries, urgent issue lists, sentiment snapshots, and manager-ready reports.

## Problem Statement

Support managers often receive raw complaint logs that are hard to scan quickly. They need a fast way to identify urgent cases, recurring issues, customer sentiment, and a concise report they can act on.

## Solution Overview

This app provides a simple chat and voice interface for asking operational questions about customer complaints. The backend routes each request to MCP-style tools that retrieve and summarize a static complaint dataset, then returns a clean markdown response for the manager.

## Demo Features

- Voice `Talk` input with transcript confirmation.
- Tool activity log showing selected MCP tool, dataset, and response time.
- Trace ID and backend latency returned for each chat request.
- Download latest manager report as Markdown.
- Search, sentiment filter, urgency filter, and clickable complaint detail view.
- CSV export for the filtered complaint list.
- Manager action plan tool with owners, SLA, and next steps.
- Backend-powered dashboard summary cards.
- Prompt-injection and secret-exfiltration guardrails for unsafe requests.

## Demo Prompts

- Summarize today's customer complaints.
- Show only urgent complaints.
- What are the top recurring customer issues?
- Generate a manager-ready customer support report.
- Look up urgent customers in the CRM.
- Create an escalation ticket for urgent complaints.
- Check the external service status.
- Send a Slack team alert.
- Email customers about urgent complaints.

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
  -> request validation and guardrails
  -> deterministic tool selection
  -> backend/mcp/server.py FastMCP tool registry
  -> backend/mcp/tools.py
  -> data/complaints.json
  -> response with selected MCP tool, source, trace ID, and latency
```

The app keeps the demo reliable by using 5 internal MCP tools over a static JSON dataset and 5 external MCP adapter tools for production-style integrations. The tools are implemented in `backend/mcp/tools.py` and exposed through `backend/mcp/server.py`.

Internal MCP tools:

- `get_urgent_complaints`
- `summarize_issues`
- `generate_manager_report`
- `generate_action_plan`
- `analyze_sentiment`

External MCP adapter tools:

- `lookup_crm_customer`
- `create_ticket_escalation`
- `check_service_status`
- `send_slack_alert`
- `send_customer_email_batch`

The external adapters use optional webhook/status environment variables. If they are not configured, the tools return a safe not-configured response so the demo remains stable.

`get_all_complaints()` still exists as an internal helper for data access and tests, but it is not registered as an MCP tool.

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

GitHub production deployment checks are handled by `.github/workflows/vercel-production.yml`. The workflow reports the live Vercel frontend as the GitHub `production` environment so the repository shows a green production check.

## Assessment Evidence

- Success criteria: `guides/success_criteria.md`
- Prompt and routing iteration log: `guides/prompt_iteration_log.md`
- Rubric map: `guides/assessment_rubric_map.md`
- Evaluation results: `guides/evaluation_results.md`
- Architecture notes: `guides/architecture.md`
- Deployment notes: `guides/deployment.md`
- Video scripts: `guides/video_scripts.md`

## Production-Readiness Map

- Success criteria: core complaint flows, production behavior, safety, and verification commands are defined in `guides/success_criteria.md`.
- Edge cases: empty input, oversized input, prompt-injection attempts, missing external integrations, and adversarial secret requests are handled.
- Tests: backend unit tests cover complaint tools, routing, external adapter fallbacks, and guardrail behavior.
- Security: unsafe requests return `security_guardrail` before tool selection.
- Observability: `/api/chat` returns trace ID and latency, and emits structured backend logs.
- Deployment: frontend and backend are public, and GitHub Actions reports CI plus a production deployment status.
- Communication: video scripts and final presentation notes are in `guides/video_scripts.md`.

## Submission Links

- GitHub repo: `https://github.com/JamesDominiqueAI/customer-report-agent`
- Live Vercel URL: `https://frontend-nine-taupe-kl5d1l29m1.vercel.app`
- Video 1: `TODO`
- Video 2: `TODO`
- Video 3: `TODO`

See `SUBMISSION_CHECKLIST.md` for the final submission checklist.

## Video Scripts

Use `guides/video_scripts.md` for the current Video 1, Video 2, and Video 3 scripts. Those scripts match the implemented app, including success criteria, prompt/routing iteration, guardrails, tests, deployment, and final demo flow.

## Production Extension

For a production build, add authentication, store complaints in a database, and deploy the backend components on AWS while keeping the Next.js frontend on Vercel.

## Future Improvements

- Replace the static JSON file with a database.
- Add authentication for support managers.
- Add CSV upload for new complaint batches.
- Send trace events to LangSmith, Langfuse, or OpenTelemetry instead of stdout.
- Add deployment automation for the backend service.
