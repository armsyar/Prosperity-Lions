// Shared types used by both apps/api and apps/web.
// Keep this the single source of truth for the data shapes described in
// docs/technical-build-plan.md Section 4.

export type LionId = "hong_hong" | "rui_rui" | "xing_xing" | "xi_xi" | "zhi_zhi";

export interface LionPower {
  name: string;
  description: string;
}

export interface Lion {
  id: LionId;
  name: string;
  title: string;
  colour: string;
  personality: string;
  voice: string;
  catchphrase: string;
  fortuneDomain: string;
  power: LionPower;
  favouriteAttractionId: string;
  favouriteRestaurantId: string;
  quizResultCode: "A" | "B" | "C" | "D" | "E";
}

export type VenueType = "restaurant" | "attraction" | "hotel" | "retail";

export interface Venue {
  id: string;
  name: string;
  type: VenueType;
  description: string;
  championLionId: LionId;
  dietaryTags?: string[];
  qrCodeId: string;
}

export interface Promotion {
  id: string;
  venueId: string;
  title: string;
  description: string;
  validFrom: string; // ISO date
  validTo: string; // ISO date
  terms: string;
  redemptionMethod: string;
  stock: number;
}

export interface Fortune {
  id: string;
  idiom: string;
  meaning: string;
  theme: string;
}

export interface QuizOption {
  text: string;
  main: LionId;
  secondary: LionId;
}

export interface QuizQuestion {
  id: string;
  title: string;
  prompt: string;
  options: QuizOption[];
}

export interface Guest {
  anonymousId: string;
  matchedLionId: LionId | null;
  quizAnswers: Record<string, number>; // questionId -> option index
  pointsBalance: number;
  bondLevel: number;
  createdAt: string;
  language: string;
}

export type PointsAction =
  | "first_chat_of_day"
  | "complete_fortune"
  | "learn_tradition"
  | "view_offer"
  | "venue_checkin"
  | "play_game";

export interface PrizeDraw {
  id: string;
  guestId: string;
  tier: "voucher" | "gift" | "blessing_only";
  item: string | null;
  code: string | null;
  expiry: string | null;
  terms: string | null;
  awardedAt: string;
}

export interface GameScore {
  id: string;
  guestId: string;
  lionId: LionId;
  songId: string;
  difficulty: "easy" | "normal" | "hard";
  stars: 0 | 1 | 2 | 3;
  coins: number;
  accuracy: number;
  maxCombo: number;
  powerUsed: boolean;
  playedAt: string;
}
