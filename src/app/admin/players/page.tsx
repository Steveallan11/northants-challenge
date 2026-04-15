import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlayers, requireAdmin } from "@/lib/data";

export default async function AdminPlayersPage() {
  await requireAdmin();
  const players = await getPlayers();

  return (
    <AdminShell currentPath="/admin/players">
      <div>
        <h1 className="text-4xl font-semibold text-white">Players</h1>
        <p className="mt-2 text-slate-300">Search, export, and review quiz players and newsletter opt-ins.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Player list</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {players.map((player) => (
            <div key={player.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div>
                <p className="font-medium text-white">{player.first_name}</p>
                <p className="text-sm text-slate-400">{player.email}</p>
              </div>
              <div className="text-right text-sm text-slate-300">
                <p>{player.town || "No town"}</p>
                <p>{player.newsletter_opt_in ? "Opted in" : "Not opted in"}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
