"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Clock3 } from "lucide-react";
import { toast } from "sonner";

import { submitAttemptAction } from "@/app/quiz/[slug]/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { QuizWithQuestions } from "@/lib/types";

type Answer = {
  questionId: string;
  selectedIndex: number | null;
  responseMs: number | null;
  timeRemainingMs: number | null;
};

export function QuizRunner({ quiz, attemptId }: { quiz: QuizWithQuestions; attemptId: string }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState(quiz.time_limit_seconds * 1000);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [isPending, startTransition] = useTransition();

  const question = quiz.questions[currentIndex];
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;

  useEffect(() => {
    setRemainingMs(quiz.time_limit_seconds * 1000);
    setIsLocked(false);
    setStartTime(Date.now());
  }, [currentIndex, quiz.time_limit_seconds]);

  useEffect(() => {
    if (isLocked) return;

    const interval = window.setInterval(() => {
      setRemainingMs((previous) => {
        if (previous <= 100) {
          window.clearInterval(interval);
          handleAnswer(null, 0);
          return 0;
        }

        return previous - 100;
      });
    }, 100);

    return () => window.clearInterval(interval);
  });

  const secondsRemaining = Math.ceil(remainingMs / 1000);
  const timerWidth = `${(remainingMs / (quiz.time_limit_seconds * 1000)) * 100}%`;

  const handleAnswer = (selectedIndex: number | null, timeLeft: number) => {
    if (isLocked || !question) return;

    setIsLocked(true);
    const responseMs = Date.now() - startTime;
    const nextAnswer: Answer = { questionId: question.id, selectedIndex, responseMs, timeRemainingMs: timeLeft };

    setAnswers((current) => [...current.filter((item) => item.questionId !== question.id), nextAnswer]);

    window.setTimeout(() => {
      if (currentIndex === quiz.questions.length - 1) {
        startTransition(async () => {
          const result = await submitAttemptAction({
            attemptId,
            quizSlug: quiz.slug,
            answers: [...answers.filter((item) => item.questionId !== question.id), nextAnswer],
          });

          if (!result.success || !result.attemptId) {
            toast.error(result.message || "We couldn't submit your score.");
            return;
          }

          router.push(`/results/${result.attemptId}`);
        });
      } else {
        setCurrentIndex((index) => index + 1);
      }
    }, 650);
  };

  const statusLabel = useMemo(() => {
    switch (question.type) {
      case "emoji_clue":
        return "Emoji clue";
      case "image_round":
        return "Image round";
      case "heritage_round":
        return "Heritage round";
      default:
        return "Fast question";
    }
  }, [question.type]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Badge>{statusLabel}</Badge>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Clock3 className="h-4 w-4 text-orange-300" />
            {secondsRemaining}s left
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/8">
          <div className="h-full rounded-full bg-orange-500 transition-[width] duration-100" style={{ width: timerWidth }} />
        </div>
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            Question {currentIndex + 1} of {quiz.questions.length}
          </span>
          <span>{Math.round(progress)}% complete</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.25 }}
        >
          <Card>
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="space-y-4">
                <h1 className="text-2xl font-semibold leading-tight text-balance text-white sm:text-3xl">{question.prompt}</h1>
                {question.extra_text ? <p className="text-base leading-relaxed text-slate-300">{question.extra_text}</p> : null}
                {question.image_url ? (
                  <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={question.image_url} alt={question.prompt} className="h-56 w-full object-cover" />
                  </div>
                ) : null}
              </div>

              <div className="grid gap-3">
                {question.options.map((option, index) => (
                  <Button
                    key={option}
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={isLocked || isPending}
                    className="min-h-16 justify-start whitespace-normal rounded-[24px] border-white/10 bg-white/[0.03] px-5 text-left text-base hover:scale-[1.01] hover:border-orange-400 hover:bg-orange-500/10"
                    onClick={() => handleAnswer(index, remainingMs)}
                  >
                    <span className="mr-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-sm font-semibold text-orange-200">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
