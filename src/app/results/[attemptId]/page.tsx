import Link from "next/link";
import { ArrowUpRight, Crown, Medal, Timer } from "lucide-react";

import { ShareButton } from "@/components/quiz/share-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getResultData } from "@/lib/data";
import { formatNumber, safeUrl } from "@/lib/utils";

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ attemptId: string }>;
  searchParams: Promise<{ alreadyPlayed?: string }>;
}) {
  const { attemptId } = await params;
  const { alreadyPlayed } = await searchParams;
  const result = await getResultData(attemptId);
  const workWithUsUrl = process.env.WORK_WITH_US_URL || "mailto:hello@northantschallenge.co.uk";

  if (!result) {
    return <main className="page-shell py-12 text-white">Result not found.</main>;
  }

  const shareUrl = safeUrl(`/play?share=${result.attempt.share_code ?? ""}`);
  const shareText = `I scored ${result.attempt.score} on this week's Northants Challenge - can you beat me?`;
  const topThree = result.leaderboard.slice(0, 3);

  return (
    <main className="page-shell space-y-8 py-10">
      {alreadyPlayed ? (
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-100">
          Your scored attempt for this week has already been used, so we&apos;ve shown your existing result instead.
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden border-orange-500/15 bg-[radial-gradient(circle_at_top_right,rgba(245,124,0,0.22),transparent_30%),linear-gradient(180deg,rgba(20,20,20,0.98),rgba(11,11,11,0.98))]">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <Badge>{result.badge}</Badge>
              <span className="orange-tab">Weekly result</span>
            </div>
            <CardTitle className="headline-brand mt-3 text-3xl sm:text-4xl">Nice run, {result.player.first_name}</CardTitle>
            <p className="max-w-xl text-sm leading-relaxed text-slate-300">
              Proper county bragging rights unlocked. Your score is in and the leaderboard is ready for the next challenger.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-slate-400">Total score</p>
              <p className="mt-1 text-4xl font-semibold text-orange-300">{formatNumber(result.attempt.score)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-slate-400">Correct answers</p>
              <p className="mt-1 text-4xl font-semibold text-white">{result.attempt.correct_count}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-slate-400">Average response time</p>
              <p className="mt-1 text-2xl font-semibold text-white">{((result.attempt.average_response_ms ?? 0) / 1000).toFixed(2)}s</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-slate-400">Weekly rank</p>
              <p className="mt-1 text-2xl font-semibold text-white">{result.rank ? `#${result.rank}` : "Unranked"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/15 bg-[linear-gradient(180deg,rgba(18,18,18,0.97),rgba(10,10,10,0.98))]">
          <CardHeader>
            <CardTitle className="headline-brand text-2xl">Keep the challenge moving</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-200">Beat my score</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Share your result, call out a mate, and send them straight into this week&apos;s challenge.
              </p>
            </div>
            <ShareButton title="Northants Challenge" text={shareText} url={shareUrl} className="w-full justify-center" />
            <ShareButton title="Challenge a friend" text={shareText} url={shareUrl} className="w-full justify-center" />
            <Link href="/leaderboard">
              <Button variant="outline" className="w-full">
                View leaderboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-orange-500/15 bg-[linear-gradient(180deg,rgba(18,18,18,0.97),rgba(10,10,10,0.98))]">
          <CardHeader>
            <CardTitle className="headline-brand text-2xl">This week&apos;s pace-setters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topThree.map((entry, index) => (
              <div key={entry.attempt_id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-200">
                    {index === 0 ? <Crown className="h-5 w-5" /> : <Medal className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{entry.first_name}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{entry.town || "Northamptonshire"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-orange-300">{entry.score}</p>
                  <p className="text-xs text-slate-400">{entry.correct_count} correct</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <section className="overflow-hidden rounded-[32px] border border-orange-500/20 bg-[radial-gradient(circle_at_top_right,rgba(245,124,0,0.22),transparent_30%),linear-gradient(135deg,rgba(245,124,0,0.12),rgba(255,255,255,0.03))] p-8 sm:p-10">
          <div className="flex items-center gap-3 text-orange-200">
            <ArrowUpRight className="h-5 w-5" />
            <p className="text-sm font-semibold uppercase tracking-[0.28em]">Business CTA</p>
          </div>
          <h2 className="headline-brand mt-4 text-3xl font-semibold text-white sm:text-4xl">
            Want an interactive campaign like this for your business?
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-200">
            We build slick lead-gen quizzes, interactive promos, and community-first web experiences.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <Timer className="h-5 w-5 text-orange-300" />
              <p className="mt-3 text-sm font-semibold text-white">Fast mobile journeys</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <Medal className="h-5 w-5 text-orange-300" />
              <p className="mt-3 text-sm font-semibold text-white">Lead-gen with momentum</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <Crown className="h-5 w-5 text-orange-300" />
              <p className="mt-3 text-sm font-semibold text-white">Sponsor-ready presentation</p>
            </div>
          </div>
          <a href={workWithUsUrl}>
            <Button size="lg" className="mt-6">
              Work With Us
            </Button>
          </a>
        </section>
      </section>
    </main>
  );
}
