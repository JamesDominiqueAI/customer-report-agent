from __future__ import annotations

import os
import sys
import json
from csv import DictWriter
from io import StringIO
from pathlib import Path
from typing import Any, Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from backend.mcp import tools  # noqa: E402
from backend.mcp.server import mcp as mcp_server  # noqa: E402


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    tool: Literal[
        "get_all_complaints",
        "get_urgent_complaints",
        "summarize_issues",
        "generate_manager_report",
        "generate_action_plan",
        "analyze_sentiment",
    ]
    response: str
    source: Literal["mcp", "direct"] = "direct"


app = FastAPI(title="MCP Customer Report Agent API")

cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def select_tool(question: str) -> Literal[
    "get_all_complaints",
    "get_urgent_complaints",
    "summarize_issues",
    "generate_manager_report",
    "generate_action_plan",
    "analyze_sentiment",
]:
    normalized = question.lower()

    if any(term in normalized for term in ["action plan", "next steps", "sla", "owners"]):
        return "generate_action_plan"

    if any(term in normalized for term in ["urgent", "priority", "critical"]):
        return "get_urgent_complaints"

    if any(term in normalized for term in ["report", "manager"]):
        return "generate_manager_report"

    if any(term in normalized for term in ["sentiment", "feeling", "tone"]):
        return "analyze_sentiment"

    if any(term in normalized for term in ["recurring", "top", "summarize", "summary"]):
        return "summarize_issues"

    if any(term in normalized for term in ["all", "list"]):
        return "get_all_complaints"

    return "generate_manager_report"


def format_tool_response(tool_name: str, result: Any, source: Literal["mcp", "direct"]) -> ChatResponse:
    if tool_name == "get_urgent_complaints":
        urgent_lines = "\n".join(
            f"- {item['id']}: {item['customer']} - {item['category']} - {item['text']}"
            for item in result
        )
        return ChatResponse(
            tool="get_urgent_complaints",
            source=source,
            response="\n".join(
                [
                    "## Urgent Complaints",
                    f"{len(result)} complaints need high-priority attention.",
                    "",
                    urgent_lines,
                ]
            ),
        )

    if tool_name == "get_all_complaints":
        return ChatResponse(
            tool="get_all_complaints",
            source=source,
            response="\n".join(
                [
                    "## All Complaints",
                    *[
                        f"- {item['id']}: {item['customer']} - {item['urgency']} - {item['category']}"
                        for item in result
                    ],
                ]
            ),
        )

    return ChatResponse(tool=tool_name, source=source, response=str(result))


def call_direct_tool(tool_name: str) -> Any:
    return getattr(tools, tool_name)()


async def call_mcp_tool(tool_name: str) -> Any:
    result = await mcp_server.call_tool(tool_name, {})
    if isinstance(result, dict):
        return result.get("result", result)
    if isinstance(result, list):
        text_parts = [
            content.text
            for content in result
            if getattr(content, "type", None) == "text"
        ]
        if tool_name in {"get_all_complaints", "get_urgent_complaints"}:
            return [json.loads(text) for text in text_parts]
        return "\n".join(text_parts)
    return result


async def route_question_to_tool(question: str) -> ChatResponse:
    tool_name = select_tool(question)

    try:
        result = await call_mcp_tool(tool_name)
        return format_tool_response(tool_name, result, "mcp")
    except Exception:
        result = call_direct_tool(tool_name)
        return format_tool_response(tool_name, result, "direct")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/summary")
def summary():
    return tools.get_complaint_summary()


@app.get("/api/complaints")
def complaints(sentiment: str = "all", urgency: str = "all", query: str = ""):
    results = tools.search_complaints(sentiment=sentiment, urgency=urgency, query=query)
    return [
        {
            **complaint,
            "recommendedAction": tools.get_recommended_action(complaint),
        }
        for complaint in results
    ]


@app.get("/api/export.csv", response_class=PlainTextResponse)
def export_csv(sentiment: str = "all", urgency: str = "all", query: str = ""):
    results = tools.search_complaints(sentiment=sentiment, urgency=urgency, query=query)
    output = StringIO()
    writer = DictWriter(
        output,
        fieldnames=["id", "customer", "channel", "category", "urgency", "sentiment", "createdAt", "text"],
    )
    writer.writeheader()
    writer.writerows(results)
    return PlainTextResponse(output.getvalue(), media_type="text/csv")


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    return await route_question_to_tool(request.message.strip())


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=os.getenv("BACKEND_HOST", "127.0.0.1"),
        port=int(os.getenv("BACKEND_PORT", "8010")),
        reload=True,
    )
