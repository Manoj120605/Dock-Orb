import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen grid place-items-center bg-background p-6">
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-lg">
        <p className="mb-2 text-sm font-medium text-primary">Capsule AI</p>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">Authentication is not connected yet. You can continue to the workspace.</p>
        <Link href="/workspace" className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Continue to workspace
        </Link>
      </section>
    </main>
  );
}
