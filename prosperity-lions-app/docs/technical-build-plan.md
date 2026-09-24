# Prosperity Lions: Technical Build Plan (v0.1 Draft)

Pulls together the Character Bible, Personality Quiz, Chat Flow and Game Concept into a plan a developer or agency can build from. Items marked **[TBC]** need a decision from you or your team.

---

## 1. What's Being Built

A **mobile-first web app (PWA)**, opened via QR code, with five phases of guest experience:

1. Personality quiz → matched to one of 5 lions
2. Chat with the matched lion (character, promos, fortune, hongbao)
3. Lion dance rhythm game
4. Lucky Points → prize/hongbao draws
5. QR check-ins at tenant venues (footfall driver)

**Not a native app.** No install friction, works instantly from a QR scan, faster to ship and update mid-campaign.

---

## 2. Guiding Principles for the Build

- **The LLM narrates, the server decides.** Prizes, points, offers and unlocks are all deterministic server logic. The LLM never invents facts, prices or winners — it only speaks in character about results it's given.
- **Content is data, not code.** Venues, offers, fortunes, and beatmaps live in a database/CMS your marketing team can edit without a developer.
- **Cheap by default.** Small model for chat, cached static content, capped daily messages, scripted (non-LLM) reactions for the game.
- **Everything ships behind a phased plan.** MVP first (quiz + chat + basic rewards), game and venue stages as a mid-CNY update if needed.

---

## 3. System Architecture (high level)

```
                        ┌─────────────────────────┐
                        │   Guest's Phone (PWA)    │
                        │  Quiz · Chat UI · Game    │
                        └────────────┬─────────────┘
                                     │ HTTPS
                        ┌────────────▼─────────────┐
                        │      Backend API          │
                        │  (guest, points, rewards,  │
                        │   promos, venues, game)    │
                        └───┬──────────┬────────────┘
                            │          │
                 ┌──────────▼───┐  ┌───▼─────────────┐
                 │  Claude API   │  │   Database       │
                 │ (chat, tools) │  │ (guests, lions,   │
                 └───────────────┘  │  venues, promos,  │
                                     │  points, prizes)  │
                                     └───────────────────┘
                                             │
                                  ┌──────────▼───────────┐
                                  │  Admin / CMS Panel    │
                                  │ (marketing edits      │
                                  │  promos & fortunes)   │
                                  └───────────────────────┘
```

**Key components:**
- **Frontend:** PWA (e.g. React/Next.js), mobile-first, works offline for the game's static assets.
- **Backend API:** owns guest state, points, prize logic, promo data, venue data; calls Claude API for chat with tool definitions (promotions, venues, fortune, hongbao).
- **Database:** guests (anonymous ID + quiz result + points, no names required), lions/content, venues, promotions, prize inventory, redemption logs.
- **Admin panel:** lets your team add/edit promos and monitor redemptions without touching code.
- **QR system:** unique per venue, scanned to check in (triggers points + unlocks).

---

## 4. Data Model (core entities)

| Entity | Key fields |
|---|---|
| **Guest** | anonymous_id, matched_lion, quiz_answers, points_balance, bond_level, created_at, language |
| **Lion** | id, name, colour, personality, voice_rules, power, favourite_venue_ids, system_prompt |
| **Venue** | id, name, type (restaurant/attraction/hotel/retail), description, champion_lion_id, dietary_tags, qr_code_id |
| **Promotion** | id, venue_id, title, description, valid_from, valid_to, terms, redemption_method, stock |
| **Fortune** | id, lion_id, blessing_text, theme, lucky_element |
| **Redemption** | id, guest_id, promo_id, redeemed_at, venue_confirmed |
| **PointsLedger** | id, guest_id, action, points, timestamp, capped_flag |
| **PrizeDraw** | id, guest_id, tier, item, code, expiry, terms, awarded_at |
| **GameScore** | id, guest_id, song_id, difficulty, stars, coins, timestamp |

**Privacy note:** design so no name, phone number or email is required to play. If you later want guests to claim physical prizes, collect only what's needed for that single step, separately from chat data. **[TBC: confirm with legal/PDPA requirements for Singapore.]**

---

## 5. Claude API Integration

- **Chat:** one Claude API call per guest turn, with the matched lion's system prompt (from the Character Bible template) plus tool definitions.
- **Tools exposed to the model:**
  - `get_promotions(date, venue?, category?)`
  - `get_venues(category?, dietary?, group_type?)`
  - `get_fortune(lion_id, theme?)`
  - `request_hongbao(guest_id)` — server decides, model only narrates
  - `award_points(action)` — server enforces caps
- **Model choice:** use a smaller/cheaper model for everyday chat; reserve a larger model only if needed for complex reasoning. Test both for character consistency.
- **Cost controls:** daily message cap per guest, short max output tokens, cache static context (venue list, CNY facts) rather than resending it every turn.
- **This part uses the Claude API, billed separately from any Claude.ai subscription** — budget based on expected daily active users × average messages.

---

## 6. Build Phases and Timeline

