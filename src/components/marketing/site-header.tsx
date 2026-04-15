import Link from "next/link";
import { MapPinned, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="brand-footer-strip">
        <div className="page-shell flex items-center gap-2 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-100/90">
          <MapPinned className="h-3.5 w-3.5 text-orange-300" />
          Northamptonshire Community Quiz
        </div>
      </div>
      <div className="page-shell flex h-18 items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3 text-white">
          <div className="rounded-2xl border border-orange-500/20 bg-orange-500/15 p-2 text-orange-300">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="headline-brand text-sm font-semibold text-orange-200">Northants Challenge</div>
            <div className="text-xs text-slate-400">Support local • Discover more • Connect</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-3 md:flex">
          <Link href="/leaderboard" className="text-sm text-slate-300 hover:text-white">
            Leaderboard
          </Link>
          <Link href="/play">
            <Button size="sm">Start This Week&apos;s Challenge</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
