from __future__ import annotations

from mcp.server.fastmcp import FastMCP

from backend.mcp import tools

mcp = FastMCP("customer-report-agent")


@mcp.tool()
def get_urgent_complaints():
    return tools.get_urgent_complaints()


@mcp.tool()
def summarize_issues():
    return tools.summarize_issues()


@mcp.tool()
def generate_manager_report():
    return tools.generate_manager_report()


@mcp.tool()
def generate_action_plan():
    return tools.generate_action_plan()


@mcp.tool()
def analyze_sentiment():
    return tools.analyze_sentiment()


@mcp.tool()
def lookup_crm_customer():
    return tools.lookup_crm_customer()


@mcp.tool()
def create_ticket_escalation():
    return tools.create_ticket_escalation()


@mcp.tool()
def check_service_status():
    return tools.check_service_status()


@mcp.tool()
def send_slack_alert():
    return tools.send_slack_alert()


@mcp.tool()
def send_customer_email_batch():
    return tools.send_customer_email_batch()


if __name__ == "__main__":
    mcp.run()
