export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type QuestionType =
  | "standard"
  | "image_round"
  | "emoji_clue"
  | "clue_round"
  | "true_statement"
  | "local_knowledge"
  | "heritage_round"
  | "days_out_round";

export type Player = {
  id: string;
  first_name: string;
  email: string;
  town: string | null;
  newsletter_opt_in: boolean;
  consent_version: string | null;
  created_at: string;
};

export type Quiz = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  is_published: boolean;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  time_limit_seconds: number;
  created_at: string;
};

export type Question = {
  id: string;
  quiz_id: string;
  sort_order: number;
  type: QuestionType;
  prompt: string;
  extra_text: string | null;
  image_url: string | null;
  options: string[];
  correct_index: number;
  explanation: string | null;
  category: string | null;
  difficulty: string | null;
  created_at: string;
};

export type Attempt = {
  id: string;
  quiz_id: string;
  player_id: string;
  score: number;
  correct_count: number;
  average_response_ms: number | null;
  completed_at: string | null;
  is_scored: boolean;
  share_code: string | null;
  referred_by_attempt_id: string | null;
  created_at: string;
};

export type Response = {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_index: number | null;
  is_correct: boolean;
  response_ms: number | null;
  time_remaining_ms: number | null;
  points_awarded: number;
  created_at: string;
};

export type LeaderboardEntry = {
  attempt_id: string;
  player_id: string;
  first_name: string;
  town: string | null;
  score: number;
  correct_count: number;
  average_response_ms: number | null;
  completed_at: string;
  share_code: string | null;
};

export type QuizWithQuestions = Quiz & {
  questions: Question[];
};

export type AttemptWithPlayer = Attempt & {
  players: Pick<Player, "id" | "first_name" | "email" | "town" | "newsletter_opt_in"> | null;
  quizzes?: Pick<Quiz, "id" | "title" | "slug"> | null;
};

export type DashboardMetric = {
  label: string;
  value: string;
  hint?: string;
};
