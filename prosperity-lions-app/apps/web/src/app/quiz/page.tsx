"use client";

// Minimal functional quiz screen wired to POST /api/quiz/submit.
// This is a starting point, not final UI - see docs/personality-quiz.md for
// the full question set, glossary chips, and illustrated-scene design intent.

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

type Question = {
  id: string;
  title: string;
  prompt: string;
  options: { text: string }[];
};

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/quiz/questions`)
      .then((r) => r.json())
      .then((data) => setQuestions(data.questions));
  }, []);

  async function submit(finalAnswers: Record<string, number>) {
    const res = await fetch(`${API_BASE}/api/quiz/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: finalAnswers })
    });
    const data = await res.json();
    setResult(data);
    if (typeof window !== "undefined") {
      localStorage.setItem("guestId", data.guestId);
    }
  }

  if (result) {
    return (
      <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 480, margin: "0 auto" }}>
        <h1>You matched with {result.lion?.name}!</h1>
        <p>{result.lion?.title}</p>
        <a href="/chat">Chat with {result.lion?.name}</a>
      </main>
    );
  }

  const q = questions[step];
  if (!q) return <main style={{ padding: 24 }}>Loading...</main>;

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 480, margin: "0 auto" }}>
      <p>
        Question {step + 1} of {questions.length}
      </p>
      <h2>{q.title}</h2>
      <p>{q.prompt}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => {
              const next = { ...answers, [q.id]: i };
              setAnswers(next);
              if (step + 1 < questions.length) {
                setStep(step + 1);
              } else {
                submit(next);
              }
            }}
          >
            {opt.text}
          </button>
        ))}
      </div>
    </main>
  );
}
