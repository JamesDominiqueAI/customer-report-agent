from __future__ import annotations

import os
import sys
import json
import time
import uuid
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
        "security_guardrail",
        "get_urgent_complaints",
        "summarize_issues",
        "generate_manager_report",
        "generate_action_plan",
        "analyze_sentiment",
        "lookup_crm_customer",
        "create_ticket_escalation",
        "check_service_status",
        "send_slack_alert",
        "send_customer_email_batch",
    ]
    response: str
    source: Literal["mcp", "direct"] = "direct"
    traceId: str | None = None
    latencyMs: int | None = None


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


MAX_MESSAGE_CHARS = 600
BLOCKED_REQUEST_TERMS = [
    "ignore previous",
    "ignore all previous",
    "system prompt",
    "developer message",
    "show me your prompt",
    "print secrets",
    "api key",
    "secret key",
    "environment variables",
    ".env",
    "vercel_token",
]


def security_guardrail_response(reason: str) -> ChatResponse:
    return ChatResponse(
        tool="security_guardrail",
        source="direct",
        response="\n".join(
            [
                "## Request Not Allowed",
                f"{reason}",
                "",
                "I can help with customer complaints, urgent cases, sentiment, manager reports, action plans, and configured support operations tools.",
            ]
        ),
    )


def validate_question(question: str) -> ChatResponse | None:
    if not question:
        return security_guardrail_response("Please enter a customer-support question.")

    if len(question) > MAX_MESSAGE_CHARS:
        return security_guardrail_response("The request is too long for this demo workflow.")

    normalized = question.lower()
    if any(term in normalized for term in BLOCKED_REQUEST_TERMS):
        return security_guardrail_response("I cannot reveal hidden instructions, credentials, or environment configuration.")

    return None


def select_tool(question: str) -> Literal[
    "get_urgent_complaints",
    "summarize_issues",
    "generate_manager_report",
    "generate_action_plan",
    "analyze_sentiment",
    "lookup_crm_customer",
    "create_ticket_escalation",
    "check_service_status",
    "send_slack_alert",
    "send_customer_email_batch",
]:
    normalized = question.lower()

    if any(term in normalized for term in ["crm", "customer profile", "customer record", "account history"]):
        return "lookup_crm_customer"

    if any(term in normalized for term in ["ticket", "escalate", "escalation", "create case"]):
        return "create_ticket_escalation"

    if any(term in normalized for term in ["status page", "service status", "outage", "api status"]):
        return "check_service_status"

    if any(term in normalized for term in ["slack", "team alert", "notify team", "send alert"]):
        return "send_slack_alert"

    if any(term in normalized for term in ["email customer", "send email", "customer email", "email batch"]):
        return "send_customer_email_batch"

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
        return "summarize_issues"

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
        if tool_name == "get_urgent_complaints":
            return [json.loads(text) for text in text_parts]
        return "\n".join(text_parts)
    return result


async def route_question_to_tool(question: str) -> ChatResponse:
    blocked = validate_question(question)
    if blocked:
        return blocked

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
    trace_id = str(uuid.uuid4())
    started_at = time.perf_counter()
    response = await route_question_to_tool(request.message.strip())
    response.traceId = trace_id
    response.latencyMs = round((time.perf_counter() - started_at) * 1000)
    print(
        json.dumps(
            {
                "event": "chat_request",
                "traceId": trace_id,
                "tool": response.tool,
                "source": response.source,
                "latencyMs": response.latencyMs,
            }
        )
    )
    return response


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=os.getenv("BACKEND_HOST", "127.0.0.1"),
        port=int(os.getenv("BACKEND_PORT", "8010")),
        reload=True,
    )
