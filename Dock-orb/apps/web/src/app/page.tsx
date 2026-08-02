import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 h-16 flex items-center border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <div className="w-2 h-2 bg-background rounded-full" />
          </div>
          Capsule AI
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/login">
            Login
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 sm:py-32">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-8 ring-1 ring-primary/30">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.5)]">
            <div className="w-3 h-3 bg-background rounded-full" />
          </div>
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60">
          The Domain-Agnostic <br /> AI Workspace
        </h1>
        <p className="max-w-[600px] text-muted-foreground text-lg sm:text-xl mb-10">
          Replace ephemeral chat history with persistent project memory. Switch seamlessly between OpenAI, Anthropic, Gemini, and Local Models without losing context.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            href="/workspace" 
            className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Enter Workspace
          </Link>
          <Link 
            href="https://github.com" 
            className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            View Documentation
          </Link>
        </div>
      </main>
      <footer className="py-6 flex flex-col sm:flex-row items-center px-6 border-t border-border/40">
        <p className="text-xs text-muted-foreground">
          © 2026 Capsule AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
