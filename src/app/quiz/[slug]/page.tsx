import { notFound } from "next/navigation";

import { QuizRunner } from "@/components/quiz/quiz-runner";
import { getQuizBySlug } from "@/lib/data";

export default async function QuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ attemptId?: string }>;
}) {
  const { slug } = await params;
  const { attemptId } = await searchParams;
  const quiz = await getQuizBySlug(slug);

  if (!quiz || !attemptId) {
    notFound();
  }

  return (
    <main className="page-shell py-8 sm:py-12">
      <QuizRunner quiz={quiz} attemptId={attemptId} />
    </main>
  );
}
