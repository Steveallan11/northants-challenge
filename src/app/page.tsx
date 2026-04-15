import Link from "next/link";
import { ArrowRight, Building2, Flame, MapPinned, Medal, Sparkles, Timer } from "lucide-react";

import { LeaderboardPreview } from "@/components/quiz/leaderboard-preview";
import { ShareButton } from "@/components/quiz/share-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveQuiz, getLeaderboard } from "@/lib/data";
import { safeUrl } from "@/lib/utils";

export default async function HomePage() {
  const [quiz, leaderboard] = await Promise.all([getActiveQuiz(), getLeaderboard("weekly")]);
  const shareUrl = safeUrl("/play");
  const workWithUsUrl = process.env.WORK_WITH_US_URL || "mailto:hello@northantschallenge.co.uk";
  const countyTags = ["Northampton", "Kettering", "Wellingborough", "Towcester", "Rushden", "Corby"];

  return (
    <main className="page-shell space-y-12 py-10 sm:py-16">
      <section className="grid items-center gap-8 lg:grid-cols-[1.18fr_0.82fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="orange-tab border-0 bg-orange-500/15 text-orange-100 ring-0">Built for Northamptonshire</Badge>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-400">
              <MapPinned className="h-3.5 w-3.5 text-orange-300" />
              Support Local • Discover More • Connect
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="headline-brand max-w-4xl text-5xl font-semibold leading-[0.96] text-balance text-white sm:text-6xl lg:text-7xl">
              Think you know Northamptonshire?
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-slate-300">
              Take this week&apos;s fast-paced challenge, climb the leaderboard, and prove you&apos;re a local legend.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/play">
              <Button size="lg">
                Start This Week&apos;s Challenge
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="outline" size="lg">
                View Leaderboard
              </Button>
            </Link>
            <ShareButton
              title="Northants Challenge"
              text="Think you know Northamptonshire? Take this week's challenge."
              url={shareUrl}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {countyTags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
                {tag}
              </span>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Timer, value: `${quiz.time_limit_seconds}s`, label: "Per question" },
              { icon: Medal, value: "100 + speed", label: "Scoring style" },
              { icon: Flame, value: "Weekly", label: "Fresh challenge" },
            ].map((item) => (
              <Card key={item.label} className="overflow-hidden border-orange-500/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="rounded-2xl bg-orange-500/15 p-3 text-orange-200">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">{item.value}</p>
                    <p className="text-sm text-slate-400">{item.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <LeaderboardPreview entries={leaderboard} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr_1fr]">
        {[
          {
            title: "How scoring works",
            body: "Every correct answer starts at 100 points, then your remaining time adds up to 50 bonus points. Fast and accurate wins.",
            icon: Sparkles,
          },
          {
            title: "Sponsor slot",
            body: "This hero placement is ready for a local sponsor spotlight, campaign logo, or weekly partner message.",
            icon: Building2,
          },
          {
            title: "This week's challenge",
            body: quiz.description ?? "A fast, local-knowledge challenge made for Northamptonshire.",
            icon: Medal,
          },
        ].map((item) => (
          <Card key={item.title} className="border-orange-500/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(12,12,12,0.98))]">
            <CardHeader>
              <div className="mb-4 inline-flex rounded-2xl border border-orange-500/20 bg-orange-500/10 p-3 text-orange-200">
                <item.icon className="h-5 w-5" />
              </div>
              <CardTitle className="headline-brand text-2xl">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-slate-300">{item.body}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="overflow-hidden rounded-[32px] border border-orange-500/20 bg-[radial-gradient(circle_at_top_right,rgba(245,124,0,0.22),transparent_30%),linear-gradient(135deg,rgba(245,124,0,0.12),rgba(255,255,255,0.03))] p-8 sm:p-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-200">Business CTA</p>
            <h2 className="headline-brand mt-3 text-3xl font-semibold text-white sm:text-4xl">Want a quiz, promo, or lead-gen page like this for your business?</h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-200">
              We build slick lead-gen quizzes, interactive promos, and community-first web experiences for local brands that want attention and action.
            </p>
          </div>
          <a href={workWithUsUrl} className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              Work With Us
            </Button>
          </a>
        </div>
      </section>
    </main>
  );
}
