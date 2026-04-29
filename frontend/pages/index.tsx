import Head from "next/head";

import { ChatBox } from "../components/ChatBox";

export default function Home() {
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
              <strong>16</strong>
            </article>
            <article className="stat-card">
              <span>Urgent</span>
              <strong>6</strong>
            </article>
            <article className="stat-card">
              <span>Tools</span>
              <strong>5</strong>
            </article>
            <article className="stat-card accent-card">
              <span>Dataset</span>
              <strong>JSON</strong>
            </article>
          </section>

          <ChatBox />
        </div>
      </main>
    </>
  );
}
