import { Router } from "express";
import { nanoid } from "nanoid";
import { guests, prizeDraws } from "../data/store.js";

export const hongbaoRouter = Router();

// POST /api/hongbao/request
// body: { guestId }
//
// The SERVER decides the outcome. The chat model only narrates whatever this
// endpoint returns - it must never invent a prize itself
// (docs/chat-conversation-flow.md Section 9 and Section 6).
//
// PLACEHOLDER odds and prize pool below. Replace with real inventory,
// legally-reviewed odds, and fraud checks before launch.
hongbaoRouter.post("/request", (req, res) => {
  const { guestId } = req.body ?? {};
  const guest = guests.get(guestId);
  if (!guest) return res.status(404).json({ error: "guest not found" });

  const roll = Math.random();
  let draw;

  if (roll < 0.1) {
    draw = {
      id: nanoid(),
      guestId,
      tier: "voucher" as const,
      item: "REPLACE ME: real voucher item",
      code: nanoid(8).toUpperCase(),
      expiry: "REPLACE ME: real expiry date",
      terms: "Terms and conditions apply. Redeemable once, in person, at the stated venue.",
      awardedAt: new Date().toISOString()
    };
  } else if (roll < 0.3) {
    draw = {
      id: nanoid(),
      guestId,
      tier: "gift" as const,
      item: "REPLACE ME: small gift item",
      code: nanoid(8).toUpperCase(),
      expiry: "REPLACE ME: real expiry date",
      terms: "Terms and conditions apply.",
      awardedAt: new Date().toISOString()
    };
  } else {
    draw = {
      id: nanoid(),
      guestId,
      tier: "blessing_only" as const,
      item: null,
      code: null,
      expiry: null,
      terms: null,
      awardedAt: new Date().toISOString()
    };
  }

  prizeDraws.push(draw);
  res.json(draw);
});
