"use client";

// Storybook-style quiz: one illustrated "page" per question, matching the
// tone and scoring rules in docs/personality-quiz.md.

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

type Question = {
  id: string;
  title: string;
  prompt: string;
  image: string;
  options: { text: string }[];
};

// Result blurbs from docs/personality-quiz.md Section 5. Keep these in sync
// with the character bible if the lions' voices change.
const RESULT_BLURBS: Record<string, string> = {
  hong_hong:
    "You're a natural leader who charges in and gets the party started! Bold, brave and full of energy. I'll be your buddy!",
  rui_rui:
    "You bring the laughter and the luck! Cheeky, friendly, always up to something fun. Hehe, we're going to have a great year!",
  xing_xing:
    "You're an explorer who wants to try everything! Curious, adventurous and just a little bit clumsy. Ooh, let's find something new!",
  xi_xi:
    "You're the warm heart of every gathering. Gentle and caring, you make everyone feel loved. Come here, I've got a hug for you!",
  zhi_zhi:
    "You're thoughtful, observant and wiser than you let on. Um... I think we're going to get along well."
};

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/quiz/questions`)
      .then((r) => r.json())
      .then((data) => setQuestions(data.questions));
  }, []);

  async function submit(finalAnswers: Record<string, number>) {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/quiz/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: finalAnswers })
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("guestId", data.guestId);
      localStorage.setItem("lionId", data.matchedLionId);
      localStorage.setItem("lionName", data.lion?.name ?? "");
    }
  }

  // --- Result "page" ---
  if (result) {
    return (
      <main className="storybook-page">
        <div className="storybook-scene" style={{ background: "var(--cny-gold)" }}>
          <img src={`/scenes/q8_new_year_wish.svg`} alt="" />
        </div>
        <div className="result-portrait">
          <img src={`/lions/${result.matchedLionId}.svg`} alt={result.lion?.name} />
        </div>
        <div className="storybook-card" style={{ marginTop: 16, textAlign: "center" }}>
          <p className="storybook-eyebrow">You matched with</p>
          <h1 className="storybook-title" style={{ fontSize: 26 }}>
            {result.lion?.name} — {result.lion?.title}
          </h1>
          <p className="storybook-prompt">{RESULT_BLURBS[result.matchedLionId]}</p>
          <a href="/chat" className="btn-primary">
            Chat with {result.lion?.name}
          </a>
        </div>
      </main>
    );
  }

  const q = questions[step];

  if (!q) {
    return (
      <main className="storybook-page">
        <div className="storybook-card" style={{ margin: "60px 16px" }}>
          <p>Loading the story...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="storybook-page">
      <div className="storybook-scene">
        <img src={q.image} alt="" key={q.id} />
      </div>

      <div className="storybook-card" key={q.id}>
        <p className="storybook-eyebrow">
          Page {step + 1} of {questions.length}
        </p>
        <h2 className="storybook-title">{q.title}</h2>
        <p className="storybook-prompt">{q.prompt}</p>

        <div className="option-list">
          {q.options.map((opt, i) => (
            <button
              key={i}
              className="option-button"
              disabled={loading}
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
      </div>

      <div className="progress-dots">
        {questions.map((qq, i) => (
          <div
            key={qq.id}
            className={
              "progress-dot" + (i === step ? " is-active" : i < step ? " is-done" : "")
            }
          />
        ))}
      </div>
    </main>
  );
}
