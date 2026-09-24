"use client";

// Lion Dance Party - the rhythm game from docs/game-concept.md.
//
// MVP simplifications, documented rather than hidden:
// - 3 on-screen buttons (Tap / Swipe / Hold) stand in for real gesture
//   detection (Section 3 lists tap/swipe-up/hold as the 3 input types).
// - Hold notes are judged on press timing only, not release timing.
// - One stage (Reunion Street look), no venue-unlock stages yet (Section 6).
// - No latency calibration screen yet (Section 9 lists this as a TBC).
// - Beatmaps are generated on the fly (see src/lib/beatmap.ts), not hand
//   authored/reviewed by a lion dance troupe (Section 11).
// - Stars and coins are always computed by the SERVER from submitted
//   accuracy, per the "Anti-cheat" rule in Section 7 - the client never
//   sends itself a score.

import { useEffect, useRef, useState } from "react";
import {
  APPROACH_MS,
  BeatmapNote,
  Difficulty,
  NoteType,
  SONGS,
  Song,
  TIMING_WINDOWS,
  generateBeatmap
} from "../../lib/beatmap";
import { playCymbal, playDrum, playGong, playMissThud, playPerfectChime } from "../../lib/percussion";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

type PowerKind = "double" | "lucky_toss" | "curious_dash" | "heart_hug" | "calm_focus";

const LION_POWER: Record<
  string,
  { name: string; description: string; kind: PowerKind; durationMs: number }
> = {
  hong_hong: {
    name: "Fiery Charge",
    description: "Every hit counts double for 6 seconds.",
    kind: "double",
    durationMs: 6000
  },
  rui_rui: {
    name: "Lucky Toss",
    description: "A random bonus multiplier (x1.5-x3) for 6 seconds.",
    kind: "lucky_toss",
    durationMs: 6000
  },
  xing_xing: {
    name: "Curious Dash",
    description: "Reveals hidden bonus coins for 8 seconds.",
    kind: "curious_dash",
    durationMs: 8000
  },
  xi_xi: {
    name: "Heart Hug",
    description: "Forgives your next miss and keeps your combo going.",
    kind: "heart_hug",
    durationMs: 0
  },
  zhi_zhi: {
    name: "Calm Focus",
    description: "Widens the timing window for 8 seconds.",
    kind: "calm_focus",
    durationMs: 8000
  }
};

type Judgement = "perfect" | "good" | "miss";

interface NoteState {
  note: BeatmapNote;
  judged: Judgement | null;
}

type Phase = "select" | "countdown" | "playing" | "results";

const NOTE_LABEL: Record<NoteType, string> = { tap: "TAP", swipe: "^", hold: "HOLD" };
const NOTE_CLASS: Record<NoteType, string> = { tap: "note-tap", swipe: "note-swipe", hold: "note-hold" };

