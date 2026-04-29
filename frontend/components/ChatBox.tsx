"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Complaint,
  getComplaints,
  getCsvExportUrl,
  postChatMessage
} from "@/lib/api";
import { demoPrompts } from "@/lib/prompts";

type Message = {
  role: "user" | "assistant";
  content: string;
  tool?: string;
};

type Activity = {
  tool: string;
  dataset: string;
  responseTimeMs: number;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEventLike = {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal?: boolean;
    };
    length: number;
  };
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

function MarkdownLite({ content }: { content: string }) {
  return (
    <div className="markdown">
      {content.split("\n").map((line, index) => {
        if (line.startsWith("### ")) {
          return <h3 key={index}>{line.slice(4)}</h3>;
        }

        if (line.startsWith("## ")) {
          return <h2 key={index}>{line.slice(3)}</h2>;
        }

        if (line.startsWith("- ")) {
          return <p key={index} className="bullet">{line}</p>;
        }

        if (!line.trim()) {
          return <div key={index} className="spacer" />;
        }

        return <p key={index}>{line}</p>;
      })}
    </div>
  );
}

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Ask for a complaint summary, urgent cases, recurring issues, sentiment, or a manager-ready report."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("Voice ready");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [readAloud, setReadAloud] = useState(true);
  const [readSummaryOnly, setReadSummaryOnly] = useState(false);
  const [lastReport, setLastReport] = useState("");
  const [activity, setActivity] = useState<Activity | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechSupported = useMemo(
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    []
  );
  const recognitionSupported = useMemo(
    () => typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
    []
  );

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    getComplaints({ sentiment: sentimentFilter, urgency: urgencyFilter, query })
      .then((items) => {
        setComplaints(items);
        setSelectedComplaint((current) => {
          if (!current) return null;
          return items.find((item) => item.id === current.id) ?? null;
        });
      })
      .catch(() => setComplaints([]));
  }, [sentimentFilter, urgencyFilter, query]);

  function speakResponse(content: string) {
    if (!readAloud || !speechSupported) {
      return;
    }

    const source = readSummaryOnly ? content.split("\n").slice(0, 4).join(" ") : content;
    const text = source
      .replace(/^#{2,3}\s/gm, "")
      .replace(/^- /gm, "")
      .replace(/\s+/g, " ")
      .trim();

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text.slice(0, 1200)));
  }

  async function sendMessage(message: string) {
    const trimmed = message.trim();
    if (!trimmed || isLoading) {
      return;
    }

    setInput("");
    setIsLoading(true);
    setMessages((current) => [...current, { role: "user", content: trimmed }]);

    try {
      const data = await postChatMessage(trimmed);
      const assistantContent = data.response ?? data.error ?? "Something went wrong.";
      const tool = data.tool ?? "unknown";

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: assistantContent,
          tool
        }
      ]);
      setActivity({
        tool,
        dataset: "data/complaints.json",
        responseTimeMs: data.responseTimeMs ?? 0
      });
      if (tool === "generate_manager_report" || tool === "generate_action_plan") {
        setLastReport(assistantContent);
      }
      speakResponse(assistantContent);
    } catch {
      const assistantContent = "The chat service is unavailable. Please try again.";
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: assistantContent
        }
      ]);
      speakResponse(assistantContent);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function downloadTextFile(filename: string, content: string) {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function handleDownloadReport() {
    const lastAssistant = [...messages].reverse().find((message) => message.role === "assistant");
    const content = lastReport || lastAssistant?.content || "";
    if (!content) {
      return;
    }
    downloadTextFile("customer-manager-report.md", content);
  }

  function handleVoiceCommand(transcript: string) {
    const normalized = transcript.toLowerCase();
    if (normalized.includes("clear chat")) {
      setMessages([]);
      setVoiceStatus("Chat cleared");
      return true;
    }

    if (normalized.includes("stop reading")) {
      window.speechSynthesis.cancel();
      setVoiceStatus("Stopped reading");
      return true;
    }

    if (normalized.includes("download report")) {
      handleDownloadReport();
      setVoiceStatus("Downloaded latest report");
      return true;
    }

    return false;
  }

  function startVoiceInput() {
    if (!recognitionSupported || isLoading) {
      setVoiceStatus("Voice input is not supported in this browser");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = Array.from({ length: event.results.length }, (_, index) => {
        return event.results[index][0].transcript;
      }).join(" ").trim();

      setInput(transcript);
      setVoiceTranscript(transcript);

      const latestResult = event.results[event.results.length - 1];
      if (latestResult.isFinal !== false && transcript) {
        if (handleVoiceCommand(transcript)) {
          return;
        }
        setVoiceStatus(`Registered voice. Sending to MCP: "${transcript}"`);
        void sendMessage(transcript);
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
      setVoiceStatus("Voice input failed. Check microphone permission and try again.");
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    setVoiceTranscript("");
    setVoiceStatus("Registering your voice...");
    recognition.start();
  }

  function stopVoiceInput() {
    recognitionRef.current?.stop();
    setIsListening(false);
    setVoiceStatus("Voice input stopped");
  }

  return (
    <section className="chat-shell" aria-label="Customer report chatbot">
      <div className="voice-panel">
        <div>
          <span>Voice MCP Bridge</span>
          <p>{voiceStatus}</p>
          {voiceTranscript ? <strong className="voice-transcript">"{voiceTranscript}"</strong> : null}
        </div>
        <div className="voice-actions">
          <button
            type="button"
            className={isListening ? "voice-button active" : "voice-button"}
            onClick={isListening ? stopVoiceInput : startVoiceInput}
            disabled={isLoading}
          >
            {isListening ? "Stop" : "Talk"}
          </button>
          <label className="voice-toggle">
            <input
              type="checkbox"
              checked={readAloud}
              onChange={(event) => setReadAloud(event.target.checked)}
            />
            Read replies
          </label>
          <label className="voice-toggle">
            <input
              type="checkbox"
              checked={readSummaryOnly}
              onChange={(event) => setReadSummaryOnly(event.target.checked)}
            />
            Summary only
          </label>
        </div>
      </div>

      <section className="tool-panel" aria-label="MCP tool activity">
        <div>
          <span>MCP Activity</span>
          <strong>{activity?.tool ?? "No tool called yet"}</strong>
        </div>
        <div>
          <span>Dataset</span>
          <strong>{activity?.dataset ?? "data/complaints.json"}</strong>
        </div>
        <div>
          <span>Response Time</span>
          <strong>{activity ? `${activity.responseTimeMs}ms` : "--"}</strong>
        </div>
        <button type="button" onClick={handleDownloadReport} disabled={!lastReport && messages.length <= 1}>
          Download Report
        </button>
      </section>

      <div className="messages">
        {messages.map((message, index) => (
          <article key={index} className={`message ${message.role}`}>
            <span>{message.role === "user" ? "You" : "Agent"}</span>
            {message.tool ? <small className="tool-chip">MCP tool: {message.tool}</small> : null}
            <MarkdownLite content={message.content} />
          </article>
        ))}
        {isLoading ? (
          <article className="message assistant">
            <span>Agent</span>
            <p>Reviewing complaints...</p>
          </article>
        ) : null}
      </div>

      <div className="prompt-row" aria-label="Demo prompts">
        {demoPrompts.map((prompt) => (
          <button key={prompt} type="button" onClick={() => void sendMessage(prompt)}>
            {prompt}
          </button>
        ))}
      </div>

      <section className="complaint-browser" aria-label="Complaint browser">
        <div className="browser-controls">
          <input
            aria-label="Search complaints"
            placeholder="Search customer, category, or issue"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            aria-label="Sentiment filter"
            value={sentimentFilter}
            onChange={(event) => setSentimentFilter(event.target.value)}
          >
            <option value="all">All sentiment</option>
            <option value="negative">Negative</option>
            <option value="mixed">Mixed</option>
            <option value="neutral">Neutral</option>
          </select>
          <select
            aria-label="Urgency filter"
            value={urgencyFilter}
            onChange={(event) => setUrgencyFilter(event.target.value)}
          >
            <option value="all">All urgency</option>
            <option value="high">Urgent only</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <a
            className="export-link"
            href={getCsvExportUrl({ sentiment: sentimentFilter, urgency: urgencyFilter, query })}
          >
            Export CSV
          </a>
        </div>

        <div className="complaint-grid">
          <div className="complaint-list">
            {complaints.slice(0, 8).map((complaint) => (
              <button
                key={complaint.id}
                type="button"
                className={selectedComplaint?.id === complaint.id ? "complaint-row active" : "complaint-row"}
                onClick={() => setSelectedComplaint(complaint)}
              >
                <strong>{complaint.id}</strong>
                <span>{complaint.customer}</span>
                <span>{complaint.category}</span>
                <em>{complaint.urgency}</em>
              </button>
            ))}
          </div>

          <article className="complaint-detail">
            {selectedComplaint ? (
              <>
                <p className="eyebrow">{selectedComplaint.id}</p>
                <h3>{selectedComplaint.customer}</h3>
                <dl>
                  <div><dt>Category</dt><dd>{selectedComplaint.category}</dd></div>
                  <div><dt>Urgency</dt><dd>{selectedComplaint.urgency}</dd></div>
                  <div><dt>Sentiment</dt><dd>{selectedComplaint.sentiment}</dd></div>
                </dl>
                <p>{selectedComplaint.text}</p>
                <strong>Recommended action</strong>
                <p>{selectedComplaint.recommendedAction}</p>
              </>
            ) : (
              <p>Select a complaint to view details and recommended action.</p>
            )}
          </article>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="composer">
        <input
          aria-label="Message"
          placeholder="Ask for urgent complaints or a manager report"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          Send
        </button>
      </form>
    </section>
  );
}
