// Beatmap generation for the lion-dance rhythm game.
// Per docs/game-concept.md Section 10: "Beatmaps: JSON files (time, lane,
// note type) per song and difficulty. Easy to author and tweak."
//
// This is a pattern-based GENERATOR rather than hand-authored JSON files,
// which is a deliberate MVP shortcut: it produces a playable, on-beat chart
// for any song/difficulty combo with no music-authoring tool needed. Swap
// this out for real hand-charted JSON beatmaps (reviewed against the actual
// recorded percussion) before launch - see docs/game-concept.md Section 11.

export type NoteType = "tap" | "swipe" | "hold";

export interface BeatmapNote {
  id: string;
  time: number; // ms from the start of the song (Web Audio clock, not wall clock)
  type: NoteType;
  holdMs?: number; // only set for "hold" notes
}

export type Difficulty = "easy" | "normal" | "hard";

export interface Song {
  id: string;
  title: string;
  subtitle: string;
  bpm: number;
  durationMs: number;
}

// 3 launch songs per docs/game-concept.md Section 12 MVP scope.
// Placeholder titles/BPMs - swap for the real composed/recorded tracks.
export const SONGS: Song[] = [
  { id: "reunion_street", title: "Reunion Street", subtitle: "Warm-up beat, steady and easy to follow", bpm: 96, durationMs: 60000 },
  { id: "golden_market", title: "Golden Market", subtitle: "Bright and bouncy market-day rhythm", bpm: 110, durationMs: 70000 },
  { id: "lantern_night", title: "Lantern Night", subtitle: "Big finale drums for the grand show", bpm: 120, durationMs: 80000 }
];

const PATTERN: NoteType[] = ["tap", "tap", "swipe", "tap", "hold", "tap", "swipe", "tap"];

const DIFFICULTY_SPACING_BEATS: Record<Difficulty, number> = {
  easy: 2,
  normal: 1.5,
  hard: 1
};

export function generateBeatmap(song: Song, difficulty: Difficulty): BeatmapNote[] {
  const beatMs = 60000 / song.bpm;
  const spacingMs = beatMs * DIFFICULTY_SPACING_BEATS[difficulty];
  const leadInMs = 2500;
  const tailMs = 2500;

  const notes: BeatmapNote[] = [];
  let t = leadInMs;
  let i = 0;
  while (t < song.durationMs - tailMs) {
    const type = PATTERN[i % PATTERN.length];
    notes.push({
      id: `n${i}`,
      time: Math.round(t),
      type,
      holdMs: type === "hold" ? Math.round(beatMs * 1.5) : undefined
    });
    i += 1;
    t += spacingMs;
  }
  return notes;
}

// Timing windows in ms, tuned narrower at higher difficulty.
export const TIMING_WINDOWS: Record<Difficulty, { perfect: number; good: number }> = {
  easy: { perfect: 110, good: 220 },
  normal: { perfect: 85, good: 170 },
  hard: { perfect: 65, good: 130 }
};

// How far (in ms of lead time) a note travels down the track before it
// reaches the hit line - purely visual, does not affect judging.
export const APPROACH_MS = 1500;
