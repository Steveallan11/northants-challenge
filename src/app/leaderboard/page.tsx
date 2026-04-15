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
          <h1 className="text-4xl font-semibold text-white">Leaderboard</h1>
          <p className="mt-2 text-slate-300">Fastest minds. Strongest scores. Updated with every completed challenge.</p>
        </div>
        <SegmentTabs
          active={scope}
          items={[
            { key: "weekly", label: "Weekly", href: "/leaderboard?scope=weekly" },
            { key: "all-time", label: "All-time", href: "/leaderboard?scope=all-time" },
          ]}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{scope === "weekly" ? "This week" : "All-time"} standings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {entries.map((entry, index) => (
            <div
              key={entry.attempt_id}
              className={`flex items-center justify-between rounded-2xl border px-4 py-4 ${attemptId === entry.attempt_id ? "border-orange-400 bg-orange-500/10" : "border-white/10 bg-white/[0.03]"}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8 text-sm font-semibold text-white">{index + 1}</div>
                <div>
                  <p className="font-medium text-white">{entry.first_name}</p>
                  <p className="text-sm text-slate-400">{entry.town || "Northamptonshire"}</p>
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
