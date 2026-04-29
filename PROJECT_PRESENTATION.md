# MCP Customer Report Agent Presentation

## One-Sentence Pitch

This project is an MCP-powered chatbot that turns raw customer complaints into instant summaries, urgent issue lists, and manager-ready reports.

## Problem

Support teams often receive raw complaint data in a form that is too slow for managers to review manually. Urgent cases and recurring issues can be missed when the queue grows.

## Solution

The app provides a chat and voice interface where a manager can ask for summaries, urgent cases, recurring issues, sentiment, or a manager-ready support report.

## Architecture

```text
User voice/text
  -> Next.js frontend
  -> FastAPI backend
  -> MCP complaint tools
  -> data/complaints.json
  -> formatted response with selected MCP tool
```

## MCP Tools

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

## Demo Flow

1. Open the deployed app.
2. Ask: "Summarize today's customer complaints."
3. Ask: "Show only urgent complaints."
4. Use the `Talk` button and say: "Generate a manager-ready customer support report."
5. Point out the MCP tool label shown with each assistant response.

## Deployment Story

The frontend is designed for Vercel. The backend can run as a separate service using the included Dockerfile. For production, the backend MCP service could move to AWS ECS, Lambda, or EC2 with a managed database and monitoring.
