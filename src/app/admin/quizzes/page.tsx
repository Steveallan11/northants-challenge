import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getQuizList, requireAdmin } from "@/lib/data";

export default async function AdminQuizzesPage() {
  await requireAdmin();
  const quizzes = await getQuizList();

  return (
    <AdminShell currentPath="/admin/quizzes">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-white">Quizzes</h1>
          <p className="mt-2 text-slate-300">View all quizzes, duplicate the latest one, or tune the current live experience.</p>
        </div>
        <Link href={`/admin/quizzes/${quizzes[0]?.id ?? "new"}`}>
          <Button>Create or edit quiz</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {quizzes.map((quiz) => (
          <Card key={quiz.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>{quiz.title}</CardTitle>
              <Link href={`/admin/quizzes/${quiz.id}`}>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3 text-sm text-slate-300">
              <span>Slug: {quiz.slug}</span>
              <span>Published: {quiz.is_published ? "Yes" : "No"}</span>
              <span>Active: {quiz.is_active ? "Yes" : "No"}</span>
              <span>Timer: {quiz.time_limit_seconds}s</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
