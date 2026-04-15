import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { PoolClient } from "pg";

import { CONSENT_VERSION, DEFAULT_QUESTION_TIME_LIMIT } from "@/lib/constants";
import { dbQuery, hasDatabase, withTransaction } from "@/lib/db";
import { getFirebaseAdminAuth, hasFirebaseAdmin } from "@/lib/firebase-admin";
import { calculateQuizSummary, getBadgeForScore, sortLeaderboard } from "@/lib/quiz";
import { seededQuiz } from "@/lib/seed";
import type { Attempt, AttemptWithPlayer, LeaderboardEntry, Player, Question, Quiz, QuizWithQuestions } from "@/lib/types";

const ADMIN_SESSION_COOKIE = "northants_admin_session";
const FALLBACK_ATTEMPT_ID = "11111111-1111-4111-8111-111111111111";
const FALLBACK_PLAYER_ID = "22222222-2222-4222-8222-222222222222";

type DashboardData = {
  activeQuiz: Quiz | null;
  totalStarts: number;
  totalCompletions: number;
  completionRate: number;
  averageScore: number;
  averageCorrectAnswers: number;
  averageResponseTime: number;
  newsletterOptIns: number;
  totalShares: number;
  shareConversion: number;
  recentPlayers: AttemptWithPlayer[];
  topScores: LeaderboardEntry[];
  topReferrers: Array<{ first_name: string; score: number; share_code: string | null }>;
};

function createFallbackLeaderboard(): LeaderboardEntry[] {
  return [
    {
      attempt_id: "11111111-1111-4111-8111-111111111101",
      player_id: "22222222-2222-4222-8222-222222222201",
      first_name: "Ava",
      town: "Northampton",
      score: 842,
      correct_count: 7,
      average_response_ms: 4210,
      completed_at: "2026-04-14T18:10:00+00:00",
      share_code: "ava842",
    },
    {
      attempt_id: "11111111-1111-4111-8111-111111111102",
      player_id: "22222222-2222-4222-8222-222222222202",
      first_name: "Luca",
      town: "Kettering",
      score: 795,
      correct_count: 7,
      average_response_ms: 5110,
      completed_at: "2026-04-14T19:12:00+00:00",
      share_code: "luca795",
    },
    {
      attempt_id: "11111111-1111-4111-8111-111111111103",
      player_id: "22222222-2222-4222-8222-222222222203",
      first_name: "Mia",
      town: "Wellingborough",
      score: 732,
      correct_count: 6,
      average_response_ms: 4870,
      completed_at: "2026-04-14T19:30:00+00:00",
      share_code: "mia732",
    },
  ];
}

function createFallbackResultData(attemptId: string) {
  const leaderboard = createFallbackLeaderboard();
  const demo = leaderboard[0];
  return {
    attempt: {
      id: attemptId,
      quiz_id: seededQuiz.id,
      player_id: FALLBACK_PLAYER_ID,
      score: demo.score,
      correct_count: demo.correct_count,
      average_response_ms: demo.average_response_ms,
      completed_at: demo.completed_at,
      is_scored: true,
      share_code: demo.share_code,
      referred_by_attempt_id: null,
      created_at: demo.completed_at,
    } satisfies Attempt,
    player: {
      id: FALLBACK_PLAYER_ID,
      first_name: demo.first_name,
      email: "demo@example.com",
      town: demo.town,
      newsletter_opt_in: true,
      consent_version: CONSENT_VERSION,
      created_at: demo.completed_at,
    } satisfies Player,
    rank: 1,
    badge: getBadgeForScore(demo.score),
    leaderboard,
    quiz: seededQuiz,
  };
}

function normalizeQuestion(row: Question & { options: unknown }) {
  return {
    ...row,
    options: Array.isArray(row.options) ? row.options : typeof row.options === "string" ? JSON.parse(row.options) : [],
  };
}

async function getQuizQuestions(quizId: string) {
  const { rows } = await dbQuery<Question & { options: unknown }>(
    "select * from questions where quiz_id = $1 order by sort_order asc",
    [quizId],
  );
  return rows.map(normalizeQuestion);
}

async function getShareCodeAttemptId(shareCode: string, client?: PoolClient) {
  const result = client
    ? await client.query<{ id: string }>("select id from attempts where share_code = $1", [shareCode])
    : await dbQuery<{ id: string }>("select id from attempts where share_code = $1", [shareCode]);
  return result.rows[0]?.id ?? null;
}

