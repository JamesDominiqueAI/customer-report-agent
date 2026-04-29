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


def get_complaint_summary() -> dict[str, Any]:
    complaints = _load_complaints()
    categories = Counter(complaint["category"] for complaint in complaints)
    sentiment = Counter(complaint["sentiment"] for complaint in complaints)
    urgent = [complaint for complaint in complaints if complaint["urgency"] == "high"]
    top_category, top_category_count = categories.most_common(1)[0]

    return {
        "total": len(complaints),
        "urgent": len(urgent),
        "negative": sentiment.get("negative", 0),
        "topCategory": top_category,
        "topCategoryCount": top_category_count,
    }


def search_complaints(
    sentiment: str | None = None,
    urgency: str | None = None,
    query: str | None = None,
) -> list[dict[str, Any]]:
    complaints = _load_complaints()
    normalized_query = (query or "").strip().lower()

    if sentiment and sentiment != "all":
        complaints = [
            complaint
            for complaint in complaints
            if complaint["sentiment"] == sentiment
        ]

    if urgency and urgency != "all":
        complaints = [
            complaint
            for complaint in complaints
            if complaint["urgency"] == urgency
        ]

    if normalized_query:
        complaints = [
            complaint
            for complaint in complaints
            if normalized_query in complaint["customer"].lower()
            or normalized_query in complaint["category"].lower()
            or normalized_query in complaint["text"].lower()
        ]

    return complaints


def get_recommended_action(complaint: dict[str, Any]) -> str:
    if complaint["urgency"] == "high" and complaint["category"] == "billing":
        return "Assign to billing specialist today and confirm correction with the customer."
    if complaint["urgency"] == "high" and complaint["category"] == "product quality":
        return "Escalate to product operations and arrange a safe replacement."
    if complaint["urgency"] == "high":
        return "Escalate to the support lead and set same-day follow-up."
    if complaint["sentiment"] == "negative":
        return "Respond within one business day with a clear owner and next step."
    return "Track for trend analysis and follow normal support SLA."


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


def generate_action_plan() -> str:
    urgent = get_urgent_complaints()
    return "\n".join(
        [
            "## Manager Action Plan",
            "### Top 3 Priorities",
            *[
                f"- {item['id']}: {item['category']} - {item['text']}"
                for item in urgent[:3]
            ],
            "",
            "### Owner Assignment",
            "- Billing issues: Billing specialist",
            "- Product quality issues: Product operations",
            "- Technical and access issues: Support engineering",
            "",
            "### SLA Recommendation",
            "- High urgency: same day",
            "- Medium urgency: 1 business day",
            "- Low urgency: 3 business days",
            "",
            "### Next-Step Checklist",
            "- Confirm ownership for each urgent case.",
            "- Contact affected customers with an ETA.",
            "- Escalate product safety and API outage issues.",
            "- Review recurring categories at the next support standup.",
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
