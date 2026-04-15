"use server";

import { upsertQuiz } from "@/lib/data";
import { quizSchema } from "@/lib/validation/schemas";

export async function saveQuizAction(input: unknown) {
  const parsed = quizSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Check the quiz details and try again.",
    };
  }

  try {
    await upsertQuiz(parsed.data);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to save quiz.",
    };
  }
}
