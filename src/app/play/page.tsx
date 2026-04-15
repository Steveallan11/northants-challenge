import { RegistrationForm } from "@/components/quiz/registration-form";
import { BackendStatusBanner } from "@/components/ui/backend-status-banner";
import { Badge } from "@/components/ui/badge";
import { getActiveQuiz, getBackendStatus } from "@/lib/data";

export default async function PlayPage({
  searchParams,
}: {
  searchParams: Promise<{ share?: string }>;
}) {
  const [quiz, backendStatus] = await Promise.all([getActiveQuiz(), getBackendStatus()]);
  const { share } = await searchParams;

  return (
    <main className="page-shell space-y-6 py-10">
      <BackendStatusBanner status={backendStatus} />
      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div className="space-y-6">
        <Badge className="bg-orange-500 text-white">Question Of The Day</Badge>
        <h1 className="font-[var(--font-display)] text-4xl font-semibold uppercase leading-none text-white sm:text-5xl">{quiz.title}</h1>
        <p className="max-w-xl text-lg leading-relaxed text-slate-300">{quiz.description}</p>
        <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
          <div className="rounded-2xl border border-orange-500/20 bg-[#151515] p-4">
            <p className="font-semibold text-white">Quick entry</p>
            <p className="mt-1">Just your name, email, and optional town.</p>
          </div>
          <div className="rounded-2xl border border-orange-500/20 bg-[#151515] p-4">
            <p className="font-semibold text-white">One scored attempt</p>
            <p className="mt-1">Fair leaderboard rules, clean weekly competition.</p>
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-gradient-to-r from-white to-[#f4f4f2] p-6 text-[#111111] shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f57c00]">Northamptonshire flavour</p>
          <p className="mt-3 font-[var(--font-display)] text-2xl uppercase leading-tight">Settle it like a proper local debate.</p>
          <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">
            Big headlines, fast answers, and a leaderboard built for the people who know their county best.
          </p>
        </div>
      </div>

      <RegistrationForm referredByCode={share} quizSlug={quiz.slug} />
      </section>
    </main>
  );
}
