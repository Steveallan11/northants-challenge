import { SegmentTabs } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLeaderboard } from "@/lib/data";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: "weekly" | "all-time"; attemptId?: string }>;
}) {
  const { scope = "weekly", attemptId } = await searchParams;
  const entries = await getLeaderboard(scope);

  return (
    <main className="page-shell space-y-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="orange-tab">Northants standings</div>
          <h1 className="headline-brand mt-4 text-4xl font-semibold text-white sm:text-5xl">Leaderboard</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Fastest minds. Strongest scores. Updated with every completed challenge across Northamptonshire.</p>
        </div>
        <SegmentTabs
          active={scope}
          items={[
            { key: "weekly", label: "Weekly", href: "/leaderboard?scope=weekly" },
            { key: "all-time", label: "All-time", href: "/leaderboard?scope=all-time" },
          ]}
        />
      </div>

      <Card className="overflow-hidden border-orange-500/15 bg-[linear-gradient(180deg,rgba(18,18,18,0.97),rgba(10,10,10,0.98))]">
        <CardHeader>
          <CardTitle className="headline-brand text-2xl">{scope === "weekly" ? "This week" : "All-time"} standings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {entries.map((entry, index) => (
            <div
              key={entry.attempt_id}
              className={`flex items-center justify-between rounded-[24px] border px-4 py-4 ${
                attemptId === entry.attempt_id ? "border-orange-400 bg-orange-500/10 shadow-[0_20px_40px_-28px_rgba(245,124,0,0.85)]" : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold ${index < 3 ? "border border-orange-500/20 bg-orange-500/12 text-orange-100" : "bg-white/8 text-white"}`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-white">{entry.first_name}</p>
                  <p className="text-sm uppercase tracking-[0.16em] text-slate-400">{entry.town || "Northamptonshire"}</p>
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
    </main>
  );
}
