import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import lionsData from "@prosperity-lions/shared/lions.json" with { type: "json" };
import { buildSystemPrompt } from "@prosperity-lions/shared/systemPrompt";
import { guests } from "../data/store.js";
import { lionTools, executeTool } from "../lib/claudeTools.js";

export const chatRouter = Router();

// This uses the Claude API directly, billed separately and pay-as-you-go -
// NOT covered by a claude.ai subscription. See docs/technical-build-plan.md
// Section 5 and 8. Set ANTHROPIC_API_KEY in .env (see .env.example) and never
// commit it.
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// A cheap, fast model for everyday chat. Swap for a stronger one if quality
// testing shows it's needed - see docs/technical-build-plan.md Section 5.
const CHAT_MODEL = process.env.CLAUDE_CHAT_MODEL ?? "claude-3-5-haiku-20241022";
const MAX_TOOL_ROUNDS = 4;

// POST /api/chat
// body: { guestId, message, history? }
chatRouter.post("/", async (req, res) => {
  const { guestId, message, history = [] } = req.body ?? {};
  const guest = guests.get(guestId);

  if (!guest) return res.status(404).json({ error: "guest not found. Submit the quiz first." });
  if (!guest.matchedLionId) return res.status(400).json({ error: "guest has no matched lion yet" });
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured on the server" });
  }

  const lion = lionsData.find((l) => l.id === guest.matchedLionId);
  if (!lion) return res.status(500).json({ error: "lion data not found" });

  const systemPrompt = buildSystemPrompt(lion as any, {
    quizResultSummary: `matched to ${lion.name} (${lion.title})`
  });

  const messages: Anthropic.MessageParam[] = [...history, { role: "user", content: message }];

  try {
    let response = await anthropic.messages.create({
      model: CHAT_MODEL,
      max_tokens: 400,
      system: systemPrompt,
      tools: lionTools,
      messages
    });

    let rounds = 0;
    while (response.stop_reason === "tool_use" && rounds < MAX_TOOL_ROUNDS) {
      rounds += 1;
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );

      const toolResults = await Promise.all(
        toolUseBlocks.map(async (block) => {
          const baseUrl = `${req.protocol}://${req.get("host")}`;
          const result = await executeTool(block.name, block.input as Record<string, unknown>, baseUrl);
          return {
            type: "tool_result" as const,
            tool_use_id: block.id,
            content: JSON.stringify(result)
          };
        })
      );

      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });

      response = await anthropic.messages.create({
        model: CHAT_MODEL,
        max_tokens: 400,
        system: systemPrompt,
        tools: lionTools,
        messages
      });
    }

    const textBlocks = response.content.filter((b): b is Anthropic.TextBlock => b.type === "text");
    const reply = textBlocks.map((b) => b.text).join("\n");

    res.json({ reply, lionId: lion.id, messages });
  } catch (err) {
    console.error("chat error", err);
    res.status(502).json({ error: "the lion is not responding right now, please try again" });
  }
});