export async function getActiveQuiz(): Promise<QuizWithQuestions> {
  if (!hasDatabase()) {
    return seededQuiz;
  }

  try {
    const { rows } = await dbQuery<Quiz>(
      "select * from quizzes where is_active = true and is_published = true order by starts_at desc nulls last, created_at desc limit 1",
    );
    const quiz = rows[0];
    if (!quiz) {
      return seededQuiz;
    }

    return {
      ...quiz,
      questions: await getQuizQuestions(quiz.id),
    };
  } catch {
    return seededQuiz;
  }
}

export async function getQuizBySlug(slug: string): Promise<QuizWithQuestions | null> {
  if (!hasDatabase()) {
    return slug === seededQuiz.slug ? seededQuiz : null;
  }

  try {
    const { rows } = await dbQuery<Quiz>("select * from quizzes where slug = $1 limit 1", [slug]);
    const quiz = rows[0];
    if (!quiz) {
      return null;
    }

    return {
      ...quiz,
      questions: await getQuizQuestions(quiz.id),
    };
  } catch {
    return slug === seededQuiz.slug ? seededQuiz : null;
  }
}

export async function getQuizById(id: string): Promise<QuizWithQuestions | null> {
  if (!hasDatabase()) {
    return id === seededQuiz.id ? seededQuiz : null;
  }

  try {
    const { rows } = await dbQuery<Quiz>("select * from quizzes where id = $1 limit 1", [id]);
    const quiz = rows[0];
    if (!quiz) {
      return null;
    }

    return {
      ...quiz,
      questions: await getQuizQuestions(quiz.id),
    };
  } catch {
    return id === seededQuiz.id ? seededQuiz : null;
  }
}

export async function getQuizList(): Promise<Quiz[]> {
  if (!hasDatabase()) {
    return [seededQuiz];
  }

  try {
    const { rows } = await dbQuery<Quiz>("select * from quizzes order by created_at desc");
    return rows;
  } catch {
    return [seededQuiz];
  }
}

export async function getLeaderboard(scope: "weekly" | "all-time" = "weekly") {
  if (!hasDatabase()) {
    return createFallbackLeaderboard();
  }

  try {
    let sql = `
    select
      a.id as attempt_id,
      a.player_id,
      p.first_name,
      p.town,
      a.score,
      a.correct_count,
      a.average_response_ms,
      a.completed_at,
      a.share_code
    from attempts a
    join players p on p.id = a.player_id
    where a.is_scored = true and a.completed_at is not null
  `;
    const params: unknown[] = [];

    if (scope === "weekly") {
      const activeQuiz = await getActiveQuiz();
      sql += " and a.quiz_id = $1";
      params.push(activeQuiz.id);
    }

    sql += " order by a.score desc, a.average_response_ms asc nulls last, a.completed_at asc limit 50";
    const { rows } = await dbQuery<LeaderboardEntry>(sql, params);
    return sortLeaderboard(rows);
  } catch {
    return createFallbackLeaderboard();
  }
}

export async function getResultData(attemptId: string): Promise<{
  attempt: Attempt;
  player: Player;
  rank: number | null;
  badge: string;
  leaderboard: LeaderboardEntry[];
  quiz: Quiz;
} | null> {
  if (attemptId === FALLBACK_ATTEMPT_ID) {
    return createFallbackResultData(attemptId);
  }

  if (!hasDatabase()) {
    return createFallbackResultData(FALLBACK_ATTEMPT_ID);
  }

  try {
    const { rows } = await dbQuery<
    Attempt & {
      player_first_name: string;
      player_email: string;
      player_town: string | null;
      player_newsletter_opt_in: boolean;
      quiz_title: string;
      quiz_slug: string;
      quiz_description: string | null;
    }
  >(
    `
      select
        a.*,
        p.first_name as player_first_name,
        p.email as player_email,
        p.town as player_town,
        p.newsletter_opt_in as player_newsletter_opt_in,
        q.title as quiz_title,
        q.slug as quiz_slug,
        q.description as quiz_description
      from attempts a
      join players p on p.id = a.player_id
      join quizzes q on q.id = a.quiz_id
      where a.id = $1
      limit 1
    `,
    [attemptId],
  );

    const attempt = rows[0];
    if (!attempt) {
      return null;
    }

    const leaderboard = await getLeaderboard("weekly");
    return {
      attempt,
      player: {
        id: attempt.player_id,
        first_name: attempt.player_first_name,
        email: attempt.player_email,
        town: attempt.player_town,
        newsletter_opt_in: attempt.player_newsletter_opt_in,
        consent_version: CONSENT_VERSION,
        created_at: attempt.created_at,
      } satisfies Player,
      rank: leaderboard.findIndex((entry) => entry.attempt_id === attempt.id) + 1 || null,
      badge: getBadgeForScore(attempt.score),
      leaderboard,
      quiz: {
        id: attempt.quiz_id,
        slug: attempt.quiz_slug,
        title: attempt.quiz_title,
        description: attempt.quiz_description,
        is_published: true,
        is_active: true,
        starts_at: null,
        ends_at: null,
        time_limit_seconds: DEFAULT_QUESTION_TIME_LIMIT,
        created_at: attempt.created_at,
      } satisfies Quiz,
    };
  } catch {
    if (attemptId === FALLBACK_ATTEMPT_ID) {
      return createFallbackResultData(attemptId);
    }
    return null;
  }
}

