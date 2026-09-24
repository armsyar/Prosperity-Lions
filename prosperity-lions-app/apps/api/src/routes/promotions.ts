import { Router } from "express";
import promotions from "@prosperity-lions/shared/promotions.json" with { type: "json" };

export const promotionsRouter = Router();

// GET /api/promotions?date=2027-02-01&venueId=feng_shui_inn
// This backs the get_promotions tool the lion calls in chat
// (docs/chat-conversation-flow.md Section 5). The model must never state an
// offer that didn't come from this endpoint.
promotionsRouter.get("/", (req, res) => {
  const { date, venueId } = req.query as { date?: string; venueId?: string };
  const today = date ?? new Date().toISOString().slice(0, 10);

  const active = promotions.filter((p) => {
    const inWindow = p.validFrom <= today && today <= p.validTo;
    const matchesVenue = venueId ? p.venueId === venueId : true;
    return inWindow && matchesVenue && p.stock > 0;
  });

  res.json(active);
});
