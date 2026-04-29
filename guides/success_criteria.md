# Success Criteria

This project is considered successful when the deployed chatbot can satisfy these measurable checks.

## Business Flows

- Given "Show only urgent complaints", the agent uses `get_urgent_complaints` and returns only high-urgency cases.
- Given "Generate a manager-ready customer support report", the agent uses `generate_manager_report` and returns immediate priorities plus recommended actions.
- Given "What are the top recurring customer issues?", the agent uses `summarize_issues` and returns category, urgency, and sentiment breakdowns.
- Given "Create an action plan with owners and SLA", the agent uses `generate_action_plan` and returns owners, SLA guidance, and next steps.

## Production Behavior

- The frontend calls the public backend URL, not localhost.
- The backend attempts the FastMCP tool registry first and falls back to direct tool functions if needed.
- Each chat response includes the selected tool, source, trace ID, and latency.
- External MCP adapter tools fail safely when optional webhook URLs are not configured.

## Safety And Edge Cases

- Empty chat input returns a guardrail message instead of selecting a business tool.
- Prompt-injection attempts asking for hidden prompts or credentials return `security_guardrail`.
- Long inputs over the demo limit return `security_guardrail`.
- Tests cover happy paths, external adapter fallbacks, routing behavior, and adversarial requests.

## Verification Commands

```bash
python -m unittest discover backend/tests
```

```bash
cd frontend
npm run build
```
