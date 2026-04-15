"use server";

import { registrationSchema } from "@/lib/validation/schemas";
import { registerPlayerForActiveQuiz } from "@/lib/data";

export async function startQuizAction(input: unknown) {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Please check your details and try again.",
    };
  }

  try {
    const result = await registerPlayerForActiveQuiz(parsed.data);
    return {
      success: true,
      attemptId: result.attemptId,
      quizSlug: result.quizSlug,
      alreadyPlayed: result.alreadyPlayed,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "We couldn't start the quiz.",
    };
  }
}
