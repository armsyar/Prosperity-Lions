# Prosperity Lions: Lion Dance Game Concept (v0.1 Draft)

Companion to the Character Bible, Personality Quiz and Chat Flow. Items marked **[TBC]** need a decision.

---

## 1. The Concept in One Paragraph

**"Lion Dance Party"** is a 60-90 second **rhythm game** played on the guest's phone. Drum, cymbal and gong beats travel toward a hit zone, and the guest taps, swipes and holds in time to make their baby lion perform real lion dance moves: leaping, bowing, shaking its head and plucking the lucky greens. Every lion has its own **power** that charges as the guest builds a combo. The better the performance, the more the lion "brings prosperity", earning Lucky Points, unlocks and a chance at hongbao.

**Why a rhythm game?** Lion dance is already built on drum rhythm. It's quick to learn, easy to play one-handed, and 90 seconds suits guests waiting in a queue.

---

## 2. Design Goals

1. **Fun in 10 seconds.** No reading. A first-time player should be tapping correctly within one round.
2. **Feels like a lion dance.** Real moves, real percussion, authentic to the tradition.
3. **Each lion feels different** but none is "the best". Powers change the playstyle, not the ceiling.
4. **Drives footfall.** Some unlocks require visiting the resort in person.
5. **Ships by CNY.** A small, polished MVP beats a large, unfinished game.

---

## 3. Core Gameplay

### Controls (3 inputs only)

| Input | On-screen note | Lion move |
|---|---|---|
| **Tap** | Drum note | Head shake and step |
| **Swipe up** | Leap note | Jump onto the plum-blossom poles |
| **Hold** | Long note | Bow and pluck the lucky greens (*cai qing*) |

### Scoring
- Each note is judged **Perfect / Good / Miss**.
- Consecutive hits build a **combo**, which fills the **Prosperity Meter**.
- When the meter is full, the guest taps the lion's **Power Button** to trigger it (see Section 4).
- The round ends with a **1-3 star rating** and a coin total.

### Round Flow
```
Pick song → Quick tutorial (first time only) → Countdown → Play (60-90s)
   → Results (stars + coins) → Lion reacts in character
   → Lucky Points awarded (capped) → Chips: Play again / Chat with my lion / Try another song
```

### Difficulty
- **Kids:** fewer notes, wider timing window, gentler pace.
- **Easy:** the default for most guests.
- **Hard:** unlocked after 3 stars on Easy.

---

## 4. Lion Powers ("Moves")

Every lion has **one power** (from the character bible) and **one passive trait**. Numbers are placeholders to tune in playtests.

| Lion | Power | What it does | Passive trait |
|---|---|---|---|
| **Hong Hong** (red) | **Fiery Charge** | For 6 seconds, every hit counts double and the lion smashes through flame obstacles | Streaks of leap notes charge the meter faster |
| **Rui Rui** (yellow) | **Lucky Toss** | Showers golden ingots: a random bonus multiplier (x1.5 to x3) for 6 seconds | Random coin sparkles appear on some notes |
| **Xing Xing** (green) | **Curious Dash** | Reveals hidden bonus notes for 8 seconds. About 1 in 5 activations, the lion trips: cosmetic only, and the effect is shortened | Occasionally spots secret coins off the beat track |
| **Xi Xi** (pink) | **Heart Hug** | The next missed note is forgiven, and half the combo is restored | A miss only halves the combo instead of resetting it |
| **Zhi Zhi** (blue) | **Calm Focus** | The timing window widens and notes slow slightly for 8 seconds | Starts each round with a slightly wider timing window |

**Balance rule:** playtest until all five lions have roughly the same average star rating. A lion should feel different, not stronger.

---

## 5. Progression: Bond, Not Grind

To keep the Pokémon/Tamagotchi feeling, the lion grows with the guest. It must never feel punishing.

- **Bond Level:** rises with chatting, playing, check-ins and daily visits. Higher levels unlock a small **power upgrade**, a new **CNY outfit or accessory** (e.g. lantern hat, gold sash), a **special fortune** and a new chat line.
- **Daily Treat:** a simple tap to give the lion a mandarin orange or pineapple tart. It reacts happily. This is **a light Tamagotchi-style touch, with no hunger or death mechanic and no penalty for absence**.
- **No punishment:** the lion never sulks or guilt-trips when a guest is away.

**Decision [TBC]: collecting.** Should guests keep only their matched lion, or also unlock the others?
- *Recommended:* the matched lion is the guest's **buddy** and is always free. The other four lions can be **borrowed** for the game by checking in at their favourite venue (e.g. Hong Hong unlocks at Universal Studios Singapore, Zhi Zhi at the Oceanarium). This adds a reason to visit and to explore the resort while keeping the buddy relationship simple.

---

## 6. Stages, Modes and the Footfall Link

| Stage | Look and feel | How to unlock |
|---|---|---|
| **Reunion Street** | Festive lanterns, market stalls (tutorial and default) | Free |
| **Splash Party** | Waterpark-inspired, bright and bubbly | Check in at Adventure Cove Waterpark |
| **Deep Blue** | Ocean-inspired, glowing and calm | Check in at the Oceanarium |
| **Thrill Night** | Neon, fast and loud | Check in at Universal Studios Singapore |
| **Grand Finale** | The full lion dance stage | Reach a Bond Level, or collect all stages |

- Stages use **generic, resort-inspired themes**, not brand or film imagery, to avoid IP approvals **[TBC: check with each tenant]**.
- Each check-in is a **QR scan on-site**, which also awards Lucky Points and is a footfall metric you can track per venue.

