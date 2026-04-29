from __future__ import annotations

from mcp.server.fastmcp import FastMCP

from backend.mcp import tools

mcp = FastMCP("customer-report-agent")


@mcp.tool()
def get_all_complaints():
    return tools.get_all_complaints()


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


if __name__ == "__main__":
    mcp.run()
