import Link from "next/link";
import { Suspense } from "react";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <p className="mt-3 text-base text-muted-foreground">
      {params?.error
        ? `Code error: ${params.error}`
        : "An unspecified error occurred."}
    </p>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center bg-background px-6 pb-10 pt-16">
      <h1 className="text-[2rem] font-bold tracking-tight">
        Sorry, something went wrong.
      </h1>
      <Suspense>
        <ErrorContent searchParams={searchParams} />
      </Suspense>
      <Link
        href="/auth/login"
        className="mt-8 text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        Back to login
      </Link>
    </div>
  );
}
