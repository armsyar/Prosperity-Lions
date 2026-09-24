"use client";

// Chat screen: matched lion in the header, quick-reply chips per
// docs/chat-conversation-flow.md ("every reply ends with 2-4 quick-reply
// chips"). Chip set below is the static default menu from that doc Section 2;
// a fuller build would let the model suggest contextual chips per turn.

import { useEffect, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

const DEFAULT_CHIPS = [
  "What's on today?",
  "Where should I eat?",
  "Tell my fortune",
  "Teach me a CNY tradition",
  "Just chat"
];

// How many raw Anthropic-format messages to keep and resend for memory.
// Keeps token cost bounded (docs/chat-conversation-flow.md Section 13:
// "Cost controls") while still giving the lion recent-turn context.
const MAX_HISTORY_MESSAGES = 20;

export default function ChatPage() {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [lionId, setLionId] = useState<string | null>(null);
  const [lionName, setLionName] = useState<string>("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [points, setPoints] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  // Raw Anthropic-format message history (includes tool_use/tool_result
  // blocks), separate from the simplified `messages` used for the UI. This
  // is what actually gives the lion memory between turns - previously this
  // was never sent to the server at all, so every message started fresh.
  const historyRef = useRef<any[]>([]);

  useEffect(() => {
    const gid = localStorage.getItem("guestId");
    setGuestId(gid);
    setLionId(localStorage.getItem("lionId"));
    setLionName(localStorage.getItem("lionName") ?? "");
    if (gid) refreshPoints(gid);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function refreshPoints(gid: string) {
    try {
      const res = await fetch(`${API_BASE}/api/points/${gid}`);
      if (res.ok) {
        const data = await res.json();
        setPoints(data.pointsBalance ?? null);
      }
    } catch {
      // Non-critical - just skip updating the badge this time.
    }
  }

  async function send(text?: string) {
    const userMsg = text ?? input;
    if (!userMsg.trim() || !guestId) return;
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId,
          message: userMsg,
          history: historyRef.current.slice(-MAX_HISTORY_MESSAGES)
        })
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "lion", text: data.reply ?? `[error: ${data.error ?? "unknown"}]` }
      ]);
      if (Array.isArray(data.messages)) {
        historyRef.current = data.messages;
      }
      // A chat turn can award Lucky Points (award_points tool) or trigger a
      // hongbao draw, so refresh the badge after every reply.
      refreshPoints(guestId);
    } catch {
      setMessages((m) => [...m, { role: "lion", text: "[connection error, please try again]" }]);
    } finally {
      setSending(false);
    }
  }

  if (!guestId) {
    return (
      <main className="storybook-page">
        <div className="storybook-card" style={{ margin: "60px 16px", textAlign: "center" }}>
          <p className="storybook-prompt">Take the quiz first to get matched with a lion.</p>
          <a href="/quiz" className="btn-primary">
            Go to quiz
          </a>
        </div>
      </main>
    );
  }

  return (
    <main
      className="storybook-page"
      style={{ padding: 0, display: "flex", flexDirection: "column", height: "100dvh" }}
    >
      <div className="chat-header">
        {lionId && <img src={`/lions/${lionId}.svg`} alt={lionName} />}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Baloo 2, sans-serif", fontWeight: 700, fontSize: 16 }}>
            {lionName || "Your lion"}
          </div>
          <div style={{ fontSize: 12, color: "#9a7d68" }}>Online for CNY</div>
        </div>
        {points !== null && (
          <span
            title="Lucky Points"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--cny-red-dark)",
              whiteSpace: "nowrap"
            }}
          >
            🧧 {points}
          </span>
        )}
        <a
          href="/game"
          title="Play Lion Dance Party"
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--cny-red-dark)",
            border: "2px solid var(--cny-red)",
            borderRadius: 999,
            padding: "8px 12px",
            textDecoration: "none",
            whiteSpace: "nowrap"
          }}
        >
          🥁 Play
        </a>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 10
        }}
      >
        {messages.length === 0 && (
          <p style={{ textAlign: "center", color: "#9a7d68", fontSize: 14, marginTop: 24 }}>
            Say hi to {lionName || "your lion"}, or pick something below.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`chat-bubble ${m.role}`}
            style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start" }}
          >
            {m.text}
          </div>
        ))}
        {sending && (
          <div className="chat-bubble lion" style={{ alignSelf: "flex-start", opacity: 0.6 }}>
            {lionName || "Lion"} is typing...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "0 16px" }}>
        <div className="chip-row">
          {DEFAULT_CHIPS.map((chip) => (
            <button key={chip} className="chip" onClick={() => send(chip)} disabled={sending}>
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, padding: 16 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask anything about CNY..."
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: 999,
            border: "2px solid #ffe0c2",
            fontSize: 15
          }}
        />
        <button onClick={() => send()} className="btn-primary" disabled={sending}>
          Send
        </button>
      </div>
    </main>
  );
}
