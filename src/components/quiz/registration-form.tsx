"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";

import { startQuizAction } from "@/app/play/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registrationSchema } from "@/lib/validation/schemas";

type FormValues = z.infer<typeof registrationSchema>;

function getAttemptLockKey(quizSlug: string, email: string) {
  return `northants-attempt-lock:${quizSlug}:${email.trim().toLowerCase()}`;
}

export function RegistrationForm({ referredByCode, quizSlug }: { referredByCode?: string; quizSlug: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(registrationSchema) as never,
    defaultValues: {
      first_name: "",
      email: "",
      town: "",
      newsletter_opt_in: false,
      referred_by_code: referredByCode ?? "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const lockKey = getAttemptLockKey(quizSlug, values.email);
      const existingAttemptId = typeof window !== "undefined" ? window.localStorage.getItem(lockKey) : null;
      if (existingAttemptId) {
        toast.message("That email has already used its scored run for this challenge.");
        router.push(`/results/${existingAttemptId}?alreadyPlayed=1`);
        return;
      }

      const result = await startQuizAction({
        ...values,
        newsletter_opt_in: newsletterOptIn,
        referred_by_code: referredByCode ?? undefined,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      if (result.alreadyPlayed && result.attemptId) {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(lockKey, result.attemptId);
        }
        toast.message("That email has already used its scored run, so we've opened the saved result.");
        router.push(`/results/${result.attemptId}?alreadyPlayed=1`);
        return;
      }

      if (result.attemptId && typeof window !== "undefined") {
        window.localStorage.setItem(lockKey, result.attemptId);
      }

      router.push(`/quiz/${result.quizSlug}?attemptId=${result.attemptId}`);
    });
  });

  return (
    <Card className="max-w-xl border-orange-500/20 bg-[linear-gradient(180deg,rgba(22,22,22,0.96),rgba(12,12,12,0.96))]">
      <CardHeader>
        <div className="inline-flex w-fit rounded-full border border-orange-500/30 bg-orange-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-orange-200">
          Community Question
        </div>
        <CardTitle className="font-[var(--font-display)] uppercase tracking-[0.04em]">Start this week&apos;s challenge</CardTitle>
        <CardDescription>One scored attempt per email each week. Quick to enter, easy on mobile, built for proper local bragging rights.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="first_name">First name</Label>
            <Input id="first_name" {...form.register("first_name")} />
            {form.formState.errors.first_name ? <p className="mt-2 text-xs text-red-300">{form.formState.errors.first_name.message}</p> : null}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} />
            {form.formState.errors.email ? <p className="mt-2 text-xs text-red-300">{form.formState.errors.email.message}</p> : null}
          </div>

          <div>
            <Label htmlFor="town">Town (optional)</Label>
            <Input id="town" {...form.register("town")} />
          </div>

          <div className="rounded-2xl border border-orange-500/15 bg-white/[0.03] p-4">
            <div className="flex items-start gap-3">
              <Checkbox checked={newsletterOptIn} onCheckedChange={setNewsletterOptIn} aria-label="Opt in to the newsletter" />
              <div>
                <p className="text-sm font-medium text-white">Keep me posted on future challenges and local updates</p>
                <p className="mt-1 text-sm text-slate-400">Optional. We only send the good stuff.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#161616] p-4 text-sm text-slate-300">
            <p className="font-semibold uppercase tracking-[0.14em] text-orange-200">One answer only.</p>
            <p className="mt-2 text-sm leading-relaxed">
              Use the same email twice on the same weekly quiz and we&apos;ll take you straight back to your original scored result.
            </p>
          </div>

          <p className="text-xs leading-relaxed text-slate-400">
            By continuing, you agree to the <a href="/terms" className="text-white underline">competition rules</a> and confirm you&apos;ve read the{" "}
            <a href="/privacy" className="text-white underline">
              privacy notice
            </a>
            .
          </p>

          <Button type="submit" size="lg" className="w-full" disabled={isPending}>
            {isPending ? "Starting..." : "Start This Week's Challenge"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
