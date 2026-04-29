# MCP Customer Report Agent Capstone Plan

## Goal

Build a small **Customer Report Agent Chatbot** that is **structured around MCP tools**, pushed to **GitHub**, deployed with a **Vercel frontend**, and connected to a deployed **FastAPI backend**.

## One-Sentence Pitch

"This project is a customer support report chatbot that uses MCP-style tools to turn complaint data into summaries, urgent issue views, sentiment signals, and manager-ready reports."

## AWS Production Path

**AWS Amplify** is not the main target for this project anymore. The implemented capstone uses Vercel for the live frontend and a separate FastAPI backend service.

For interviews or future production hardening, AWS is still useful as the next-step story:

- ECS, Lambda, or EC2 can host the FastAPI/MCP backend
- a managed database can replace `data/complaints.json`
- CloudWatch can track API errors, latency, and tool-call failures
- Amplify could host the frontend, but it is optional, not required

Why it matters:

- It counts as a real AWS deployment
- It gives you a credible production path
- It strengthens your "production-ready" story

For this project, **Vercel is the main build target** because it is already implemented and lower risk.

## How To Connect To An MCP Server

There are **2 practical ways** to talk about MCP in this capstone.

### Option A: Real local MCP server

Your Python `server.py` runs as the MCP server and exposes tools like:

- `get_urgent_complaints`
- `summarize_issues`
- `generate_manager_report`
- `generate_action_plan`
- `analyze_sentiment`
- `lookup_crm_customer`
- `create_ticket_escalation`
- `check_service_status`
- `send_slack_alert`
- `send_customer_email_batch`

This is best for:

- showing MCP is real
- recording your video
- demonstrating the tool server is runnable

### Option B: FastAPI direct fallback in the deployed app

The deployed FastAPI backend first tries the MCP registry. If that call fails, it calls the **same Python tool logic directly**.

This is best for:

- reliable deployment
- faster setup
- fewer hosting problems

### Honest explanation to use

"The project is MCP-architected. The canonical tool server is implemented in Python with FastMCP tool decorators. The FastAPI backend routes chat requests through the MCP registry first, then falls back to direct Python tool calls so the live demo stays reliable."

That is the safest and strongest answer.

## What You Are Building

### User asks:

- "Summarize today's customer complaints."
- "Show only urgent complaints."
- "What are the top recurring issues?"
- "Generate a manager-ready report."
- "Analyze customer sentiment."

### App returns:

- complaint summary
- urgent complaint list
- recurring issue summary
- manager report
- sentiment overview
- manager action plan

## Required Deliverables

1. Public GitHub repo
2. Live Vercel URL
3. Deployed backend URL
4. GitHub Actions CI and production deployment check
5. Three videos:
   - what you will build
   - mid-progress
   - final demo
6. README with architecture and links

## Scoring Order

Finish these in this exact order:

1. App runs locally
2. GitHub repo public
3. Vercel live
4. GitHub Actions CI green
5. Vercel production deployment check green
6. MCP server visible and runnable
7. Guides and presentation match the actual implementation

## Stack

- Frontend: `Next.js`
- Backend: `FastAPI`
- Data: `complaints.json`
- MCP server: `Python FastMCP`
- AI: deterministic MCP-style tool routing, no OpenAI dependency in the current implementation
- Deploy: `Vercel frontend + separate FastAPI backend`
- CI/CD: `GitHub Actions`

## AI / Tool Plan

The implemented project does **not** depend on OpenAI. That is intentional for reliability.

The backend uses deterministic tool routing:

- manager asks a question
- FastAPI selects the best MCP tool
- FastMCP tool reads `data/complaints.json`
- backend returns markdown plus the selected tool name

Future optional improvement: add an LLM layer only to polish wording after deterministic tools produce the facts.

## Before You Start

Do this before the timer:

### 1. Check your tools

```powershell
node -v
npm -v
python --version
git --version
```

### 2. Check deployment URLs

The current GitHub production workflow reports the already-live Vercel frontend as the `production` environment. It does not require Vercel secrets in GitHub Actions.

### 3. Check deployed URLs

- Frontend: `https://frontend-nine-taupe-kl5d1l29m1.vercel.app`
- Backend: `https://customer-report-agent-api.vercel.app`

### 4. Open these tabs

- GitHub
- Vercel
- GitHub Actions
- deployed frontend/backend URLs

## 2-Hour Execution Plan

## Phase 1: Local App + GitHub

### 0:00-0:05

Create or extract the project and push immediately.

```powershell
tar -xzf customer-report-agent.tar.gz
cd customer-report-agent
git init
git add .
git commit -m "init: MCP Customer Report Agent"
git remote add origin https://github.com/YOUR_USERNAME/customer-report-agent.git
git branch -M main
git push -u origin main
```

