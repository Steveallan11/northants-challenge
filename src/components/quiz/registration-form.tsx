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

export function RegistrationForm({ referredByCode }: { referredByCode?: string }) {
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
        router.push(`/results/${result.attemptId}?alreadyPlayed=1`);
        return;
      }

      router.push(`/quiz/${result.quizSlug}?attemptId=${result.attemptId}`);
    });
  });

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Start this week&apos;s challenge</CardTitle>
        <CardDescription>One scored attempt per email each week. Quick to enter, even quicker to play.</CardDescription>
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

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-start gap-3">
              <Checkbox checked={newsletterOptIn} onCheckedChange={setNewsletterOptIn} aria-label="Opt in to the newsletter" />
              <div>
                <p className="text-sm font-medium text-white">Keep me posted on future challenges and local updates</p>
                <p className="mt-1 text-sm text-slate-400">Optional. We only send the good stuff.</p>
              </div>
            </div>
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
