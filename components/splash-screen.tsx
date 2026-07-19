"use client";

import { useState } from "react";

import { AvessaLogo } from "@/components/avessa-logo";
import { WelcomeScreen } from "@/components/welcome-screen";

export function SplashScreen() {
  const [showWelcome, setShowWelcome] = useState(false);

  if (showWelcome) {
    return <WelcomeScreen />;
  }

  return (
    <button
      type="button"
      onClick={() => setShowWelcome(true)}
      className="relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden bg-zinc-950 text-left"
      aria-label="Continue to Avessa"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/splash.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[32%_70%]"
      />
      {/* Soft vignette so the logo reads without a white card */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/70" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/25 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center px-6">
        <AvessaLogo size="lg" onDark priority />
      </div>
    </button>
  );
}
