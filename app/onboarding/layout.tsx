export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-full justify-center">
      <div className="flex min-h-full w-full max-w-md flex-col bg-background shadow-xl shadow-black/5 sm:min-h-[100dvh]">
        {children}
      </div>
    </main>
  );
}
