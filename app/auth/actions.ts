"use server";

import { createClient } from "@/lib/supabase/server";
import { getPostAuthPath } from "@/lib/profile";

export type AuthActionResult =
  | { ok: true; nextPath: string }
  | { ok: false; error: string };

function authErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    const cause = (error as Error & { cause?: { code?: string; message?: string } })
      .cause;
    const detail = cause?.code || cause?.message;
    if (/failed to fetch|fetch failed|networkerror/i.test(error.message)) {
      return detail
        ? `Could not reach Supabase (${detail}). Check Vercel env vars and redeploy.`
        : "Could not reach Supabase from the server. Check NEXT_PUBLIC_SUPABASE_URL on Vercel and redeploy.";
    }
    return detail ? `${error.message} (${detail})` : error.message;
  }
  return "An error occurred";
}

function fromAuthError(error: { message: string }): AuthActionResult {
  return { ok: false, error: authErrorMessage(new Error(error.message)) };
}

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<AuthActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return fromAuthError(error);

    const nextPath = await getPostAuthPath();
    return { ok: true, nextPath };
  } catch (error: unknown) {
    return { ok: false, error: authErrorMessage(error) };
  }
}

export async function signUpWithPassword(
  email: string,
  password: string,
  emailRedirectTo: string,
): Promise<AuthActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo },
    });
    if (error) return fromAuthError(error);

    return { ok: true, nextPath: "/auth/sign-up-success" };
  } catch (error: unknown) {
    return { ok: false, error: authErrorMessage(error) };
  }
}
