import { Router } from "express";
import { guests, pointsLedger, POINTS_TABLE } from "../data/store.js";

export const pointsRouter = Router();

// POST /api/points/award
// body: { guestId, action }
// Server enforces daily caps - the model never decides this
// (docs/chat-conversation-flow.md Section 10).
pointsRouter.post("/award", (req, res) => {
  const { guestId, action } = req.body ?? {};
  const guest = guests.get(guestId);
  const rule = POINTS_TABLE[action];

  if (!guest) return res.status(404).json({ error: "guest not found" });
  if (!rule) return res.status(400).json({ error: "unknown action" });

  const today = new Date().toISOString().slice(0, 10);
  const awardedToday = pointsLedger.filter(
    (p) => p.guestId === guestId && p.action === action && p.timestamp.startsWith(today)
  ).length;

  if (awardedToday >= rule.dailyCap) {
    return res.json({ awarded: 0, reason: "daily_cap_reached", pointsBalance: guest.pointsBalance });
  }

  guest.pointsBalance += rule.points;
  pointsLedger.push({ guestId, action, points: rule.points, timestamp: new Date().toISOString() });

  res.json({ awarded: rule.points, pointsBalance: guest.pointsBalance });
});

pointsRouter.get("/:guestId", (req, res) => {
  const guest = guests.get(req.params.guestId);
  if (!guest) return res.status(404).json({ error: "guest not found" });
  res.json({ pointsBalance: guest.pointsBalance, bondLevel: guest.bondLevel });
});
