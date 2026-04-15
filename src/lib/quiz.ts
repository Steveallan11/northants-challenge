import { BADGE_THRESHOLDS } from "@/lib/constants";
import type { LeaderboardEntry, Question } from "@/lib/types";

export function calculateQuestionPoints(params: {
  isCorrect: boolean;
  timeRemainingMs: number | null;
  questionTimeLimitSeconds: number;
}) {
  if (!params.isCorrect) {
    return 0;
  }

  const timeLimitMs = params.questionTimeLimitSeconds * 1000;
  const safeRemaining = Math.max(0, Math.min(params.timeRemainingMs ?? 0, timeLimitMs));
  const speedBonus = Math.round((safeRemaining / timeLimitMs) * 50);
  return 100 + speedBonus;
}

export function getBadgeForScore(score: number) {
  return BADGE_THRESHOLDS.find((threshold) => score >= threshold.min)?.label ?? "Just Passing Through";
}

export function averageResponseTime(responses: Array<{ responseMs: number | null }>) {
  const valid = responses.map((item) => item.responseMs).filter((value): value is number => typeof value === "number");
  if (!valid.length) {
    return null;
  }

  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

export function sortLeaderboard(entries: LeaderboardEntry[]) {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    const aAvg = a.average_response_ms ?? Number.MAX_SAFE_INTEGER;
    const bAvg = b.average_response_ms ?? Number.MAX_SAFE_INTEGER;
    if (aAvg !== bAvg) {
      return aAvg - bAvg;
    }

    return new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime();
  });
}

export function calculateQuizSummary(params: {
  questions: Pick<Question, "id" | "correct_index">[];
  answers: Array<{
    questionId: string;
    selectedIndex: number | null;
    responseMs: number | null;
    timeRemainingMs: number | null;
  }>;
  questionTimeLimitSeconds: number;
}) {
  const answersByQuestion = new Map(params.answers.map((answer) => [answer.questionId, answer]));

  const responses = params.questions.map((question) => {
    const answer = answersByQuestion.get(question.id);
    const isCorrect = answer?.selectedIndex === question.correct_index;
    const points = calculateQuestionPoints({
      isCorrect,
      timeRemainingMs: answer?.timeRemainingMs ?? 0,
      questionTimeLimitSeconds: params.questionTimeLimitSeconds,
    });

    return {
      questionId: question.id,
      selectedIndex: answer?.selectedIndex ?? null,
      responseMs: answer?.responseMs ?? null,
      timeRemainingMs: answer?.timeRemainingMs ?? null,
      isCorrect,
      points,
    };
  });

  return {
    responses,
    score: responses.reduce((sum, response) => sum + response.points, 0),
    correctCount: responses.filter((response) => response.isCorrect).length,
    averageResponseMs: averageResponseTime(responses),
  };
}

export function getRankForAttempt(entries: LeaderboardEntry[], attemptId: string) {
  const sorted = sortLeaderboard(entries);
  const index = sorted.findIndex((entry) => entry.attempt_id === attemptId);
  return index >= 0 ? index + 1 : null;
}
