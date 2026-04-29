"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { postChatMessage } from "@/lib/api";
import { demoPrompts } from "@/lib/prompts";

type Message = {
  role: "user" | "assistant";
  content: string;
  tool?: string;
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

  function speakResponse(content: string) {
    if (!readAloud || !speechSupported) {
      return;
    }

    const text = content
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

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: assistantContent,
          tool: data.tool
        }
      ]);
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
        </div>
      </div>

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
