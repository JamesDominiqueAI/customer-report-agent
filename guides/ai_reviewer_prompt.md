# AI Reviewer Prompt

Use this prompt when you want another AI system to evaluate the project.

```text
You are a senior software engineer and capstone project evaluator. Evaluate this GitHub project as if you were reviewing it for a technical portfolio, internship, junior developer role, or AI engineering capstone.

Project name:
MCP Customer Report Agent

Project summary:
This is an MCP-powered customer support reporting app. It turns a static dataset of customer complaints into urgent complaint lists, recurring issue summaries, sentiment snapshots, manager action plans, CSV exports, and manager-ready reports. The backend registers 5 internal MCP tools for complaint analysis and 5 external MCP adapter tools for CRM lookup, ticket escalation, service status checks, Slack alerts, and customer email batches. The frontend is a Next.js Pages Router app with chat, voice input, read-aloud responses, demo prompts, complaint filters, a detail view, CSV export, and report download. The backend is FastAPI and routes natural-language manager questions to MCP-style tools registered with FastMCP. The core analysis is deterministic and uses data/complaints.json, which makes the demo reliable and testable. If an external integration URL is not configured, the adapter returns a safe not-configured response instead of crashing.

Architecture to evaluate:
- Frontend: Next.js, React, TypeScript
- Backend: FastAPI, Pydantic, Python
- MCP layer: FastMCP server and deterministic complaint tools
- Data: static JSON complaint dataset
- Deployment: Vercel frontend, separate FastAPI backend, GitHub Actions CI and Vercel production workflow
- Tests: backend unit tests for MCP tools/API behavior

Important files:
- README.md
- PROJECT_PRESENTATION.md
- guides/architecture.md
- guides/deployment.md
- guides/video_scripts.md
- backend/api/main.py
- backend/mcp/tools.py
- backend/mcp/server.py
- frontend/components/ChatBox.tsx
- frontend/lib/api.ts
- data/complaints.json
- .github/workflows/ci-cd.yml
- .github/workflows/vercel-production.yml

Please evaluate:
1. Problem selection and scope
2. Architecture and technical decisions
3. MCP/tool design quality
4. Frontend user experience
5. Backend API quality
6. Deployment and CI/CD readiness
7. Testing and reliability
8. Documentation and presentation quality
9. Production readiness
10. What would make the project stronger

Give:
- an overall score out of 100
- category scores
- the strongest parts of the project
- the weakest or riskiest parts of the project
- specific improvements that would most increase the score
- interview talking points I should emphasize
- a short paragraph I can use to describe the project in a portfolio

Be honest and concrete. Do not only praise it. Point out gaps such as static data, simple keyword routing, no authentication, limited observability, and the fact that the backend deployment is still simpler than a full production architecture. Also recognize that deterministic tools and MCP fallback make the demo reliable and explainable.
```
