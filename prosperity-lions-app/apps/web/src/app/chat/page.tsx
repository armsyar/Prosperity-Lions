"use client";

// Minimal functional chat screen wired to POST /api/chat.
// Real UI should add the quick-reply chips described in
// docs/chat-conversation-flow.md (every reply ends with 2-4 chips).

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

export default function ChatPage() {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setGuestId(localStorage.getItem("guestId"));
  }, []);

  async function send() {
    if (!input.trim() || !guestId) return;
    const userMsg = input;
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setInput("");
    setSending(true);

    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId, message: userMsg })
    });
    const data = await res.json();
    setSending(false);

    if (data.reply) {
      setMessages((m) => [...m, { role: "lion", text: data.reply }]);
    } else {
      setMessages((m) => [...m, { role: "lion", text: `[error: ${data.error}]` }]);
    }
  }

  if (!guestId) {
    return (
      <main style={{ padding: 24, fontFamily: "sans-serif" }}>
        <p>Take the quiz first to get matched with a lion.</p>
        <a href="/quiz">Go to quiz</a>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 480, margin: "0 auto" }}>
      <h1>Chat with your lion</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.role === "user" ? "right" : "left" }}>
            <strong>{m.role === "user" ? "You" : "Lion"}:</strong> {m.text}
          </div>
        ))}
        {sending && <div>Lion is typing...</div>}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
        placeholder="Ask anything about CNY..."
        style={{ width: "100%", padding: 8 }}
      />
      <button onClick={send} style={{ marginTop: 8 }}>
        Send
      </button>
    </main>
  );
}
