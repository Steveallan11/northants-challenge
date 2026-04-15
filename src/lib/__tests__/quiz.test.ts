import { describe, expect, it } from "vitest";

import { calculateQuestionPoints, calculateQuizSummary, getBadgeForScore, getRankForAttempt, sortLeaderboard } from "@/lib/quiz";
import { canCreateScoredAttempt } from "@/lib/rules";

describe("scoring logic", () => {
  it("awards base score plus speed bonus for correct answers", () => {
    expect(calculateQuestionPoints({ isCorrect: true, timeRemainingMs: 15000, questionTimeLimitSeconds: 15 })).toBe(150);
    expect(calculateQuestionPoints({ isCorrect: true, timeRemainingMs: 7500, questionTimeLimitSeconds: 15 })).toBe(125);
    expect(calculateQuestionPoints({ isCorrect: false, timeRemainingMs: 7500, questionTimeLimitSeconds: 15 })).toBe(0);
  });

  it("calculates quiz completion totals", () => {
    const summary = calculateQuizSummary({
      questionTimeLimitSeconds: 15,
      questions: [
        { id: "q1", correct_index: 0 },
        { id: "q2", correct_index: 2 },
      ],
      answers: [
        { questionId: "q1", selectedIndex: 0, responseMs: 3200, timeRemainingMs: 12000 },
        { questionId: "q2", selectedIndex: 1, responseMs: 5800, timeRemainingMs: 4000 },
      ],
    });

    expect(summary.score).toBe(140);
    expect(summary.correctCount).toBe(1);
    expect(summary.averageResponseMs).toBe(4500);
  });
});

describe("badge logic", () => {
  it("returns the correct badge thresholds", () => {
    expect(getBadgeForScore(200)).toBe("Just Passing Through");
    expect(getBadgeForScore(450)).toBe("Northants Explorer");
    expect(getBadgeForScore(650)).toBe("Local Insider");
    expect(getBadgeForScore(950)).toBe("Northants Legend");
  });
});

describe("leaderboard logic", () => {
  const entries = [
    {
      attempt_id: "2",
      player_id: "p2",
      first_name: "B",
      town: null,
      score: 800,
      correct_count: 7,
      average_response_ms: 4100,
      completed_at: "2026-04-14T10:00:05Z",
      share_code: null,
    },
    {
      attempt_id: "1",
      player_id: "p1",
      first_name: "A",
      town: null,
      score: 800,
      correct_count: 7,
      average_response_ms: 3900,
      completed_at: "2026-04-14T10:00:10Z",
      share_code: null,
    },
    {
      attempt_id: "3",
      player_id: "p3",
      first_name: "C",
      town: null,
      score: 760,
      correct_count: 6,
      average_response_ms: 3000,
      completed_at: "2026-04-14T10:00:00Z",
      share_code: null,
    },
  ];

  it("sorts by score then average response time then completion timestamp", () => {
    const sorted = sortLeaderboard(entries);
    expect(sorted.map((entry) => entry.attempt_id)).toEqual(["1", "2", "3"]);
  });

  it("finds the correct rank for an attempt", () => {
    expect(getRankForAttempt(entries, "2")).toBe(2);
  });
});

describe("one scored attempt rule", () => {
  it("only allows a scored attempt when none exists", () => {
    expect(canCreateScoredAttempt(0)).toBe(true);
    expect(canCreateScoredAttempt(1)).toBe(false);
  });
});
