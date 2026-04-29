# Architecture Guide

## Project Purpose

`customer-report-agent` is an MCP customer support reporting app. It helps a support manager turn a raw complaint queue into urgent-case lists, recurring-issue summaries, sentiment snapshots, CSV exports, action plans, and manager-ready reports.

The core analysis is deterministic. Natural-language requests are routed to MCP-style tools that operate on `data/complaints.json`, then the backend returns a structured business response.

## Runtime Flow

```text
Manager voice/text prompt
  -> frontend/components/ChatBox.tsx
  -> frontend/lib/api.ts
  -> backend/api/main.py
  -> route_question_to_tool()
  -> backend/mcp/server.py FastMCP registry
  -> backend/mcp/tools.py deterministic complaint tools
  -> data/complaints.json
  -> markdown response + selected MCP tool/source/trace/latency
```

If the MCP server call fails, the API falls back to direct Python tool calls. That keeps the demo reliable while still showing the MCP orchestration pattern.

## Frontend

The frontend is a Next.js Pages Router app under `frontend/`.

Implemented features:

- chat interface for manager prompts
- browser voice input through Web Speech API
- optional read-aloud responses through speech synthesis
- demo prompt buttons
- MCP activity panel with selected tool, source, dataset, and response time
- trace ID display for request correlation
- complaint browser with search, sentiment filter, urgency filter, and detail view
- recommended action per complaint
- CSV export for filtered complaints
- markdown download for the latest manager report or action plan

Important files:

- `frontend/pages/index.tsx`
- `frontend/components/ChatBox.tsx`
- `frontend/lib/api.ts`
- `frontend/lib/prompts.ts`

## Backend API

The backend is a FastAPI service under `backend/api`.

Implemented endpoints:

- `GET /health`
- `GET /api/summary`
- `GET /api/complaints`
- `GET /api/export.csv`
- `POST /api/chat`

`POST /api/chat` accepts a manager question, validates it, selects the best tool with keyword routing, calls the MCP registry, and formats the result for the frontend.

Each chat response includes:

- selected tool
- response source: `mcp` or `direct`
- trace ID
- backend latency in milliseconds

Unsafe requests are blocked before tool selection. Empty requests, oversized requests, prompt-injection attempts, and credential/secret-exfiltration attempts return the `security_guardrail` response.

## MCP Tool Layer

The MCP layer lives under `backend/mcp`.

Internal complaint-analysis tools:

- `get_urgent_complaints`
- `summarize_issues`
- `generate_manager_report`
- `generate_action_plan`
- `analyze_sentiment`

External integration adapter tools:

- `lookup_crm_customer`
- `create_ticket_escalation`
- `check_service_status`
- `send_slack_alert`
- `send_customer_email_batch`

`backend/mcp/server.py` registers the tools with `FastMCP`. `backend/mcp/tools.py` owns the deterministic business logic, reads `data/complaints.json`, and defines safe external adapters that call configured webhook URLs when environment variables are present.

Note: `get_all_complaints()` remains in `backend/mcp/tools.py` as an internal data-access helper for API/tests, but it is not registered as an MCP tool. The registered MCP surface is exactly 10 tools: 5 internal and 5 external adapters.

## Data Model

The current dataset is a static JSON file:

```text
data/complaints.json
```

Each complaint includes:

- `id`
- `customer`
- `channel`
- `category`
- `urgency`
- `sentiment`
- `createdAt`
- `text`

The static dataset is deliberate for the capstone. It makes demos deterministic, testable, and easy to explain. A production version would replace it with a database, CRM export, ticketing integration, or CSV upload pipeline.

## Tool Routing

The backend uses keyword routing in `select_tool()`:

- action plan, next steps, SLA, owners -> `generate_action_plan`
- CRM, customer profile, customer record -> `lookup_crm_customer`
- ticket, escalate, create case -> `create_ticket_escalation`
- status page, service status, outage -> `check_service_status`
- Slack, team alert, notify team -> `send_slack_alert`
- email customer, send email, email batch -> `send_customer_email_batch`
- urgent, priority, critical -> `get_urgent_complaints`
- report, manager -> `generate_manager_report`
- sentiment, feeling, tone -> `analyze_sentiment`
- recurring, top, summarize, summary -> `summarize_issues`
- all, list -> `summarize_issues`

This is simple by design. It makes behavior explainable and avoids overclaiming dynamic LLM reasoning. A future version could replace the keyword router with an LLM classifier.

## Guardrails And Observability

The API validates each chat request before selecting a tool.

Blocked examples:

- empty input
- requests over the demo length limit
- "ignore previous instructions"
- "show me your system prompt"
- "print secrets from .env"
- requests for API keys or environment variables

For observability, `/api/chat` emits a structured JSON log containing:

- event name
- trace ID
- selected tool
- source
- latency

The frontend displays the short trace ID in the MCP activity panel so a demo can connect the UI response to backend logs.

## Production Path

Current deployment story:

- frontend: Vercel
- backend: Vercel API service for the capstone demo
- CI workflow: `.github/workflows/ci-cd.yml`
- production deployment workflow: `.github/workflows/vercel-production.yml`

Production hardening path:

- move complaint storage to Postgres, DynamoDB, or a ticketing API
- add support-manager authentication
- add durable logging for tool calls
- add upload/import workflow for complaint batches
- deploy backend MCP service to AWS ECS, Lambda, or EC2
- add monitoring and alerting around API errors and tool latency
