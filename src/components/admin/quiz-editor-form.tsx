"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";

import { saveQuizAction } from "@/app/admin/quizzes/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QUESTION_TYPES } from "@/lib/constants";
import type { QuizWithQuestions } from "@/lib/types";
import { quizSchema } from "@/lib/validation/schemas";

type QuizFormValues = z.infer<typeof quizSchema>;

export function QuizEditorForm({ quiz }: { quiz: QuizWithQuestions }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema) as never,
    defaultValues: {
      ...quiz,
      description: quiz.description ?? "",
      starts_at: quiz.starts_at ?? "",
      ends_at: quiz.ends_at ?? "",
      questions: quiz.questions.map((question) => ({
        ...question,
        extra_text: question.extra_text ?? "",
        image_url: question.image_url ?? "",
        explanation: question.explanation ?? "",
        category: question.category ?? "",
        difficulty: (question.difficulty as "easy" | "medium" | "hard" | undefined) ?? "easy",
      })),
    },
  });
  const fieldArray = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await saveQuizAction(values);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Quiz saved");
      router.refresh();
    });
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Quiz settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register("title")} />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" {...form.register("slug")} />
          </div>
          <div>
            <Label htmlFor="time_limit_seconds">Timer (seconds)</Label>
            <Input id="time_limit_seconds" type="number" {...form.register("time_limit_seconds", { valueAsNumber: true })} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register("description")} />
          </div>
          <div>
            <Label htmlFor="starts_at">Starts at</Label>
            <Input id="starts_at" type="datetime-local" {...form.register("starts_at")} />
          </div>
          <div>
            <Label htmlFor="ends_at">Ends at</Label>
            <Input id="ends_at" type="datetime-local" {...form.register("ends_at")} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {fieldArray.fields.map((field, index) => (
          <Card key={field.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Question {index + 1}</CardTitle>
              <Button type="button" variant="ghost" size="sm" onClick={() => fieldArray.remove(index)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <Label>Prompt</Label>
                <Textarea {...form.register(`questions.${index}.prompt`)} />
              </div>
              <div>
                <Label>Extra text</Label>
                <Textarea {...form.register(`questions.${index}.extra_text`)} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Type</Label>
                  <select
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
                    {...form.register(`questions.${index}.type`)}
                  >
                    {QUESTION_TYPES.map((type) => (
                      <option key={type} value={type} className="bg-slate-900">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Correct option index</Label>
                  <Input type="number" {...form.register(`questions.${index}.correct_index`, { valueAsNumber: true })} />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {[0, 1, 2, 3].map((optionIndex) => (
                  <div key={optionIndex}>
                    <Label>Option {optionIndex + 1}</Label>
                    <Input {...form.register(`questions.${index}.options.${optionIndex}`)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            fieldArray.append({
              id: crypto.randomUUID(),
              sort_order: fieldArray.fields.length + 1,
              type: "standard",
              prompt: "",
              extra_text: "",
              image_url: "",
              options: ["", "", "", ""],
              correct_index: 0,
              explanation: "",
              category: "",
              difficulty: "easy",
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Quiz"}
        </Button>
      </div>
    </form>
  );
}
