import { Router } from "express";
import fortunes from "@prosperity-lions/shared/fortunes.json" with { type: "json" };
import type { LionId } from "@prosperity-lions/shared/types";

export const fortuneRouter = Router();

// GET /api/fortune/:lionId
// Returns one random curated blessing for that lion's domain.
// See docs/chat-conversation-flow.md Section 6 for the fuller flow
// (pick-a-lantern, lucky spot, daily cap).
fortuneRouter.get("/:lionId", (req, res) => {
  const lionId = req.params.lionId as LionId;
  const pool = (fortunes as Record<string, unknown[]>)[lionId];
  if (!pool || pool.length === 0) {
    return res.status(404).json({ error: "no fortunes found for lion" });
  }
  const pick = pool[Math.floor(Math.random() * pool.length)];
  res.json(pick);
});
