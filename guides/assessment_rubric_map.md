# Assessment Rubric Map

This file maps the Wakanda assessment criteria to concrete project evidence.

## Data Science And AI Quality

- Success criteria: `guides/success_criteria.md`
- Prompt/routing iteration: `guides/prompt_iteration_log.md`
- Edge cases: `backend/api/main.py` guardrails and `backend/tests/test_mcp_tools.py`
- Tests: `uv run python -m unittest discover backend/tests`
- Evaluation: `guides/evaluation_results.md` summarizes test results, manual demo checks, and conclusions.
- Security: unsafe requests return `security_guardrail` before tool selection; optional API key auth is available through `SUPPORT_MANAGER_API_KEY`.
- Observability: `/api/chat` returns `traceId` and `latencyMs`; backend emits structured JSON logs.

## Engineering And Production Quality

- Architecture: `guides/architecture.md`
- Tech choice: Next.js frontend, FastAPI backend, FastMCP tool layer, deterministic routing for reliability.
- Conversation flow: chat, voice input, read-aloud, prompt buttons, follow-up-friendly UI.
- MCP integration: tools are registered in `backend/mcp/server.py`; business logic lives in `backend/mcp/tools.py`.
- Code quality: tool logic, API routing, UI API client, and components are separated by responsibility.
- Deployment: public frontend and backend URLs are documented in README and `guides/deployment.md`.
- UI: chat, activity panel, filters, detail view, CSV export, report download, voice controls.

## Problem Solving And Communication

- Business understanding: support manager complaint triage and reporting.
- Approach articulation: `guides.md` and `guides/video_scripts.md`.
- Docs: README plus `guides/`.
- Obstacles/challenges: Vercel CLI team-token issue is documented in `guides/deployment.md`; production check now uses GitHub deployment status.
- Final presentation: `guides/video_scripts.md`.
- Improvement roadmap: README, `guides.md`, and `guides/deployment.md`.

## Current Gaps To Mention Honestly

- Full user identity/authentication is not implemented yet; the project includes optional API key protection for demo hardening.
- Observability is structured logs and trace IDs, not a hosted tracing dashboard.
- External adapters are webhook-ready but not connected to real CRM/ticketing/Slack/email systems.
- Static JSON data should become a database or support-system integration in production.