### 0:05-0:20

Run locally with two terminals.

```powershell
uv run --project backend/api python backend/api/main.py
```

```powershell
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8010 npm run dev
```

Check:

- page loads
- prompt buttons appear
- sending a prompt returns a response

If broken, only fix:

- `backend/api/main.py`
- `backend/mcp/tools.py`
- `frontend/components/ChatBox.tsx`

### Video 1

Record now, not later.

Say:

"I am building an MCP customer report agent chatbot. It is structured around complaint-analysis tools, a FastAPI backend, and a Next.js frontend deployed on Vercel."

## Phase 2: MCP Tools And UI Polish

### 0:20-0:45

Time-box this. Do not exceed 25 minutes.

Verify the implemented workflow:

1. load complaint data from `data/complaints.json`
2. route prompt through `select_tool()`
3. call FastMCP tool registry
4. fall back to direct Python tool call if MCP fails
5. return clean markdown to the frontend

If something breaks, focus only on:

- `backend/api/main.py`
- `backend/mcp/server.py`
- `backend/mcp/tools.py`

## Phase 3: Vercel

### 0:45-1:00

This is your required live deployment.

Steps:

1. Import the repo in Vercel
2. Set root directory to `frontend`
3. Add `NEXT_PUBLIC_API_URL`
3. Deploy
4. Test the live URL

Update README with the Vercel URL.

## Phase 4: GitHub Actions CI

### 1:00-1:10

If the project already has CI, verify it is green.

If not, add simple CI for:

- install
- lint
- build

If lint fails:

```powershell
npm run lint
```

Fix only what blocks CI.

### Video 2

Show:

- GitHub Actions green
- Vercel live
- `backend/mcp/server.py` open in the editor

## Phase 5: Production Deployment Check

### 1:10-2:00

The project now uses GitHub Actions to create a green GitHub `production` deployment check pointing at the live Vercel frontend.

Then:

1. push to `main`
2. confirm `.github/workflows/ci-cd.yml` is green
3. confirm `.github/workflows/vercel-production.yml` creates a green `production` deployment
4. open the Vercel URL and test a prompt

If production deployment fails, check the GitHub Actions `deployments: write` permission and the live frontend URL in `.github/workflows/vercel-production.yml`.

## Phase 6: MCP Server Proof

### 2:00-2:10

Run the Python MCP server locally for your demo.

Example flow:

```powershell
python backend/mcp/server.py
```

Leave it running for the final video.

## Phase 7: Final Video

### 2:10-2:30

Show in this order:

1. GitHub repo
2. README with links
3. GitHub Actions green
4. MCP server terminal running
5. Vercel demo
6. production deployment check if green

Closing line:

"This MCP customer report agent is deployed from the same GitHub repository, with a runnable Python MCP server, a FastAPI backend, a Vercel frontend, and GitHub Actions tracking CI and production deployment."

## Demo Prompts

Use these:

1. "Summarize today's customer complaints."
2. "Show only urgent complaints."
3. "What are the top recurring customer issues?"
4. "Generate a manager-ready customer support report."
5. "Analyze customer sentiment."
6. "Generate a manager action plan."
7. "Look up urgent customers in the CRM."
8. "Create an escalation ticket for urgent complaints."
9. "Check the external service status."
10. "Send a Slack team alert."
11. "Email customers about urgent complaints."

## Tool List

Implemented internal MCP tools:

1. `get_urgent_complaints`
2. `summarize_issues`
3. `generate_manager_report`
4. `generate_action_plan`
5. `analyze_sentiment`

Implemented external MCP adapter tools:

1. `lookup_crm_customer`
2. `create_ticket_escalation`
3. `check_service_status`
4. `send_slack_alert`
5. `send_customer_email_batch`

## Time Rules

- If Vercel is not live, fix frontend deployment before adding extra scope.
- If CI is red, spend only a few minutes fixing it.
- If production deployment is red, keep the live Vercel link and document the GitHub secret or workflow issue.
- Do not add OpenAI unless the deterministic MCP workflow is already stable.

## Best Technical Story

Use this if someone asks how the architecture works:

"The project uses a Python FastMCP server as the canonical implementation of the complaint-analysis tools. The FastAPI backend routes manager questions to the MCP tool registry, and it has a direct Python fallback so the deployed app remains reliable. The Next.js frontend shows the selected MCP tool, response source, complaint filters, CSV export, and report download."

## Final Checklist

- local app works
- GitHub repo is public
- Vercel URL works
- backend URL works
- GitHub Actions is green
- production deployment check is green or documented
- MCP server runs locally
- 3 videos recorded
- README contains links and architecture
