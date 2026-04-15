import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminShell } from "@/components/admin/admin-shell";
import { getDashboardData, requireAdmin } from "@/lib/data";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const dashboard = await getDashboardData();

  const stats = [
    { label: "Active quiz", value: dashboard.activeQuiz?.title ?? "None" },
    { label: "Total plays this week", value: `${dashboard.totalStarts}` },
    { label: "Total completions", value: `${dashboard.totalCompletions}` },
    { label: "Average score", value: `${dashboard.averageScore}` },
    { label: "Completion rate", value: `${dashboard.completionRate}%` },
    { label: "Newsletter opt-ins", value: `${dashboard.newsletterOptIns}` },
    { label: "Total shares", value: `${dashboard.totalShares}` },
    { label: "Share conversion", value: `${dashboard.shareConversion}%` },
  ];

  return (
    <AdminShell currentPath="/admin">
      <div>
        <h1 className="text-4xl font-semibold text-white">Dashboard</h1>
        <p className="mt-2 text-slate-300">Monitor weekly performance, leads, and quiz health in one place.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent players</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.recentPlayers.map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div>
                  <p className="font-medium text-white">{attempt.players?.first_name ?? "Player"}</p>
                  <p className="text-sm text-slate-400">{attempt.players?.email ?? "No email"}</p>
                </div>
                <div className="text-right text-sm text-slate-300">
                  <p>{attempt.score} pts</p>
                  <p>{attempt.completed_at ? "Completed" : "In progress"}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top scores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.topScores.map((entry, index) => (
              <div key={entry.attempt_id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div>
                  <p className="font-medium text-white">
                    #{index + 1} {entry.first_name}
                  </p>
                  <p className="text-sm text-slate-400">{entry.town || "Northamptonshire"}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-orange-300">{entry.score}</p>
                  <p className="text-xs text-slate-400">{entry.correct_count} correct</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  );
}
