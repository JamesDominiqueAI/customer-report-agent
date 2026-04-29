# Architecture

This project follows the same broad architecture as `supplychain-ai`.

```text
customer-report-agent/
  frontend/       Next.js Pages Router UI
  backend/api/    FastAPI HTTP boundary
  backend/mcp/    MCP server and complaint tools
  data/           Static complaint dataset
  scripts/        Local runner
```

Request flow:

```text
Browser voice/text input
  -> frontend/components/ChatBox.tsx
  -> backend/api/main.py /api/chat
  -> backend/mcp/server.py FastMCP tool registry
  -> backend/mcp/tools.py
  -> data/complaints.json
  -> response with selected MCP tool
```
