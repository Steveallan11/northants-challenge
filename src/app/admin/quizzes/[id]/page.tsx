import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { QuizEditorForm } from "@/components/admin/quiz-editor-form";
import { getQuizById, requireAdmin } from "@/lib/data";
import { seededQuiz } from "@/lib/seed";

export default async function AdminQuizEditorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const quiz = (id === "new" ? seededQuiz : await getQuizById(id)) ?? null;

  if (!quiz) {
    notFound();
  }

  return (
    <AdminShell currentPath="/admin/quizzes">
      <div>
        <h1 className="text-4xl font-semibold text-white">Quiz editor</h1>
        <p className="mt-2 text-slate-300">Edit title, slug, timing, questions, and answer keys in one place.</p>
      </div>
      <QuizEditorForm quiz={quiz} />
    </AdminShell>
  );
}
