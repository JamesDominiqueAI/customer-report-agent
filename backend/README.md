# Backend

FastAPI service that routes chat prompts to MCP-backed complaint tools.

## Run

```bash
cd backend/api
uv run main.py
```

The API runs on `http://127.0.0.1:8010`.

## Endpoints

- `GET /health`
- `POST /api/chat`

The chat endpoint returns the selected MCP tool name and formatted response.