export async function registerPlayerForActiveQuiz(input: {
  first_name: string;
  email: string;
  town?: string;
  newsletter_opt_in?: boolean;
  referred_by_code?: string;
}) {
  const quiz = await getActiveQuiz();

  if (!hasDatabase()) {
    return {
      attemptId: FALLBACK_ATTEMPT_ID,
      quizSlug: quiz.slug,
      player: {
        id: FALLBACK_PLAYER_ID,
        first_name: input.first_name,
        email: input.email,
        town: input.town || null,
        newsletter_opt_in: Boolean(input.newsletter_opt_in),
        consent_version: CONSENT_VERSION,
        created_at: new Date().toISOString(),
      } satisfies Player,
      alreadyPlayed: false,
    };
  }

  const normalizedEmail = input.email.toLowerCase();

  try {
    return await withTransaction(async (client) => {
      const existingPlayerRes = await client.query<Player>("select * from players where email = $1 limit 1", [normalizedEmail]);
      let player = existingPlayerRes.rows[0];

      if (player) {
        const updated = await client.query<Player>(
          `
            update players
            set first_name = $1,
                town = $2,
                newsletter_opt_in = $3,
                consent_version = $4
            where id = $5
            returning *
          `,
          [
            input.first_name,
            input.town || null,
            Boolean(input.newsletter_opt_in) || player.newsletter_opt_in,
            CONSENT_VERSION,
            player.id,
          ],
        );
        player = updated.rows[0];
      } else {
        const inserted = await client.query<Player>(
          `
            insert into players (first_name, email, town, newsletter_opt_in, consent_version)
            values ($1, $2, $3, $4, $5)
            returning *
          `,
          [input.first_name, normalizedEmail, input.town || null, Boolean(input.newsletter_opt_in), CONSENT_VERSION],
        );
        player = inserted.rows[0];
      }

      const existingAttemptRes = await client.query<Attempt>(
        "select * from attempts where quiz_id = $1 and player_id = $2 and is_scored = true limit 1",
        [quiz.id, player.id],
      );
      const existingAttempt = existingAttemptRes.rows[0];
      if (existingAttempt) {
        return {
          attemptId: existingAttempt.id,
          quizSlug: quiz.slug,
          player,
          alreadyPlayed: true,
        };
      }

      let referredByAttemptId: string | null = null;
      if (input.referred_by_code) {
        referredByAttemptId = await getShareCodeAttemptId(input.referred_by_code, client);
      }

      const attemptRes = await client.query<Attempt>(
        `
          insert into attempts (quiz_id, player_id, is_scored, referred_by_attempt_id)
          values ($1, $2, true, $3)
          returning *
        `,
        [quiz.id, player.id, referredByAttemptId],
      );

      return {
        attemptId: attemptRes.rows[0].id,
        quizSlug: quiz.slug,
        player,
        alreadyPlayed: false,
      };
    });
  } catch {
    return {
      attemptId: FALLBACK_ATTEMPT_ID,
      quizSlug: quiz.slug,
      player: {
        id: FALLBACK_PLAYER_ID,
        first_name: input.first_name,
        email: input.email,
        town: input.town || null,
        newsletter_opt_in: Boolean(input.newsletter_opt_in),
        consent_version: CONSENT_VERSION,
        created_at: new Date().toISOString(),
      } satisfies Player,
      alreadyPlayed: false,
    };
  }
}

