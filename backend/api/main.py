from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from backend.mcp import tools  # noqa: E402


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    tool: Literal[
        "get_all_complaints",
        "get_urgent_complaints",
        "summarize_issues",
        "generate_manager_report",
        "analyze_sentiment",
    ]
    response: str


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


def route_question_to_tool(question: str) -> ChatResponse:
    normalized = question.lower()

    if any(term in normalized for term in ["urgent", "priority", "critical"]):
        urgent = tools.get_urgent_complaints()
        urgent_lines = "\n".join(
            f"- {item['id']}: {item['customer']} - {item['category']} - {item['text']}"
            for item in urgent
        )
        return ChatResponse(
            tool="get_urgent_complaints",
            response="\n".join(
                [
                    "## Urgent Complaints",
                    f"{len(urgent)} complaints need high-priority attention.",
                    "",
                    urgent_lines,
                ]
            ),
        )

    if any(term in normalized for term in ["report", "manager"]):
        return ChatResponse(
            tool="generate_manager_report",
            response=tools.generate_manager_report(),
        )

    if any(term in normalized for term in ["sentiment", "feeling", "tone"]):
        return ChatResponse(tool="analyze_sentiment", response=tools.analyze_sentiment())

    if any(term in normalized for term in ["recurring", "top", "summarize", "summary"]):
        return ChatResponse(tool="summarize_issues", response=tools.summarize_issues())

    if any(term in normalized for term in ["all", "list"]):
        complaints = tools.get_all_complaints()
        return ChatResponse(
            tool="get_all_complaints",
            response="\n".join(
                [
                    "## All Complaints",
                    *[
                        f"- {item['id']}: {item['customer']} - {item['urgency']} - {item['category']}"
                        for item in complaints
                    ],
                ]
            ),
        )

    return ChatResponse(
        tool="generate_manager_report",
        response=tools.generate_manager_report(),
    )


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    return route_question_to_tool(request.message.strip())


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=os.getenv("BACKEND_HOST", "127.0.0.1"),
        port=int(os.getenv("BACKEND_PORT", "8010")),
        reload=True,
    )
