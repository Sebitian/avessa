import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center bg-background px-6 pb-10 pt-16">
      <h1 className="text-[2rem] font-bold tracking-tight">
        Thank you for signing up!
      </h1>
      <p className="mt-3 text-base text-muted-foreground">
        Check your email to confirm your account before signing in.
      </p>
      <Link
        href="/auth/login"
        className="mt-8 text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        Go to sign in
      </Link>
    </div>
  );
}
