export function OnboardingFallback() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-background px-6">
      <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}
