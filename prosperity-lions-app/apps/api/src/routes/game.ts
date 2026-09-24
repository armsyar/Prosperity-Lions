import { Router } from "express";
import { nanoid } from "nanoid";
import type { LionId } from "@prosperity-lions/shared/types";
import { guests, gameScores, pointsLedger, POINTS_TABLE } from "../data/store.js";

export const gameRouter = Router();

const VALID_LIONS: LionId[] = ["hong_hong", "rui_rui", "xing_xing", "xi_xi", "zhi_zhi"];
const VALID_DIFFICULTIES = ["easy", "normal", "hard"];

// Scripted (non-LLM) reactions per docs/game-concept.md Section 7.
// Fast, free and on-brand for each lion's voice from the character bible.
const REACTIONS: Record<LionId, { great: string; ok: string; rough: string }> = {
  hong_hong: {
    great: "THAT was AMAZING! Charge! Let's go again!",
    ok: "Not bad! We can hit harder next time. Charge!",
    rough: "Ha, the drums got me that time. On my feet, let's go again!"
  },
  rui_rui: {
    great: "Hehe, guess what? We were AMAZING! Again, again?",
    ok: "Hehe, not bad at all! Wanna go again?",
    rough: "Hehe, the drums were ticklish today. Again?"
  },
  xing_xing: {
    great: "Ooh, did you see that?! We did so well! What else can we try?",
    ok: "Ooh, that was fun! Oops on a few beats, but fun!",
    rough: "Oops! I got a bit clumsy there. Let's try again, ooh I want to!"
  },
  xi_xi: {
    great: "Yay, sending you a big hug! We danced so well together!",
    ok: "That was lovely! Sending you a big hug either way.",
    rough: "That's okay, come here, big hug. Let's try again!"
  },
  zhi_zhi: {
    great: "Um... wow. That was, uh, really good. I'm quietly proud of us.",
    ok: "Um, that was alright, I think. We can read up and try again.",
    rough: "Um... it's okay. Even the wisest lions trip sometimes. Again?"
  }
};

function reactionFor(lionId: LionId, stars: number) {
  const r = REACTIONS[lionId];
  if (stars >= 3) return r.great;
  if (stars >= 1) return r.ok;
  return r.rough;
}

// POST /api/game/score
// body: { guestId, songId, difficulty, accuracy (0-1), maxCombo, powerUsed }
//
// The SERVER computes stars and coins from accuracy - the client never
// submits its own stars/coins directly, so a tampered client can't grant
// itself rewards (docs/game-concept.md Section 7: "Anti-cheat").
gameRouter.post("/score", (req, res) => {
  const { guestId, songId, difficulty, accuracy, maxCombo, powerUsed } = req.body ?? {};

  const guest = guests.get(guestId);
  if (!guest) return res.status(404).json({ error: "guest not found" });
  if (!guest.matchedLionId) return res.status(400).json({ error: "guest has no matched lion yet" });
  if (typeof songId !== "string" || !songId) return res.status(400).json({ error: "songId required" });
  if (!VALID_DIFFICULTIES.includes(difficulty)) {
    return res.status(400).json({ error: "difficulty must be easy, normal or hard" });
  }

  // Plausibility check (Section 7 "Anti-cheat"): accuracy is a 0-1 fraction,
  // combo can't exceed a generous upper bound for a ~90s song.
  const safeAccuracy = Math.max(0, Math.min(1, Number(accuracy) || 0));
  const safeCombo = Math.max(0, Math.min(500, Math.round(Number(maxCombo) || 0)));

  // Placeholder star thresholds - "numbers are placeholders to tune in
  // playtests" per docs/game-concept.md Section 4.
  const stars: 0 | 1 | 2 | 3 = safeAccuracy >= 0.9 ? 3 : safeAccuracy >= 0.7 ? 2 : safeAccuracy >= 0.4 ? 1 : 0;
  const coins = Math.round(safeAccuracy * 100);

  const lionId = guest.matchedLionId as LionId;
  if (!VALID_LIONS.includes(lionId)) {
    return res.status(400).json({ error: "guest lion id is invalid" });
  }

  const score = {
    id: nanoid(),
    guestId,
    lionId,
    songId,
    difficulty: difficulty as "easy" | "normal" | "hard",
    stars,
    coins,
    accuracy: safeAccuracy,
    maxCombo: safeCombo,
    powerUsed: Boolean(powerUsed),
    playedAt: new Date().toISOString()
  };
  gameScores.push(score);

  // Points come from playing, not from high scores (Section 7), so award
  // the flat play_game amount regardless of stars, subject to the daily cap.
  const rule = POINTS_TABLE.play_game;
  const today = new Date().toISOString().slice(0, 10);
  const awardedToday = pointsLedger.filter(
    (p) => p.guestId === guestId && p.action === "play_game" && p.timestamp.startsWith(today)
  ).length;

  let pointsAwarded = 0;
  if (awardedToday < rule.dailyCap) {
    pointsAwarded = rule.points;
    guest.pointsBalance += rule.points;
    pointsLedger.push({ guestId, action: "play_game", points: rule.points, timestamp: new Date().toISOString() });
  }

  res.json({
    score,
    pointsAwarded,
    pointsBalance: guest.pointsBalance,
    reaction: reactionFor(lionId, stars)
  });
});

gameRouter.get("/scores/:guestId", (req, res) => {
  const guest = guests.get(req.params.guestId);
  if (!guest) return res.status(404).json({ error: "guest not found" });
  const scores = gameScores.filter((s) => s.guestId === req.params.guestId);
  res.json({ scores });
});