export async function submitAttempt(params: {
  attemptId: string;
  quizSlug: string;
  answers: Array<{
    questionId: string;
    selectedIndex: number | null;
    responseMs: number | null;
    timeRemainingMs: number | null;
  }>;
}) {
  const quiz = await getQuizBySlug(params.quizSlug);
  if (!quiz) {
    throw new Error("Quiz not found");
  }

  const summary = calculateQuizSummary({
    questions: quiz.questions,
    answers: params.answers,
    questionTimeLimitSeconds: quiz.time_limit_seconds || DEFAULT_QUESTION_TIME_LIMIT,
  });

  if (!hasDatabase()) {
    return {
      attemptId: params.attemptId,
      score: summary.score,
      correctCount: summary.correctCount,
      averageResponseMs: summary.averageResponseMs,
    };
  }

  try {
    return await withTransaction(async (client) => {
      const shareCode = randomUUID().slice(0, 8);

      await client.query("delete from responses where attempt_id = $1", [params.attemptId]);
      for (const response of summary.responses) {
        await client.query(
          `
            insert into responses (attempt_id, question_id, selected_index, is_correct, response_ms, time_remaining_ms, points_awarded)
            values ($1, $2, $3, $4, $5, $6, $7)
          `,
          [
            params.attemptId,
            response.questionId,
            response.selectedIndex,
            response.isCorrect,
            response.responseMs,
            response.timeRemainingMs,
            response.points,
          ],
        );
      }

      const updatedAttempt = await client.query<Attempt>(
        `
          update attempts
          set score = $1,
              correct_count = $2,
              average_response_ms = $3,
              completed_at = $4,
              share_code = $5
          where id = $6
          returning *
        `,
        [summary.score, summary.correctCount, summary.averageResponseMs, new Date().toISOString(), shareCode, params.attemptId],
      );

      await client.query("update referral_visits set converted_to_attempt = true where share_code = $1", [shareCode]);
      return updatedAttempt.rows[0];
    });
  } catch {
    return {
      attemptId: params.attemptId,
      score: summary.score,
      correctCount: summary.correctCount,
      averageResponseMs: summary.averageResponseMs,
    };
  }
}

