import { NextResponse } from "next/server";

export const runtime = "nodejs";

function cleanEnv(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().replace(/^["']|["']$/g, "");
  return trimmed || undefined;
}

export async function GET() {
  const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL)?.replace(
    /\/$/,
    "",
  );
  const key = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  let host: string | null = null;
  try {
    host = url ? new URL(url).host : null;
  } catch {
    host = "invalid-url";
  }

  if (!url || !key) {
    return NextResponse.json(
      {
        ok: false,
        host,
        keyPresent: Boolean(key),
        error: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      cache: "no-store",
    });

    return NextResponse.json({
      ok: res.ok || res.status === 401,
      host,
      keyPresent: true,
      keyPrefix: key.slice(0, 12),
      healthStatus: res.status,
    });
  } catch (error: unknown) {
    const err = error as Error & { cause?: { code?: string; message?: string } };
    return NextResponse.json(
      {
        ok: false,
        host,
        keyPresent: true,
        keyPrefix: key.slice(0, 12),
        error: err.message,
        cause: err.cause?.code || err.cause?.message || String(err.cause ?? ""),
      },
      { status: 500 },
    );
  }
}