Working backwards from **Chinese New Year 2027 (~6 Feb 2027)**. Today is 25 Sep 2026, giving about **19 weeks**.

| Phase | Weeks | Deliverables |
|---|---|---|
| **0. Finalise content** | 1-3 | Character bible sign-off, quiz pilot results, venue/promo data finalised, legal review of prize mechanic |
| **1. MVP build** | 3-9 | Quiz, lion matching, chat (with tool calls), basic rewards (points, hongbao), admin panel v1 |
| **2. Game build (parallel)** | 3-11 | Rhythm game prototype → art/music integration → 5 lions with powers |
| **3. Integration & QA** | 10-14 | Game + chat + points unified, QR check-in flow, device testing, accessibility pass |
| **4. Pilot & fix** | 14-16 | Internal/staff pilot, load testing, bug fixes, tenant staff training on redemption |
| **5. Launch prep** | 16-18 | Marketing QR placement, final content load, monitoring dashboards live |
| **6. Launch** | ~18-19 (~late Jan) | Go live ahead of CNY (6 Feb 2027) |
| **7. Phase 2 update** | Mid-CNY | Venue stages, Daily Challenge, outfits, family mode (from game concept) |

**Critical path risk:** art and music for the game have the longest lead time — brief designers/composer/lion dance troupe by **Week 2**, not after the MVP is done.

---

## 7. Team You'll Likely Need

| Role | Why |
|---|---|
| Product owner (you) | Content decisions, tenant coordination, priorities |
| 1-2 full-stack developers | App, backend, Claude API integration, admin panel |
| Game developer (Phaser/PixiJS) | Rhythm game build |
| Illustrator/animator | 5 lion character rigs, stages, UI art |
| Composer/audio | Lion dance percussion tracks, SFX |
| Cultural/language reviewer | Fortunes, quiz wording, lion dance accuracy |
| Legal/compliance advisor | Prize mechanic, PDPA data handling |
| QA/testers | Device testing, playtesting with families |

A small agency or a mixed in-house + freelance team can realistically hit this timeline; a solo developer using Claude Code can build the MVP chat/quiz portion but the game art/audio will still need dedicated specialists.

---

## 8. Should You Use Claude Code for This?

Yes, for the build itself:
- Scaffolding the PWA, backend API, admin panel, and chat integration are all things Claude Code can accelerate significantly.
- The **game** (Phaser/PixiJS rhythm mechanics) is also codeable this way, though **art and audio assets are not** — those need designers/composers regardless of how you code.
- Keep production Claude **API keys** (for the live guest-facing chat) separate from whatever account you use for coding, so billing doesn't mix.

**Plan-wise:** you're currently exploring on Free. Once you start actual coding (Phase 1 onward, ~Week 3), move to **Pro** at minimum so you're not blocked mid-session; upgrade to **Max only if you're coding daily and hitting limits regularly**. The live app's chat will run on a **separate pay-as-you-go API account**, budgeted separately.

---

## 9. Success Metrics Dashboard (recommend building this early)

- Quiz completions, lion distribution (balance check)
- Chat sessions, messages per guest, topic breakdown
- Offers shown vs. redeemed, by venue (tenant fairness)
- QR check-ins per venue (the core footfall metric)
- Game plays, average stars per lion (balance check)
- Hongbao/prize draws vs. redemptions
- Cost per active guest (Claude API spend / DAU)

---

## 10. Master Open Items List

Consolidated from all four documents — work through these with your team before Phase 0 closes:

- [ ] Pronouns, official catchphrases, lion relationships **[Character Bible]**
- [ ] Hotel & retail venue assignments **[Character Bible]**
- [ ] Chinese characters/spelling sign-off **[Character Bible]**
- [ ] Quiz pilot (50-100 people) and cultural sensitivity review **[Quiz]**
- [ ] Illustration brief for quiz scenes and result cards **[Quiz]**
- [ ] Legal review of the prize/lucky-draw mechanic **[Chat Flow, Game]**
- [ ] Approved distress/support message for your region **[Chat Flow]**
- [ ] Daily message cap and Lucky Points values **[Chat Flow, Game]**
- [ ] Blessing/fortune list reviewed by a Chinese-language reviewer **[Chat Flow]**
- [ ] Contact point for "I don't know" answers (desk/hotline) **[Chat Flow]**
- [ ] Collecting model: buddy-only vs. borrow-via-checkin **[Game]**
- [ ] Lion dance troupe partner for motion/music reference **[Game]**
- [ ] Tenant approval for venue-themed stages and QR placement **[Game]**
- [ ] PDPA/data privacy review for guest data handling **[This doc]**
- [ ] Confirm team/agency and budget **[This doc]**

---

## 11. Immediate Next Steps (this week)

1. Share the four documents with your leadership/marketing team for sign-off direction.
2. Start the quiz pilot in parallel with development planning — it doesn't need code.
3. Brief a designer/illustrator on the lion character sheets so art production starts now.
4. Loop in legal on the prize mechanic and data handling early — this is the item most likely to cause delays if left late.
5. Decide on team/agency and lock the Phase 0-1 timeline against the Feb 2027 date.