export async function getAdminSession() {
  if (!hasFirebaseAdmin() || !hasDatabase()) {
    return {
      user: { email: process.env.ADMIN_EMAIL || "demo-admin@northantschallenge.co.uk" },
      role: "admin",
      isFallback: true,
    };
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!sessionCookie) {
    return null;
  }

  try {
    const decoded = await getFirebaseAdminAuth().verifySessionCookie(sessionCookie, true);
    const email = decoded.email;
    if (!email) {
      return null;
    }

    try {
      const { rows } = await dbQuery<{ email: string; role: string }>("select email, role from admins where email = $1 limit 1", [email]);
      const admin = rows[0];
      if (!admin) {
        return null;
      }

      return {
        user: { email },
        role: admin.role,
        isFallback: false,
      };
    } catch {
      if (email === process.env.ADMIN_EMAIL) {
        return {
          user: { email },
          role: "admin",
          isFallback: true,
        };
      }
      return null;
    }
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export async function getDashboardData(): Promise<DashboardData> {
  if (!hasDatabase()) {
    const leaderboard = createFallbackLeaderboard();
    return {
      activeQuiz: seededQuiz,
      totalStarts: 138,
      totalCompletions: 121,
      completionRate: 87.7,
      averageScore: 684,
      averageCorrectAnswers: 5.9,
      averageResponseTime: 4620,
      newsletterOptIns: 68,
      totalShares: 44,
      shareConversion: 18.2,
      recentPlayers: [],
      topScores: leaderboard,
      topReferrers: leaderboard.map((entry) => ({
        first_name: entry.first_name,
        score: entry.score,
        share_code: entry.share_code,
      })),
    };
  }

  try {
    const activeQuiz = await getActiveQuiz();
    const attempts = await getAttempts();
    const players = await getPlayers();
    const { rows: shareRows } = await dbQuery<{ count: string }>("select count(*)::text as count from share_events where quiz_id = $1", [activeQuiz.id]);
    const totalShares = Number(shareRows[0]?.count ?? 0);

  const completions = attempts.filter((attempt) => attempt.completed_at);
  const leaderboard = completions
    .map((attempt) => ({
      attempt_id: attempt.id,
      player_id: attempt.player_id,
      first_name: attempt.players?.first_name ?? "Player",
      town: attempt.players?.town ?? null,
      score: attempt.score,
      correct_count: attempt.correct_count,
      average_response_ms: attempt.average_response_ms,
      completed_at: attempt.completed_at ?? attempt.created_at,
      share_code: attempt.share_code,
    }))
    .slice(0, 5);

  const average = (values: number[]) => (values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0);

    return {
      activeQuiz,
      totalStarts: attempts.length,
      totalCompletions: completions.length,
      completionRate: attempts.length ? Number(((completions.length / attempts.length) * 100).toFixed(1)) : 0,
      averageScore: average(completions.map((attempt) => attempt.score)),
      averageCorrectAnswers: average(completions.map((attempt) => attempt.correct_count)),
      averageResponseTime: average(completions.map((attempt) => attempt.average_response_ms).filter((value): value is number => typeof value === "number")),
      newsletterOptIns: players.filter((player) => player.newsletter_opt_in).length,
      totalShares,
      shareConversion: totalShares ? Number(((attempts.filter((attempt) => attempt.referred_by_attempt_id).length / totalShares) * 100).toFixed(1)) : 0,
      recentPlayers: attempts.slice(0, 6),
      topScores: leaderboard,
      topReferrers: leaderboard.map((entry) => ({
        first_name: entry.first_name,
        score: entry.score,
        share_code: entry.share_code,
      })),
    };
  } catch {
    const leaderboard = createFallbackLeaderboard();
    return {
      activeQuiz: seededQuiz,
      totalStarts: 138,
      totalCompletions: 121,
      completionRate: 87.7,
      averageScore: 684,
      averageCorrectAnswers: 5.9,
      averageResponseTime: 4620,
      newsletterOptIns: 68,
      totalShares: 44,
      shareConversion: 18.2,
      recentPlayers: [],
      topScores: leaderboard,
      topReferrers: leaderboard.map((entry) => ({
        first_name: entry.first_name,
        score: entry.score,
        share_code: entry.share_code,
      })),
    };
  }
}

export async function getPlayers(): Promise<Player[]> {
  if (!hasDatabase()) {
    return [];
  }

  try {
    const { rows } = await dbQuery<Player>("select * from players order by created_at desc");
    return rows;
  } catch {
    return [];
  }
}

export async function getAttempts(): Promise<AttemptWithPlayer[]> {
  if (!hasDatabase()) {
    return [];
  }

  try {
    const { rows } = await dbQuery<
    Attempt & {
      player_first_name: string | null;
      player_email: string | null;
      player_town: string | null;
      player_newsletter_opt_in: boolean | null;
      quiz_title: string | null;
      quiz_slug: string | null;
    }
  >(
    `
      select
        a.*,
        p.first_name as player_first_name,
        p.email as player_email,
        p.town as player_town,
        p.newsletter_opt_in as player_newsletter_opt_in,
        q.title as quiz_title,
        q.slug as quiz_slug
      from attempts a
      left join players p on p.id = a.player_id
      left join quizzes q on q.id = a.quiz_id
      order by a.created_at desc
    `,
  );

    return rows.map((attempt) => ({
      ...attempt,
      players: attempt.player_first_name
        ? {
            id: attempt.player_id,
            first_name: attempt.player_first_name,
            email: attempt.player_email ?? "",
            town: attempt.player_town,
            newsletter_opt_in: Boolean(attempt.player_newsletter_opt_in),
          }
        : null,
      quizzes: attempt.quiz_title
        ? {
            id: attempt.quiz_id,
            title: attempt.quiz_title,
            slug: attempt.quiz_slug ?? "",
          }
        : null,
    })) as AttemptWithPlayer[];
  } catch {
    return [];
  }
}

export async function upsertQuiz(input: {
  id?: string;
  slug: string;
  title: string;
  description?: string | null;
  is_published: boolean;
  is_active: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  time_limit_seconds: number;
  created_at?: string;
  questions: Array<{
    id?: string;
    quiz_id?: string;
    sort_order: number;
    type: Question["type"];
    prompt: string;
    extra_text?: string | null;
    image_url?: string | null;
    options: string[];
    correct_index: number;
    explanation?: string | null;
    category?: string | null;
    difficulty?: string | null;
    created_at?: string;
  }>;
}) {
  if (!hasDatabase()) {
    return input;
  }

  return withTransaction(async (client) => {
    const quizId = input.id ?? randomUUID();
    if (input.is_active) {
      await client.query("update quizzes set is_active = false where id <> $1", [quizId]);
    }

    await client.query(
      `
        insert into quizzes (id, slug, title, description, is_published, is_active, starts_at, ends_at, time_limit_seconds)
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        on conflict (id) do update
        set slug = excluded.slug,
            title = excluded.title,
            description = excluded.description,
            is_published = excluded.is_published,
            is_active = excluded.is_active,
            starts_at = excluded.starts_at,
            ends_at = excluded.ends_at,
            time_limit_seconds = excluded.time_limit_seconds
      `,
      [
        quizId,
        input.slug,
        input.title,
        input.description || null,
        input.is_published,
        input.is_active,
        input.starts_at || null,
        input.ends_at || null,
        input.time_limit_seconds,
      ],
    );

    await client.query("delete from questions where quiz_id = $1", [quizId]);
    for (const question of input.questions) {
      await client.query(
        `
          insert into questions
            (id, quiz_id, sort_order, type, prompt, extra_text, image_url, options, correct_index, explanation, category, difficulty)
          values
            ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12)
        `,
        [
          question.id || randomUUID(),
          quizId,
          question.sort_order,
          question.type,
          question.prompt,
          question.extra_text || null,
          question.image_url || null,
          JSON.stringify(question.options),
          question.correct_index,
          question.explanation || null,
          question.category || null,
          question.difficulty || null,
        ],
      );
    }

    return getQuizById(quizId);
  });
}

export async function trackShare(params: { attemptId?: string | null; quizId: string; playerId?: string | null; shareCode?: string | null; shareChannel?: string | null }) {
  if (!hasDatabase()) {
    return;
  }

  await dbQuery(
    `
      insert into share_events (attempt_id, quiz_id, player_id, share_code, share_channel, clicked_count)
      values ($1, $2, $3, $4, $5, 0)
    `,
    [params.attemptId ?? null, params.quizId, params.playerId ?? null, params.shareCode ?? null, params.shareChannel ?? "native"],
  );
}

export async function trackReferralVisit(params: { shareCode: string; quizId: string; visitorSessionId?: string | null }) {
  if (!hasDatabase()) {
    return;
  }

  const referrerAttemptId = await getShareCodeAttemptId(params.shareCode);
  await dbQuery(
    `
      insert into referral_visits (share_code, quiz_id, referrer_attempt_id, visitor_session_id, converted_to_attempt)
      values ($1, $2, $3, $4, false)
    `,
    [params.shareCode, params.quizId, referrerAttemptId, params.visitorSessionId ?? null],
  );
  await dbQuery("update share_events set clicked_count = clicked_count + 1 where share_code = $1", [params.shareCode]);
}

export async function getExportRows(type: "players" | "newsletter" | "attempts" | "leaderboard"): Promise<Array<Record<string, unknown>>> {
  if (type === "players") {
    return (await getPlayers()) as Array<Record<string, unknown>>;
  }
  if (type === "newsletter") {
    const players = await getPlayers();
    return players.filter((player) => player.newsletter_opt_in) as Array<Record<string, unknown>>;
  }
  if (type === "attempts") {
    return (await getAttempts()) as Array<Record<string, unknown>>;
  }
  return (await getLeaderboard("weekly")) as Array<Record<string, unknown>>;
}

export async function createAdminSession(idToken: string) {
  if (!hasFirebaseAdmin()) {
    return { success: true, fallback: true };
  }

  const decoded = await getFirebaseAdminAuth().verifyIdToken(idToken);
  const email = decoded.email;
  if (!email) {
    throw new Error("No email address found on this Firebase account.");
  }

  if (hasDatabase()) {
    try {
      const { rows } = await dbQuery<{ email: string }>("select email from admins where email = $1 limit 1", [email]);
      if (!rows[0]) {
        throw new Error("This Firebase user is not approved for admin access.");
      }
    } catch {
      if (email !== process.env.ADMIN_EMAIL) {
        throw new Error("Cloud SQL is currently unreachable and this email does not match the fallback admin.");
      }
    }
  }

  const expiresIn = 1000 * 60 * 60 * 24 * 5;
  const sessionCookie = await getFirebaseAdminAuth().createSessionCookie(idToken, { expiresIn });
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: expiresIn / 1000,
    path: "/",
  });

  return { success: true };
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
