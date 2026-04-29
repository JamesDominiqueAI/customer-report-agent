from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any

DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "complaints.json"


def _load_complaints() -> list[dict[str, Any]]:
    return json.loads(DATA_PATH.read_text())


def _format_counts(counter: Counter[str]) -> str:
    return "\n".join(f"- {label}: {count}" for label, count in counter.most_common())


def get_all_complaints() -> list[dict[str, Any]]:
    return _load_complaints()


def get_urgent_complaints() -> list[dict[str, Any]]:
    return [
        complaint
        for complaint in _load_complaints()
        if complaint["urgency"] == "high"
    ]


def summarize_issues() -> str:
    complaints = _load_complaints()
    categories = Counter(complaint["category"] for complaint in complaints)
    urgency = Counter(complaint["urgency"] for complaint in complaints)
    sentiment = Counter(complaint["sentiment"] for complaint in complaints)

    return "\n".join(
        [
            "## Issue Summary",
            f"Total complaints reviewed: {len(complaints)}.",
            "",
            "### Top recurring issues",
            _format_counts(categories),
            "",
            "### Urgency breakdown",
            _format_counts(urgency),
            "",
            "### Sentiment overview",
            _format_counts(sentiment),
        ]
    )


def generate_manager_report() -> str:
    complaints = _load_complaints()
    urgent = get_urgent_complaints()
    urgent_lines = "\n".join(
        f"- {item['id']}: {item['customer']} - {item['category']} - {item['text']}"
        for item in urgent
    )

    return "\n".join(
        [
            "## Manager Report",
            f"The support queue contains {len(complaints)} customer complaints. {len(urgent)} are high urgency.",
            "",
            "### Immediate Priorities",
            urgent_lines,
            "",
            "### Recommended Actions",
            "- Assign billing corrections and duplicate-charge cases to a specialist today.",
            "- Escalate overheating and API failure cases to product and engineering.",
            "- Review delivery exceptions with the carrier before end of day.",
            "- Update account recovery instructions for password reset and two-factor issues.",
        ]
    )


def analyze_sentiment() -> str:
    complaints = _load_complaints()
    sentiment = Counter(complaint["sentiment"] for complaint in complaints)
    return "\n".join(
        [
            "## Sentiment Overview",
            _format_counts(sentiment),
            "",
            "Negative sentiment is the largest group, mostly driven by billing, delivery, access, and reliability complaints.",
        ]
    )
