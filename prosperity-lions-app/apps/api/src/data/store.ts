// TEMPORARY in-memory store so the API is runnable out of the box.
//
// Replace with a real database (Postgres, etc.) before anything beyond local
// testing. See docs/technical-build-plan.md Section 4 for the target schema.
// Nothing here persists across server restarts.

import type { Guest, PrizeDraw } from "@prosperity-lions/shared/types";

export const guests = new Map<string, Guest>();
export const prizeDraws: PrizeDraw[] = [];
export const pointsLedger: Array<{
  guestId: string;
  action: string;
  points: number;
  timestamp: string;
}> = [];

// Daily caps referenced in docs/chat-conversation-flow.md Section 10.
// Placeholder values - confirm real numbers with the team.
export const POINTS_TABLE: Record<string, { points: number; dailyCap: number }> = {
  first_chat_of_day: { points: 3, dailyCap: 1 },
  complete_fortune: { points: 2, dailyCap: 1 },
  learn_tradition: { points: 2, dailyCap: 3 },
  view_offer: { points: 1, dailyCap: 3 },
  venue_checkin: { points: 10, dailyCap: 5 },
  play_game: { points: 5, dailyCap: 3 }
};
