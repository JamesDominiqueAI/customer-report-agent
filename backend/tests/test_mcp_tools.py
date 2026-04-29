import unittest

from backend.mcp import tools


class ComplaintToolTests(unittest.TestCase):
    def test_get_all_complaints_loads_static_dataset(self):
        complaints = tools.get_all_complaints()

        self.assertEqual(len(complaints), 16)
        self.assertEqual(complaints[0]["id"], "C-1001")

    def test_get_urgent_complaints_filters_high_urgency_only(self):
        urgent = tools.get_urgent_complaints()

        self.assertEqual(len(urgent), 6)
        self.assertTrue(all(item["urgency"] == "high" for item in urgent))

    def test_summarize_issues_returns_manager_readable_sections(self):
        summary = tools.summarize_issues()

        self.assertIn("## Issue Summary", summary)
        self.assertIn("### Top recurring issues", summary)
        self.assertIn("### Urgency breakdown", summary)
        self.assertIn("### Sentiment overview", summary)

    def test_generate_manager_report_includes_priorities_and_actions(self):
        report = tools.generate_manager_report()

        self.assertIn("## Manager Report", report)
        self.assertIn("### Immediate Priorities", report)
        self.assertIn("### Recommended Actions", report)
        self.assertIn("C-1001", report)

    def test_analyze_sentiment_returns_sentiment_summary(self):
        sentiment = tools.analyze_sentiment()

        self.assertIn("## Sentiment Overview", sentiment)
        self.assertIn("- negative:", sentiment)


if __name__ == "__main__":
    unittest.main()
