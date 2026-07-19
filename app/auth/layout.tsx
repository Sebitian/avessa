export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="light flex min-h-svh justify-center bg-zinc-200">
      <div className="flex min-h-svh w-full max-w-md flex-col bg-background text-foreground shadow-xl shadow-black/5">
        {children}
      </div>
    </div>
  );
}
