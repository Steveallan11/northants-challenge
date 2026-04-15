import Link from "next/link";
import { BarChart3, Database, Home, Shield, Trophy, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/quizzes", label: "Quizzes", icon: Trophy },
  { href: "/admin/players", label: "Players", icon: Users },
  { href: "/admin/attempts", label: "Attempts", icon: BarChart3 },
  { href: "/admin/maintenance", label: "Maintenance", icon: Database },
];

export function AdminShell({
  currentPath,
  children,
}: {
  currentPath: string;
  children: React.ReactNode;
}) {
  return (
    <div className="page-shell grid gap-8 py-10 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="glass-panel rounded-[28px] border border-white/10 p-5">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-orange-500/15 p-2 text-orange-300">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Admin HQ</p>
            <p className="text-xs text-slate-400">Quiz control centre</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white",
                  isActive && "bg-orange-500 text-white shadow-xl shadow-orange-500/15",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <Badge variant="secondary">Internal CMS</Badge>
          <p className="mt-3 text-sm text-slate-300">Create each new weekly quiz without touching code.</p>
        </div>
      </aside>

      <main className="space-y-6">{children}</main>
    </div>
  );
}
