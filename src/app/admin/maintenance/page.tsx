import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/data";

export default async function AdminMaintenancePage() {
  await requireAdmin();

  return (
    <AdminShell currentPath="/admin/maintenance">
      <div>
        <h1 className="text-4xl font-semibold text-white">Maintenance</h1>
        <p className="mt-2 text-slate-300">Quick access to exports and common housekeeping actions.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { title: "Export players CSV", href: "/api/export/players" },
          { title: "Export newsletter opt-ins", href: "/api/export/newsletter" },
          { title: "Export attempts", href: "/api/export/attempts" },
          { title: "Export leaderboard", href: "/api/export/leaderboard" },
        ].map((item) => (
          <Card key={item.href}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={item.href}>
                <Button variant="outline">Download</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
