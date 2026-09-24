// Tool definitions passed to the Claude API, matching
// docs/chat-conversation-flow.md Section 13 ("Technical Notes for Developers").
//
// The model can only see and use what these tools return - it has no other
// source of truth for offers, venues, fortunes or prizes. Keep it that way.

import type Anthropic from "@anthropic-ai/sdk";

export const lionTools: Anthropic.Tool[] = [
  {
    name: "get_promotions",
    description:
      "Get currently valid promotions, optionally filtered by venue. Never state an offer, price, or date that did not come from this tool.",
    input_schema: {
      type: "object",
      properties: {
        date: { type: "string", description: "ISO date, defaults to today" },
        venueId: { type: "string", description: "Optional venue id to filter by" }
      }
    }
  },
  {
    name: "get_venues",
    description: "Get venues (restaurants, attractions, hotels, retail), optionally filtered by category.",
    input_schema: {
      type: "object",
      properties: {
        category: { type: "string", enum: ["restaurant", "attraction", "hotel", "retail"] }
      }
    }
  },
  {
    name: "get_fortune",
    description: "Get one curated blessing for this lion's fortune domain. Always frame the result as 'just for fun'.",
    input_schema: {
      type: "object",
      properties: {
        lionId: { type: "string" }
      },
      required: ["lionId"]
    }
  },
  {
    name: "request_hongbao",
    description:
      "Ask the server to decide a hongbao prize outcome for this guest. The server decides the result - only narrate what is returned, never invent a prize.",
    input_schema: {
      type: "object",
      properties: {
        guestId: { type: "string" }
      },
      required: ["guestId"]
    }
  },
  {
    name: "award_points",
    description: "Record a Lucky Points action for the guest. The server enforces daily caps.",
    input_schema: {
      type: "object",
      properties: {
        guestId: { type: "string" },
        action: {
          type: "string",
          enum: [
            "first_chat_of_day",
            "complete_fortune",
            "learn_tradition",
            "view_offer",
            "venue_checkin",
            "play_game"
          ]
        }
      },
      required: ["guestId", "action"]
    }
  }
];

// Executes a tool call against this server's own local logic (not another
// network hop) - kept simple for the MVP. Swap the internals for real DB
// calls as the store moves off the in-memory placeholder.
export async function executeTool(
  name: string,
  input: Record<string, unknown>,
  baseUrl: string
): Promise<unknown> {
  const url = new URL(baseUrl);

  switch (name) {
    case "get_promotions": {
      const params = new URLSearchParams(input as Record<string, string>);
      const r = await fetch(`${url.origin}/api/promotions?${params}`);
      return r.json();
    }
    case "get_venues": {
      const params = new URLSearchParams(input as Record<string, string>);
      const r = await fetch(`${url.origin}/api/venues?${params}`);
      return r.json();
    }
    case "get_fortune": {
      const r = await fetch(`${url.origin}/api/fortune/${input.lionId}`);
      return r.json();
    }
    case "request_hongbao": {
      const r = await fetch(`${url.origin}/api/hongbao/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      return r.json();
    }
    case "award_points": {
      const r = await fetch(`${url.origin}/api/points/award`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      return r.json();
    }
    default:
      return { error: `unknown tool: ${name}` };
  }
}
