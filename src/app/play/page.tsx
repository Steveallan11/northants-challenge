import { RegistrationForm } from "@/components/quiz/registration-form";
import { Badge } from "@/components/ui/badge";
import { getActiveQuiz } from "@/lib/data";

export default async function PlayPage({
  searchParams,
}: {
  searchParams: Promise<{ share?: string }>;
}) {
  const quiz = await getActiveQuiz();
  const { share } = await searchParams;

  return (
    <main className="page-shell grid gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div className="space-y-6">
        <Badge>This week&apos;s challenge</Badge>
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">{quiz.title}</h1>
        <p className="max-w-xl text-lg leading-relaxed text-slate-300">{quiz.description}</p>
        <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="font-semibold text-white">Quick entry</p>
            <p className="mt-1">Just your name, email, and optional town.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="font-semibold text-white">One scored attempt</p>
            <p className="mt-1">Fair leaderboard rules, clean weekly competition.</p>
          </div>
        </div>
      </div>

      <RegistrationForm referredByCode={share} />
    </main>
  );
}
