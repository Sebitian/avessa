import Link from "next/link";

import { AvessaLogo } from "@/components/avessa-logo";
import { Button } from "@/components/ui/button";

export function WelcomeScreen() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background px-6 pb-10 pt-12">
      <div className="flex flex-1 flex-col">
        <div className="flex justify-center pt-4">
          <AvessaLogo size="lg" />
        </div>

        <div className="mt-10 flex flex-1 flex-col justify-center">
          <h1 className="sr-only">Never a Stranger.</h1>
          <p className="max-w-[20rem] text-base leading-relaxed text-muted-foreground">
            Meet travelers and locals. Discover authentic places. Explore with
            confidence.
          </p>
        </div>
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
