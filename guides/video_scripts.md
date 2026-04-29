# Video Scripts

## Video 1: What I Will Build

Show:

- project title
- problem statement
- target user
- architecture sketch
- planned deployment target

Script:

"I am building an MCP-powered Customer Report Agent. The problem is that support managers often receive raw complaint queues that are hard to scan quickly. The app will let a manager ask natural-language or voice questions such as 'show urgent complaints' or 'generate a manager report.' Behind the scenes, the backend routes those requests to MCP-style tools that read a complaint dataset, summarize issues, identify urgent cases, analyze sentiment, and return a business-ready response. The frontend will run on Vercel, and the backend will run as a separate FastAPI service."

## Video 2: Midway Progress

Show:

- repo structure
- `data/complaints.json`
- `backend/mcp/tools.py`
- `backend/api/main.py`
- frontend chat screen
- GitHub Actions files

Script:

"At this stage, the core project structure is implemented. The complaint dataset is stored in JSON, the MCP tool layer exposes functions for urgent complaints, issue summaries, sentiment analysis, manager reports, and action plans, and the FastAPI backend routes chat requests to the correct tool. The frontend is connected to the API and includes chat, demo prompts, voice input, tool activity, complaint filters, CSV export, and report download. I am now polishing the deployment workflow and documentation so the project feels like a real capstone rather than a local-only prototype."

## Video 3: Final Demo

Show:

- live Vercel frontend
- dashboard summary cards
- complaint browser filters
- chat prompt buttons
- voice `Talk` button
- MCP activity panel
- downloaded report
- GitHub repository and green deployment

Script:

"This is the final MCP Customer Report Agent. A support manager can open the deployed app and ask for urgent complaints, recurring issues, sentiment, an action plan, or a manager-ready report. I can also use the Talk button to send a voice request. Each response shows which MCP tool was selected and whether the answer came through MCP or the direct fallback path. The complaint browser lets me search, filter by sentiment or urgency, inspect recommended actions, and export a CSV. The project includes a FastAPI backend, deterministic MCP tools, a Next.js frontend, tests, Docker support, deployment documentation, and GitHub Actions for CI and production deployment."

## Short Demo Prompt Sequence

Use these prompts during the final walkthrough:

```text
Summarize today's customer complaints.
Show only urgent complaints.
What are the top recurring customer issues?
Analyze customer sentiment.
Generate a manager action plan.
Look up urgent customers in the CRM.
Create an escalation ticket for urgent complaints.
Check the external service status.
Send a Slack team alert.
Email customers about urgent complaints.
Generate a manager-ready customer support report.
```
