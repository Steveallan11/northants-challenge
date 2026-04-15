import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAttempts, requireAdmin } from "@/lib/data";

export default async function AdminAttemptsPage() {
  await requireAdmin();
  const attempts = await getAttempts();

  return (
    <AdminShell currentPath="/admin/attempts">
      <div>
        <h1 className="text-4xl font-semibold text-white">Attempts</h1>
        <p className="mt-2 text-slate-300">Inspect scores, completion status, and suspicious entries.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent attempts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {attempts.map((attempt) => (
            <div key={attempt.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div>
                <p className="font-medium text-white">{attempt.players?.first_name ?? "Player"}</p>
                <p className="text-sm text-slate-400">{attempt.quizzes?.title ?? "Quiz"}</p>
              </div>
              <div className="text-right text-sm text-slate-300">
                <p>{attempt.score} pts</p>
                <p>{attempt.completed_at ? "Completed" : "In progress"}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
