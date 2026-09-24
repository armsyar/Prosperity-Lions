import { Router } from "express";
import { nanoid } from "nanoid";
import quizData from "@prosperity-lions/shared/quiz.json" with { type: "json" };
import lions from "@prosperity-lions/shared/lions.json" with { type: "json" };
import type { LionId } from "@prosperity-lions/shared/types";
import { guests } from "../data/store.js";

export const quizRouter = Router();

// POST /api/quiz/submit
// body: { answers: { [questionId]: optionIndex } }
// Scoring rule: main lion +2, secondary lion +1, per docs/personality-quiz.md Section 4.
quizRouter.post("/submit", (req, res) => {
  const answers: Record<string, number> = req.body?.answers ?? {};
  const scores: Record<string, number> = {};

  for (const question of quizData.questions) {
    const optionIndex = answers[question.id];
    const option = question.options[optionIndex];
    if (!option) continue;
    scores[option.main] = (scores[option.main] ?? 0) + 2;
    scores[option.secondary] = (scores[option.secondary] ?? 0) + 1;
  }

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const matchedLionId = (ranked[0]?.[0] as LionId) ?? "hong_hong"; // fallback, should not happen with full answers
  const runnerUpLionId = (ranked[1]?.[0] as LionId) ?? null;

  const guestId = req.body?.guestId ?? nanoid();
  guests.set(guestId, {
    anonymousId: guestId,
    matchedLionId,
    quizAnswers: answers,
    pointsBalance: 0,
    bondLevel: 1,
    createdAt: new Date().toISOString(),
    language: req.body?.language ?? "en"
  });

  const lion = lions.find((l) => l.id === matchedLionId);

  res.json({ guestId, matchedLionId, runnerUpLionId, lion, scores });
});

quizRouter.get("/questions", (_req, res) => {
  res.json(quizData);
});
