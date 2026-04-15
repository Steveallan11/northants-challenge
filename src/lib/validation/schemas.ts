import { z } from "zod";

import { DIFFICULTIES, QUESTION_TYPES } from "@/lib/constants";

export const registrationSchema = z.object({
  first_name: z.string().trim().min(2, "Enter your first name"),
  email: z.email("Enter a valid email").transform((value) => value.toLowerCase()),
  town: z.string().trim().max(80).optional().or(z.literal("")),
  newsletter_opt_in: z.boolean().default(false),
  referred_by_code: z.string().trim().optional(),
});

export const optionSchema = z.string().trim().min(1, "Each option needs text");

export const questionSchema = z.object({
  id: z.string().uuid().optional(),
  sort_order: z.number().int().min(0),
  type: z.enum(QUESTION_TYPES),
  prompt: z.string().trim().min(8, "Prompt is too short"),
  extra_text: z.string().trim().max(300).optional().or(z.literal("")),
  image_url: z.url().optional().or(z.literal("")),
  options: z.array(optionSchema).length(4),
  correct_index: z.number().int().min(0).max(3),
  explanation: z.string().trim().max(500).optional().or(z.literal("")),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  difficulty: z.enum(DIFFICULTIES).optional(),
});

export const quizSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(6, "Add a stronger title"),
  slug: z
    .string()
    .trim()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens"),
  description: z.string().trim().max(220).optional().or(z.literal("")),
  is_published: z.boolean().default(false),
  is_active: z.boolean().default(false),
  starts_at: z.string().optional().or(z.literal("")),
  ends_at: z.string().optional().or(z.literal("")),
  time_limit_seconds: z.number().int().min(5).max(60),
  questions: z.array(questionSchema).min(1, "Add at least one question"),
});

export const adminLoginSchema = z.object({
  email: z.email("Enter your admin email"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export const attemptSubmissionSchema = z.object({
  attemptId: z.string().uuid(),
  quizSlug: z.string().trim().min(3),
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      selectedIndex: z.number().int().min(0).max(3).nullable(),
      responseMs: z.number().int().min(0).nullable(),
      timeRemainingMs: z.number().int().min(0).nullable(),
    }),
  ),
});
