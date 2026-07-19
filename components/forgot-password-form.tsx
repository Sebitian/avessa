"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className={cn(
          "flex min-h-full flex-1 flex-col justify-center bg-background px-6 pb-10 pt-16",
          className,
        )}
        {...props}
      >
        <h1 className="text-[2rem] font-bold tracking-tight">
          Check your email
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          If you registered using your email and password, you will receive a
          password reset email.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-full flex-1 flex-col bg-background px-6 pb-10 pt-16",
        className,
      )}
      {...props}
    >
      <div className="flex flex-1 flex-col justify-center gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-[2rem] font-bold tracking-tight">
            Reset your password
          </h1>
          <p className="text-base text-muted-foreground">
            Type in your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            className="h-12 w-full rounded-xl text-base font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send reset email"}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/auth/login"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
