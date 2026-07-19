import { SplashScreen } from "@/components/splash-screen";

export default function Home() {
  return (
    <main className="flex min-h-full justify-center">
      <div className="flex min-h-full w-full max-w-md flex-col bg-background shadow-xl shadow-black/5 sm:min-h-[100dvh]">
        <SplashScreen />
      </div>
    </main>
  );
}
