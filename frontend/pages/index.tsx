import Head from "next/head";
import { useEffect, useState } from "react";

import { ChatBox } from "../components/ChatBox";
import { ComplaintSummary, getComplaintSummary } from "../lib/api";

export default function Home() {
  const [summary, setSummary] = useState<ComplaintSummary | null>(null);

  useEffect(() => {
    getComplaintSummary()
      .then(setSummary)
      .catch(() => undefined);
  }, []);

  return (
    <>
      <Head>
        <title>MCP Customer Report Agent</title>
      </Head>
      <main className="page dashboard-page">
        <div className="shell dashboard-shell">
          <section className="workspace-header">
            <div>
              <p className="eyebrow">Customer Operations</p>
              <h1>MCP Customer Report Agent</h1>
              <p className="lede">
                Summarize customer complaints, identify urgent cases, and prepare a manager-ready
                support report from a small complaint dataset.
              </p>
            </div>
            <div className="command-actions">
              <span className="status-pill">MCP tools ready</span>
            </div>
          </section>

          <section className="stats-grid stats-grid-wide">
            <article className="stat-card">
              <span>Complaints</span>
              <strong>{summary?.total ?? 16}</strong>
            </article>
            <article className="stat-card">
              <span>Urgent</span>
              <strong>{summary?.urgent ?? 6}</strong>
            </article>
            <article className="stat-card">
              <span>Negative Sentiment</span>
              <strong>{summary?.negative ?? 0}</strong>
            </article>
            <article className="stat-card accent-card">
              <span>Top Issue</span>
              <strong>{summary?.topCategory ?? "billing"}</strong>
            </article>
          </section>

          <ChatBox />
        </div>
      </main>
    </>
  );
}