**Modes**
- **Phase 1 (launch):** Solo Rehearsal (3 songs).
- **Phase 2 (mid-CNY):** Daily Challenge (one song, one attempt, a global leaderboard), the venue stages above, and a **family two-player mode** (same phone, take turns).
- **Later:** friend **dance-off** (compare scores asynchronously), seasonal songs.

---

## 7. Rewards Integration

- **Lucky Points:** e.g. +5 per round, **capped at 3 rounds a day** **[TBC: aligned with the chat-flow point table]**. Points come from *playing*, not from *high scores*, so nobody feels shut out.
- **Hongbao chance:** completing the Daily Challenge or a stage unlocks a hongbao draw. The server decides the prize, as in the chat flow.
- **Anti-cheat:** the server validates that submitted scores are plausible before awarding anything.
- **Lion reactions** are scripted (fast and free), not LLM-generated, for speed and cost:
  - **Great run:** Hong Hong: "That was AMAZING! Charge!" · Zhi Zhi: "Um… wow. That was, uh, really good."
  - **Rough run:** Xi Xi: "That's okay, come here, big hug. Let's try again!" · Rui Rui: "Hehe, the drums were ticklish today. Again?"

---

## 8. Look, Sound and Feel

- **Art style:** bright, cute, chunky 2D. Each lion is instantly recognisable by its colour and silhouette.
- **Music:** original **lion dance percussion** (drum, cymbal, gong) with light modern layers per stage. Record with, or get reviewed by, a **local lion dance troupe** for authenticity **[TBC]**.
- **Feedback:** squash-and-stretch animation, confetti on Perfect hits, haptic buzz on hit, a satisfying drum sound.
- **Real moves as reference:** plum-blossom pole jumps, the bow, the head shake, the *cai qing* plucking. Motion reference from a real troupe makes it feel right.

---

## 9. Accessibility and Safety

- **Sound optional:** every beat also has a visual pulse and haptic cue, so guests can play in a queue with the sound off.
- **Volume warning** and a mute button on the first screen.
- Simple **one-handed** controls with large tap zones. **Kids and seniors mode** with a wider timing window.
- **Calibration screen:** a quick tap-test to adjust for audio latency on each phone.
- No flashing patterns above safe thresholds; avoid rapid strobe effects.
- Never asks for names or personal details.

---

## 10. Technical Approach

- **Web game inside the PWA**, built with **Phaser** or **PixiJS** (HTML5 canvas), so no separate download.
- **Timing:** use the Web Audio API clock (not frame time) as the source of truth for beat timing.
- **Beatmaps:** JSON files (time, lane, note type) per song and difficulty. Easy to author and tweak.
- **Animation:** one shared lion **skeleton rig** (Spine or similar) reused for all five lions, with per-lion recolour and head/accessory swaps.
- **Performance:** must run smoothly on mid-range phones. Keep the initial download small (target under about 10 MB, load stages on demand).
- **Server:** score validation, Lucky Points caps, unlock state, leaderboard.

---

## 11. Art and Asset List

**Per lion (5):** idle, hit, leap, bow, head shake, power move, win, miss (about 8 animations). Cheapest approach: shared rig, unique colours/heads.

**Environment:** 1 stage at launch (Reunion Street), 3-4 more in phase 2.

**Other:** UI kit, note icons, hit effects, results screen, 5 outfit accessories (phase 2), lion portraits for results and chat.

**Audio:** 3 songs at launch, plus sound effects and a victory jingle.

*Art is the longest lead-time item. Brief designers and the troupe/composer early.*

---

## 12. MVP Scope and Rough Timeline

**MVP (launch):** one rhythm mode, 5 playable lions with powers, 3 songs, 2 difficulty levels plus Kids, one stage, results screen, Lucky Points integration, latency calibration, sound-off support.

**Phase 2 (mid-CNY update):** venue stages with check-in unlocks, Daily Challenge, outfits, family two-player mode.

| Weeks | Work |
|---|---|
| 1-3 | Grey-box prototype: notes, timing, scoring, one lion. Playtest the *feel* |
| 3-8 | Art and music in production. Add all 5 powers |
| 8-11 | Integrate with the app, points and server validation. Tune balance |
| 11-13 | Device testing, accessibility, playtests with families |
| 14+ | Launch, then phase 2 |

*Back-plan from the CNY date (about 6 Feb 2027) once the dev team is chosen.*

**Fallback if time runs short:** launch with 1 song, 1 stage and powers for all lions, then add songs in updates.

---

## 13. Success Metrics

- Play rate (% of app users who play at least once) and rounds per user
- Completion rate of a first round (tutorial clarity)
- Average stars per lion (balance check)
- Check-ins per venue (footfall link)
- Hongbao redemptions from game-linked draws
- Crash rate and latency issues by device

---

## 14. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Rhythm timing drifts on some phones | Calibration screen, Web Audio clock, wide Kids window |
| Art scope too large | Shared rig, one stage at launch, 3 songs only |
| Loud audio in public spaces | Sound-off play with visual and haptic cues |
| Tenant IP approvals for stage themes | Use generic resort-inspired themes |
| One lion feels overpowered | Playtest for equal average stars; tune numbers |
| Cultural inaccuracy in moves or music | Work with a local lion dance troupe for review |

---

## 15. Open Items

- [ ] Collecting model: buddy only, or borrow other lions via check-ins **[TBC]**
- [ ] Lion dance troupe partner for motion reference and music **[TBC]**
- [ ] Final Lucky Points values and caps, aligned with the chat flow **[TBC]**
- [ ] Tenant approval for venue-themed stages and check-in QR placement **[TBC]**
- [ ] Composer or music sourcing for the 3 launch songs **[TBC]**
