"use server";

import { submitAttempt } from "@/lib/data";
import { attemptSubmissionSchema } from "@/lib/validation/schemas";

export async function submitAttemptAction(input: unknown) {
  const parsed = attemptSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid quiz submission.",
    };
  }

  try {
    const attempt = await submitAttempt(parsed.data);
    return {
      success: true,
      attemptId: "id" in attempt ? attempt.id : attempt.attemptId,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to submit your score.",
    };
  }
}
