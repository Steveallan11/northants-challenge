export const DEFAULT_QUESTION_TIME_LIMIT = 15;

export const BADGE_THRESHOLDS = [
  { min: 900, label: "Northants Legend" },
  { min: 600, label: "Local Insider" },
  { min: 300, label: "Northants Explorer" },
  { min: 0, label: "Just Passing Through" },
] as const;

export const QUESTION_TYPES = [
  "standard",
  "image_round",
  "emoji_clue",
  "clue_round",
  "true_statement",
  "local_knowledge",
  "heritage_round",
  "days_out_round",
] as const;

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export const CONSENT_VERSION = "v1-2026-04";
