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

export default function ChatPage() {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [lionId, setLionId] = useState<string | null>(null);
  const [lionName, setLionName] = useState<string>("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setGuestId(localStorage.getItem("guestId"));
    setLionId(localStorage.getItem("lionId"));
    setLionName(localStorage.getItem("lionName") ?? "");
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

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
        body: JSON.stringify({ guestId, message: userMsg })
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "lion", text: data.reply ?? `[error: ${data.error ?? "unknown"}]` }
      ]);
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
        <div>
          <div style={{ fontFamily: "Baloo 2, sans-serif", fontWeight: 700, fontSize: 16 }}>
            {lionName || "Your lion"}
          </div>
          <div style={{ fontSize: 12, color: "#9a7d68" }}>Online for CNY</div>
        </div>
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
