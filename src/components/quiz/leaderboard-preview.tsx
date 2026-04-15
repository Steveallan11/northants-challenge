import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LeaderboardEntry } from "@/lib/types";

export function LeaderboardPreview({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <Card className="overflow-hidden border-orange-500/15 bg-[linear-gradient(180deg,rgba(17,17,17,0.95),rgba(10,10,10,0.98))]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <Badge className="bg-orange-500 text-white">Leaderboard Preview</Badge>
          <CardTitle className="headline-brand mt-3">This week&apos;s pace-setters</CardTitle>
        </div>
        <Link href="/leaderboard">
          <Button variant="outline" size="sm">
            View Leaderboard
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.slice(0, 5).map((entry, index) => (
          <div key={entry.attempt_id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-sm font-semibold text-white">{index + 1}</div>
              <div>
                <p className="font-medium text-white">{entry.first_name}</p>
                <p className="text-xs text-slate-400">{entry.town || "Northamptonshire"}</p>
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
  );
}
