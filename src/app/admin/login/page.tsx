"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getFirebaseClientAuth, hasFirebaseClientConfig } from "@/lib/firebase-client";
import { adminLoginSchema } from "@/lib/validation/schemas";

type FormValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(adminLoginSchema) as never,
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        if (!hasFirebaseClientConfig()) {
          toast.success("Firebase client config is missing, so the app is using preview mode.");
          router.push("/admin");
          router.refresh();
          return;
        }

        const auth = getFirebaseClientAuth();
        const credential = await signInWithEmailAndPassword(auth, values.email, values.password ?? "");
        const idToken = await credential.user.getIdToken();
        const response = await fetch("/api/admin/session-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
        });

        const result = (await response.json()) as { success: boolean; message?: string };
        if (!response.ok || !result.success) {
          toast.error(result.message || "Admin sign-in failed.");
          return;
        }

        toast.success("Admin session ready.");
        router.push("/admin");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to sign in.");
      }
    });
  });

  return (
    <main className="page-shell flex min-h-[70vh] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin login</CardTitle>
          <CardDescription>Admin access now runs through Firebase Auth, with Cloud SQL checking whether the signed-in email is approved.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...form.register("password")} />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in..." : "Enter admin"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
