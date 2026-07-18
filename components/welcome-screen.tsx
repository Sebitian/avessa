import Link from "next/link";

import { Button } from "@/components/ui/button";

export function WelcomeScreen() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background px-6 pb-10 pt-16">
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-foreground">
          Never a Stranger.
        </h1>
        <p className="mt-4 max-w-[18rem] text-base leading-relaxed text-muted-foreground">
          Meet travelers and locals. Discover authentic places. Explore with
          confidence.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <Button
          asChild
          className="h-12 w-full rounded-xl text-base font-semibold"
        >
          <Link href="/auth/sign-up">Get Started</Link>
        </Button>

        <div className="flex items-center justify-center gap-2" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="h-2 w-2 rounded-full bg-border" />
          <span className="h-2 w-2 rounded-full bg-border" />
        </div>
      </div>
    </div>
  );
}
