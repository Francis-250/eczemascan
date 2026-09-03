export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-neutral-950">
      <main className="flex flex-1 items-center justify-center">
        {children}
      </main>
    </div>
  );
}
