# Prosperity Lions — CNY Guest App

Resorts World Sentosa's Chinese New Year guest experience: a personality quiz
matches each guest to one of five baby lion characters, who then chat with
them (in character, grounded in real venue/promo data), tell fortunes, give
out hongbao prizes, and star in a lion-dance rhythm game. Built to drive
footfall to tenants — restaurants, attractions, hotels and retail.

**This is an early-stage scaffold, not a finished app.** It runs end-to-end
locally (quiz → matched lion → chat with Claude), but the data, rewards logic
and safety copy are all placeholders that need real content and legal review
before this goes anywhere near real guests. See "Status" below.

## Read this first

All product design decisions live in [`docs/`](./docs) — read these before
changing behaviour, not just the code:

| Doc | Covers |
|---|---|
| [`docs/character-bible.md`](./docs/character-bible.md) | The 5 lions: personality, voice, guardrails, favourites |
| [`docs/personality-quiz.md`](./docs/personality-quiz.md) | The 8-question quiz, scoring, localisation |
| [`docs/chat-conversation-flow.md`](./docs/chat-conversation-flow.md) | Every chat flow, edge cases, system prompt template |
| [`docs/game-concept.md`](./docs/game-concept.md) | The lion-dance rhythm game design |
| [`docs/technical-build-plan.md`](./docs/technical-build-plan.md) | Architecture, timeline, team, **master open-items list** |

The **open items list in `docs/technical-build-plan.md` Section 10** tracks
every decision this project is still waiting on (legal review, final content,
pronouns, etc). Check it before assuming something is final.

## Project structure

```
apps/
  web/      PWA frontend (Next.js) — quiz, chat, game shell
  api/      Backend API (Express) — guest state, points, promos, Claude chat
packages/
  shared/   Shared types + seed data (lions, venues, quiz, fortunes)
docs/       The 5 planning documents (source of truth for content/behaviour)
```

This mirrors the architecture in `docs/technical-build-plan.md` Section 3.
The game (Phaser/PixiJS, per `docs/game-concept.md`) is not scaffolded yet —
it's planned to live inside `apps/web` once art/audio production starts.

## Status: what actually works right now

- ✅ Quiz scoring and lion matching (`apps/api/src/routes/quiz.ts`)
- ✅ Chat endpoint calling the real Claude API with tool use for promotions,
  venues, fortunes and hongbao (`apps/api/src/routes/chat.ts`)
- ✅ In-memory data for lions, venues, one example promotion, and placeholder
  fortunes/prizes
- ❌ No database — guest state resets on server restart
  (`apps/api/src/data/store.ts` is explicitly a placeholder)
- ❌ No admin panel to edit promos
- ❌ No lion-dance game
- ❌ No QR check-in flow
- ❌ Minimal, unstyled UI — functional, not designed
- ❌ Safety/distress copy is a placeholder — **do not launch without a real,
  legally-reviewed support message** (see `packages/shared/src/systemPrompt.ts`)
- ❌ Hongbao prize odds/inventory in `apps/api/src/routes/hongbao.ts` are
  invented placeholders, not real numbers

## Getting started

Requires Node.js 20+.

```bash
npm install

# Terminal 1: backend
cp apps/api/.env.example apps/api/.env
# then edit apps/api/.env and add your ANTHROPIC_API_KEY
npm run dev:api

# Terminal 2: frontend
npm run dev:web
```

Open http://localhost:3000, take the quiz, then chat with your matched lion.

### About the Claude API key

The chat endpoint calls the **Claude API directly** — this is billed
pay-as-you-go and is **separate from any claude.ai or Claude Code
subscription**. Get a key from the Claude Console. Keep this production key
out of whatever environment you use for *coding* the app with Claude Code, so
billing doesn't mix (see `docs/technical-build-plan.md` Section 8).

## Next steps

See `docs/technical-build-plan.md` Section 6 (phased timeline) and Section 10
(master open items) for what's left before this can launch.