export default function GamePage() {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [lionId, setLionId] = useState<string | null>(null);
  const [lionName, setLionName] = useState<string>("");
  const [points, setPoints] = useState<number | null>(null);

  const [phase, setPhase] = useState<Phase>("select");
  const [songId, setSongId] = useState<string>(SONGS[0].id);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [hardUnlocked, setHardUnlocked] = useState(false);
  const [muted, setMuted] = useState(false);

  const [countdown, setCountdown] = useState(3);
  const [combo, setCombo] = useState(0);
  const [meter, setMeter] = useState(0);
  const [roundCoins, setRoundCoins] = useState(0);
  const [flash, setFlash] = useState<{ text: string; key: number } | null>(null);
  const [powerReady, setPowerReady] = useState(false);
  const [powerActive, setPowerActive] = useState(false);

  const [result, setResult] = useState<{
    stars: number;
    coins: number;
    pointsAwarded: number;
    pointsBalance: number;
    reaction: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const songRef = useRef<Song>(SONGS[0]);
  const rafRef = useRef<number | null>(null);

  const notesStateRef = useRef<NoteState[]>([]);
  const noteElRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const trackElRef = useRef<HTMLDivElement | null>(null);
  const progressFillRef = useRef<HTMLDivElement | null>(null);

  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const meterRef = useRef(0);
  const roundCoinsRef = useRef(0);
  const perfectCountRef = useRef(0);
  const goodCountRef = useRef(0);
  const missCountRef = useRef(0);
  const judgedCountRef = useRef(0);
  const forgivenessArmedRef = useRef(false);
  const powerMultiplierRef = useRef(1);
  const powerActiveUntilRef = useRef(-1);
  const powerUsedRef = useRef(false);
  const flashKeyRef = useRef(0);

  useEffect(() => {
    const gid = localStorage.getItem("guestId");
    setGuestId(gid);
    setLionId(localStorage.getItem("lionId"));
    setLionName(localStorage.getItem("lionName") ?? "");
    setHardUnlocked(localStorage.getItem("hardUnlocked") === "1");
    if (gid) {
      fetch(`${API_BASE}/api/points/${gid}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => data && setPoints(data.pointsBalance ?? null))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  const power = lionId ? LION_POWER[lionId] : null;

  function resetRoundRefs() {
    comboRef.current = 0;
    maxComboRef.current = 0;
    meterRef.current = 0;
    roundCoinsRef.current = 0;
    perfectCountRef.current = 0;
    goodCountRef.current = 0;
    missCountRef.current = 0;
    judgedCountRef.current = 0;
    forgivenessArmedRef.current = false;
    powerMultiplierRef.current = 1;
    powerActiveUntilRef.current = -1;
    powerUsedRef.current = false;
    setCombo(0);
    setMeter(0);
    setRoundCoins(0);
    setPowerReady(false);
    setPowerActive(false);
    setFlash(null);
  }

  async function startRound() {
    const song = SONGS.find((s) => s.id === songId) ?? SONGS[0];
    songRef.current = song;
    resetRoundRefs();

    const beatmap = generateBeatmap(song, difficulty);
    notesStateRef.current = beatmap.map((note) => ({ note, judged: null }));
    noteElRefs.current = new Map();

    const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
    const ctx: AudioContext = new AudioContextCtor();
    await ctx.resume();
    const master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.8;
    master.connect(ctx.destination);
    audioCtxRef.current = ctx;
    masterGainRef.current = master;

    setPhase("countdown");
    setCountdown(3);
    let n = 3;
    const iv = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(iv);
        beginPlaying(ctx, master, song, beatmap);
      } else {
        setCountdown(n);
      }
    }, 800);
  }

  function beginPlaying(ctx: AudioContext, master: GainNode, song: Song, beatmap: BeatmapNote[]) {
    const leadSec = 0.35;
    startTimeRef.current = ctx.currentTime + leadSec;

    for (const note of beatmap) {
      const t = startTimeRef.current + note.time / 1000;
      if (note.type === "tap") playDrum(ctx, master, t);
      else if (note.type === "swipe") playCymbal(ctx, master, t);
      else playGong(ctx, master, t, (note.holdMs ?? 800) / 1000);
    }

    setPhase("playing");
    rafRef.current = requestAnimationFrame(() => frameLoop());
  }

  function getEffectiveWindows(songTimeMs: number, lion: string | null) {
    const base = TIMING_WINDOWS[difficulty];
    const passiveBonus = lion === "zhi_zhi" ? 15 : 0;
    const isPowerActive = songTimeMs < powerActiveUntilRef.current;
    const activeBonus = isPowerActive && power?.kind === "calm_focus" ? 45 : 0;
    return {
      perfect: base.perfect + passiveBonus + activeBonus,
      good: base.good + passiveBonus + activeBonus,
      isPowerActive
    };
  }

  function registerJudgement(judge: Judgement, type: NoteType) {
    let effective = judge;
    if (effective === "miss" && forgivenessArmedRef.current) {
      forgivenessArmedRef.current = false;
      effective = "good";
    }

    judgedCountRef.current += 1;

    // Timed powers (Fiery Charge, Lucky Toss, Curious Dash) are active
    // whenever the round is inside their activation window.
    const timedPowerActive = powerActiveUntilRef.current > -1;
    const scoreMultiplier =
      timedPowerActive && (power?.kind === "double" || power?.kind === "lucky_toss") ? powerMultiplierRef.current : 1;
    const bonusCoins = timedPowerActive && power?.kind === "curious_dash" ? 4 : 0;

    if (effective === "perfect") {
      perfectCountRef.current += 1;
      comboRef.current += 1;
      let meterGain = 14;
      if (lionId === "hong_hong" && type === "swipe") meterGain += 5; // passive: leap streaks charge faster
      meterRef.current = Math.min(100, meterRef.current + meterGain);
      roundCoinsRef.current += Math.round(10 * scoreMultiplier) + bonusCoins;
    } else if (effective === "good") {
      goodCountRef.current += 1;
      comboRef.current += 1;
      meterRef.current = Math.min(100, meterRef.current + 7);
      roundCoinsRef.current += Math.round(5 * scoreMultiplier) + bonusCoins;
    } else {
      missCountRef.current += 1;
      // Xi Xi passive: a miss only halves the combo instead of resetting it.
      comboRef.current = lionId === "xi_xi" ? Math.floor(comboRef.current / 2) : 0;
    }
    maxComboRef.current = Math.max(maxComboRef.current, comboRef.current);

    setCombo(comboRef.current);
    setMeter(meterRef.current);
    setRoundCoins(roundCoinsRef.current);
    setPowerReady(meterRef.current >= 100);
    flashKeyRef.current += 1;
    setFlash({
      text: effective === "perfect" ? "Perfect!" : effective === "good" ? "Good!" : "Miss",
      key: flashKeyRef.current
    });

    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (ctx && master) {
      if (effective === "perfect") playPerfectChime(ctx, master, ctx.currentTime);
      else if (effective === "miss") playMissThud(ctx, master, ctx.currentTime);
    }
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(effective === "miss" ? 30 : 12);
    }
  }

  function handleInput(type: NoteType) {
    if (phase !== "playing" || !audioCtxRef.current) return;
    const songTimeMs = (audioCtxRef.current.currentTime - startTimeRef.current) * 1000;
    const { perfect, good } = getEffectiveWindows(songTimeMs, lionId);

    let best: NoteState | null = null;
    let bestDiff = Infinity;
    for (const ns of notesStateRef.current) {
      if (ns.judged || ns.note.type !== type) continue;
      const diff = Math.abs(songTimeMs - ns.note.time);
      if (diff <= good && diff < bestDiff) {
        best = ns;
        bestDiff = diff;
      }
    }
    if (!best) return; // no note in range - ignored, no penalty for an extra tap

    best.judged = bestDiff <= perfect ? "perfect" : "good";
    const el = noteElRefs.current.get(best.note.id);
    if (el) el.style.display = "none";
    registerJudgement(best.judged, type);
  }

  function activatePower() {
    if (!power || meterRef.current < 100 || phase !== "playing" || !audioCtxRef.current) return;
    const songTimeMs = (audioCtxRef.current.currentTime - startTimeRef.current) * 1000;
    meterRef.current = 0;
    powerUsedRef.current = true;
    setPowerReady(false);
    setMeter(0);

    if (power.kind === "heart_hug") {
      forgivenessArmedRef.current = true;
    } else {
      powerMultiplierRef.current = power.kind === "lucky_toss" ? 1.5 + Math.random() * 1.5 : 2;
      powerActiveUntilRef.current = songTimeMs + power.durationMs;
      setPowerActive(true);
    }
    flashKeyRef.current += 1;
    setFlash({ text: `${power.name}!`, key: flashKeyRef.current });
  }

  function frameLoop() {
    const ctx = audioCtxRef.current;
    const song = songRef.current;
    if (!ctx) return;
    const songTimeMs = (ctx.currentTime - startTimeRef.current) * 1000;
    const { good } = getEffectiveWindows(songTimeMs, lionId);
    if (powerActiveUntilRef.current > -1 && songTimeMs >= powerActiveUntilRef.current) {
      powerActiveUntilRef.current = -1;
      setPowerActive(false);
    }

    for (const ns of notesStateRef.current) {
      const el = noteElRefs.current.get(ns.note.id);
      if (!el) continue;
      if (ns.judged) {
        el.style.display = "none";
        continue;
      }
      const progress = (songTimeMs - (ns.note.time - APPROACH_MS)) / APPROACH_MS;
      if (progress < -0.05) {
        el.style.display = "none";
        continue;
      }
      el.style.display = "flex";
      const topPct = Math.min(104, Math.max(-6, progress * 88));
      el.style.top = `${topPct}%`;
      el.style.opacity = progress > 1.2 ? "0" : "1";

      if (songTimeMs - ns.note.time > good) {
        ns.judged = "miss";
        el.style.display = "none";
        registerJudgement("miss", ns.note.type);
      }
    }

    if (progressFillRef.current) {
      progressFillRef.current.style.width = `${Math.min(100, (songTimeMs / song.durationMs) * 100)}%`;
    }

    if (songTimeMs > song.durationMs) {
      endRound();
      return;
    }
    rafRef.current = requestAnimationFrame(frameLoop);
  }

  async function endRound() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;

    const total = judgedCountRef.current;
    const accuracy = total > 0 ? (perfectCountRef.current + goodCountRef.current * 0.5) / total : 0;

    setPhase("results");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/game/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId,
          songId: songRef.current.id,
          difficulty,
          accuracy,
          maxCombo: maxComboRef.current,
          powerUsed: powerUsedRef.current
        })
      });
      const data = await res.json();
      if (res.ok) {
        setResult({
          stars: data.score.stars,
          coins: data.score.coins,
          pointsAwarded: data.pointsAwarded,
          pointsBalance: data.pointsBalance,
          reaction: data.reaction
        });
        setPoints(data.pointsBalance ?? null);
        if (difficulty === "easy" && data.score.stars >= 3 && typeof window !== "undefined") {
          localStorage.setItem("hardUnlocked", "1");
          setHardUnlocked(true);
        }
      } else {
        setResult({ stars: 0, coins: 0, pointsAwarded: 0, pointsBalance: 0, reaction: `Couldn't save that round: ${data.error ?? "unknown error"}` });
      }
    } catch {
      setResult({ stars: 0, coins: 0, pointsAwarded: 0, pointsBalance: 0, reaction: "Connection error - your round wasn't saved." });
    } finally {
      setSubmitting(false);
    }
  }

  function quitToMenu() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    setPhase("select");
    setResult(null);
  }

  if (!guestId || !lionId) {
    return (
      <main className="storybook-page">
        <div className="storybook-card" style={{ margin: "60px 16px", textAlign: "center" }}>
          <p className="storybook-prompt">Take the quiz first to get matched with a lion to play as.</p>
          <a href="/quiz" className="btn-primary">
            Go to quiz
          </a>
        </div>
      </main>
    );
  }

  // ---------- Song / difficulty select screen ----------
  if (phase === "select") {
    return (
      <main className="storybook-page">
        <div className="storybook-scene" style={{ background: "var(--cny-red)" }}>
          <img src={`/lions/${lionId}.svg`} alt={lionName} style={{ objectFit: "contain", padding: 20 }} />
        </div>
        <div className="storybook-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <p className="storybook-eyebrow">Lion Dance Party</p>
            {points !== null && (
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--cny-red-dark)" }}>🧧 {points} pts</span>
            )}
          </div>
          <h1 className="storybook-title">Dance with {lionName}!</h1>
          {power && (
            <p className="storybook-prompt" style={{ fontSize: 14, marginBottom: 16 }}>
              Power: <strong>{power.name}</strong> - {power.description}
            </p>
          )}

          <p className="storybook-eyebrow">Pick a song</p>
          <div className="option-list" style={{ marginBottom: 4 }}>
            {SONGS.map((s) => (
              <button
                key={s.id}
                className={`song-card${songId === s.id ? " is-selected" : ""}`}
                onClick={() => setSongId(s.id)}
              >
                <div>
                  <div className="song-title">{s.title}</div>
                  <div className="song-subtitle">{s.subtitle}</div>
                </div>
              </button>
            ))}
          </div>

          <p className="storybook-eyebrow" style={{ marginTop: 16 }}>
            Difficulty
          </p>
          <div className="difficulty-row">
            {(["easy", "normal", "hard"] as Difficulty[]).map((d) => {
              const locked = d === "hard" && !hardUnlocked;
              return (
                <button
                  key={d}
                  className={`difficulty-chip${difficulty === d ? " is-selected" : ""}${locked ? " is-locked" : ""}`}
                  onClick={() => !locked && setDifficulty(d)}
                  title={locked ? "Get 3 stars on Easy to unlock" : undefined}
                >
                  {d === "hard" && locked ? "🔒 Hard" : d[0].toUpperCase() + d.slice(1)}
                </button>
              );
            })}
          </div>

          <button className="btn-primary" style={{ width: "100%", marginTop: 8 }} onClick={startRound}>
            Start dancing
          </button>
        </div>
      </main>
    );
  }

  // ---------- Countdown / playing screens ----------
  if (phase === "countdown" || phase === "playing") {
    return (
      <main className="game-page">
        <div className="game-header">
          <button onClick={quitToMenu}>Quit</button>
          <div style={{ fontFamily: "Baloo 2, sans-serif", fontWeight: 700 }}>{songRef.current.title}</div>
          <button
            onClick={() => {
              const next = !muted;
              setMuted(next);
              if (masterGainRef.current) masterGainRef.current.gain.value = next ? 0 : 0.8;
            }}
          >
            {muted ? "🔇" : "🔊"}
          </button>
        </div>

        <div className="progress-track">
          <div className="progress-fill" ref={progressFillRef} />
        </div>

        <div className="prosperity-meter">
          <div className="prosperity-meter-fill" style={{ width: `${meter}%` }} />
        </div>

        <div style={{ textAlign: "center", fontSize: 13, marginTop: 6, opacity: 0.85 }}>
          Combo <strong>{combo}</strong> · Coins <strong>{roundCoins}</strong>
          {powerActive && power ? ` · ${power.name} active!` : ""}
        </div>

        <div className="game-track" ref={trackElRef}>
          <div className="hit-line" />
          {notesStateRef.current.map((ns) => (
            <div
              key={ns.note.id}
              ref={(el) => noteElRefs.current.set(ns.note.id, el)}
              className={`note ${NOTE_CLASS[ns.note.type]}`}
              style={{ display: "none" }}
            >
              {NOTE_LABEL[ns.note.type]}
            </div>
          ))}
          {flash && <div key={flash.key} className="judgement-flash">{flash.text}</div>}
          {phase === "countdown" && (
            <div className="countdown-number">{countdown > 0 ? countdown : "GO!"}</div>
          )}
        </div>

        <div className="game-controls">
          <button className="control-button tap" onPointerDown={() => handleInput("tap")}>
            TAP
          </button>
          <button className="control-button swipe" onPointerDown={() => handleInput("swipe")}>
            SWIPE
          </button>
          <button className="control-button hold" onPointerDown={() => handleInput("hold")}>
            HOLD
          </button>
          <button
            className={`power-button${powerReady ? " is-ready" : ""}`}
            onClick={activatePower}
            disabled={!powerReady}
          >
            {power?.name ?? "Power"}
          </button>
        </div>
      </main>
    );
  }

  // ---------- Results screen ----------
  return (
    <main className="storybook-page">
      <div className="storybook-scene" style={{ background: "var(--cny-gold)" }}>
        <img src={`/lions/${lionId}.svg`} alt={lionName} style={{ objectFit: "contain", padding: 20 }} />
      </div>
      <div className="storybook-card" style={{ textAlign: "center" }}>
        <p className="storybook-eyebrow">Round complete</p>
        <h1 className="storybook-title">{songRef.current.title}</h1>

        {submitting || !result ? (
          <p className="storybook-prompt">Tallying the drums...</p>
        ) : (
          <>
            <div className="stars-row">
              {[0, 1, 2].map((i) => (
                <span key={i} className={`star${i < result.stars ? " is-filled" : ""}`}>
                  ★
                </span>
              ))}
            </div>
            <p className="storybook-prompt">
              {result.coins} coins earned{result.pointsAwarded > 0 ? ` · +${result.pointsAwarded} Lucky Points` : ""}
            </p>
            <p className="storybook-prompt" style={{ fontStyle: "italic" }}>
              "{result.reaction}"
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
              <button className="btn-primary" onClick={startRound}>
                Play again
              </button>
              <a className="btn-secondary" href="/chat">
                Chat with {lionName || "my lion"}
              </a>
              <button className="btn-secondary" onClick={quitToMenu}>
                Back to menu
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
