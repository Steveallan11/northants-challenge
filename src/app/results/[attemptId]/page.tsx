import Link from "next/link";

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
  const shareText = `I scored ${result.attempt.score} on this week's Northants Challenge — can you beat me?`;

  return (
    <main className="page-shell space-y-8 py-10">
      {alreadyPlayed ? (
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-100">
          Your scored attempt for this week has already been used, so we&apos;ve shown your existing result instead.
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <Badge>{result.badge}</Badge>
            <CardTitle className="mt-3 text-3xl">Nice run, {result.player.first_name}</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle>Keep the challenge moving</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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

      <section className="rounded-[32px] border border-orange-500/20 bg-gradient-to-br from-orange-500/15 to-transparent p-8 sm:p-10">
        <h2 className="text-3xl font-semibold text-white">Want an interactive campaign like this for your business?</h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-200">
          We build slick lead-gen quizzes, interactive promos, and community-first web experiences.
        </p>
        <a href={workWithUsUrl}>
          <Button size="lg" className="mt-6">
            Work With Us
          </Button>
        </a>
      </section>
    </main>
  );
}
