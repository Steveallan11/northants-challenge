import { describe, expect, it } from "vitest";

import { quizSchema, registrationSchema } from "@/lib/validation/schemas";

describe("quiz completion flow validation", () => {
  it("accepts a valid registration payload", () => {
    const result = registrationSchema.safeParse({
      first_name: "Leah",
      email: "leah@example.com",
      town: "Northampton",
      newsletter_opt_in: true,
    });

    expect(result.success).toBe(true);
  });

  it("accepts a valid admin quiz editor payload", () => {
    const result = quizSchema.safeParse({
      id: "7d1dc7df-6500-42e8-9910-4d9c909d0d10",
      title: "Week 2",
      slug: "week-2",
      description: "Another weekly quiz",
      is_published: true,
      is_active: false,
      starts_at: "",
      ends_at: "",
      time_limit_seconds: 15,
      questions: [
        {
          id: "704b031d-fd7d-4d4a-a7b9-64f53de93851",
          sort_order: 1,
          type: "standard",
          prompt: "Which place is in Northamptonshire?",
          extra_text: "",
          image_url: "",
          options: ["Towcester", "Oxford", "Leeds", "Bath"],
          correct_index: 0,
          explanation: "",
          category: "towns",
          difficulty: "easy",
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
