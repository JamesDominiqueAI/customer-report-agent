# Prompt And Routing Iteration Log

The current implementation uses deterministic routing instead of an LLM prompt for the critical business decision. This keeps the demo reliable and makes tool choice testable. The "prompt iteration" work is captured as routing and response-policy iteration.

## Version 1: Keyword Routing

Goal: prove the end-to-end chatbot flow quickly.

Behavior:

- "urgent" selected `get_urgent_complaints`
- "report" or "manager" selected `generate_manager_report`
- "sentiment" selected `analyze_sentiment`

Issue found:

- Operational requests such as escalation, CRM lookup, and Slack alert were not visible in the demo.

## Version 2: Manager Workflow Coverage

Change:

- Added routing for `generate_action_plan`.
- Added external MCP adapter tools for CRM lookup, ticket escalation, service status, Slack alert, and customer email batch.

Reason:

- The assessment values production thinking. External adapters show how the agent would connect to real support systems while still failing safely when credentials are absent.

## Version 3: Safety Guardrails

Change:

- Added validation before tool selection.
- Empty requests, long requests, and prompt-injection or secret-exfiltration attempts return `security_guardrail`.

Reason:

- Tool routing should not run on adversarial requests such as "ignore previous instructions" or "print secrets from .env".

## Version 4: Observable Responses

Change:

- Added trace IDs and backend latency to `/api/chat` responses.
- The frontend activity panel displays the tool, source, dataset, response time, and short trace ID.

Reason:

- A reviewer can connect a UI response to backend logs and explain the request path during the final presentation.
