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
The game MVP lives at `apps/web/src/app/game/page.tsx` (plain React + the Web
Audio API, not Phaser/PixiJS yet — see "Status" below for what that means).

## Status: what actually works right now

- ✅ Quiz scoring and lion matching (`apps/api/src/routes/quiz.ts`)
- ✅ Chat endpoint calling the real Claude API with tool use for promotions,
  venues, fortunes and hongbao (`apps/api/src/routes/chat.ts`)
- ✅ In-memory data for lions, venues, one example promotion, and placeholder
  fortunes/prizes
- ✅ **Storybook-style quiz UI** — one illustrated scene per question, a
  page-turn card, progress dots, and a result page with the matched lion's
  portrait (`apps/web/src/app/quiz/page.tsx`)
- ✅ Chat UI shows the matched lion's portrait in the header, with the
  default quick-reply chips from `docs/chat-conversation-flow.md`
  (`apps/web/src/app/chat/page.tsx`)
- ✅ **Placeholder character art** — 5 lion portraits (`apps/web/public/lions/`)
  and 8 quiz scene illustrations (`apps/web/public/scenes/`), all original
  SVG, drawn as stand-ins until real illustrations are ready. Swap by
  replacing the same filenames; nothing else needs to change.
- ✅ **Lion Dance Party rhythm game MVP** — a real, playable game at `/game`
  (`apps/web/src/app/game/page.tsx`): 3 songs, easy/normal/hard difficulty,
  falling-note track, synthesized drum/cymbal/gong percussion (no audio files
  yet, see `apps/web/src/lib/percussion.ts`), a Prosperity Meter and all 5
  lion powers/passives from `docs/game-concept.md` Section 4, and a results
  screen. Scores post to `POST /api/game/score`
  (`apps/api/src/routes/game.ts`), which computes stars/coins **server-side**
  from submitted accuracy — the client can't award itself a score. Known MVP
  gaps, not hidden: on-screen tap/swipe/hold buttons stand in for real
  gesture input, hold notes judge on press timing only, beatmaps are
  pattern-generated rather than hand-charted (`apps/web/src/lib/beatmap.ts`),
  there's one stage/look (no venue-unlock stages yet), and there's no latency
  calibration screen.
- ✅ **Quiz, chat and game are connected through one guest record**: the quiz
  creates a `guestId` (stored in `localStorage` and server-side in
  `apps/api/src/data/store.ts`) that both the chat and the game read, so
  you're always chatting with and playing as your matched lion. Chat actions
  and game rounds feed the **same Lucky Points balance**
  (`GET /api/points/:guestId`), shown live in the chat header and on the
  game's song-select screen. If you played a round in the last 30 minutes,
  the lion knows about it in chat and can react to it once
  (`recentGameSummary` in `apps/api/src/routes/chat.ts`, wired into
  `packages/shared/src/systemPrompt.ts`) — it won't invent a score, only
  reference what the server actually recorded. Fixed in the same pass: the
  chat frontend wasn't sending prior turns back to the API, so every message
  started with no memory of the conversation so far; it now sends (and the
  API now correctly returns) the last ~20 turns.
- ❌ No database — guest state resets on server restart
  (`apps/api/src/data/store.ts` is explicitly a placeholder)
- ❌ No admin panel to edit promos
- ❌ No QR check-in flow
- ❌ Safety/distress copy is a placeholder — **do not launch without a real,
  legally-reviewed support message** (see `packages/shared/src/systemPrompt.ts`)
- ❌ Hongbao prize odds/inventory in `apps/api/src/routes/hongbao.ts` are
  invented placeholders, not real numbers
- ⚠️ Not yet run through a live `npm install`/build in this repo's own CI —
  verify with `npm install` locally before relying on it

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

## Replacing the placeholder art

`apps/web/public/lions/*.svg` (5 files) and `apps/web/public/scenes/*.svg`
(8 files) are original placeholder illustrations, not final character art.
To swap in real art, replace the file at the same path and filename (e.g.
`lions/hong_hong.svg`) — the app references them by path, so nothing else
needs to change. PNG/JPG/WebP work too; just update the `src` extension in
`apps/web/src/app/quiz/page.tsx`, `chat/page.tsx` and `page.tsx` if you
switch formats.

## Next steps

See `docs/technical-build-plan.md` Section 6 (phased timeline) and Section 10
(master open items) for what's left before this can launch.
