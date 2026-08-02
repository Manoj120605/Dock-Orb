import Link from "next/link";
import { ArrowRight, Bot, Boxes, ShieldCheck, Waypoints } from "lucide-react";
import { ArchitectureMap } from "@/components/architecture/ArchitectureMap";

const features = [
  { icon: Boxes, title: "Persistent Capsules", text: "Turn conversations, specifications, and decisions into portable project memory." },
  { icon: Waypoints, title: "Model-neutral routing", text: "Use the right model for each task without fragmenting the team’s context." },
  { icon: Bot, title: "Executable skills", text: "Bring approved domain expertise into a governed, repeatable AI workflow." },
  { icon: ShieldCheck, title: "Controlled by design", text: "Keep authentication, usage data, and infrastructure boundaries visible." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 px-6 backdrop-blur-xl md:px-12">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between">
          <Link href="/" className="font-display text-2xl font-bold italic tracking-tight">Capsule <span className="text-[#c9b8a0]">AI</span></Link>
          <nav className="hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[.15em] text-white/55 md:flex">
            <Link href="#architecture" className="hover:text-[#e8d5b7]">Architecture</Link>
            <Link href="#capabilities" className="hover:text-[#e8d5b7]">Capabilities</Link>
            <Link href="/integrations" className="hover:text-[#e8d5b7]">Integrations</Link>
            <Link href="/security" className="hover:text-[#e8d5b7]">Security</Link>
          </nav>
          <Link href="/workspace" className="rounded-full bg-white px-5 py-2.5 text-[11px] font-bold uppercase tracking-[.12em] text-black transition hover:bg-[#e8d5b7]">Enter workspace</Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-6 pb-28 pt-24 text-center md:px-12 md:pt-32">
          <div className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[.03] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.17em] text-white/65"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Context infrastructure, online</div>
          <p className="gold-label mb-6">The contextual AI operating layer</p>
          <h1 className="font-display mx-auto max-w-5xl text-5xl italic leading-[.94] tracking-tight text-white md:text-7xl lg:text-8xl">Orchestrate intelligence.<br /><span className="text-[#c9b8a0]">Preserve what matters.</span></h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-7 text-white/55 md:text-lg">Capsule AI unifies your AI providers, MCP-connected tools, and project memory into one dependable workspace for real work.</p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/workspace" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-black transition hover:bg-[#e8d5b7]">Open workspace <ArrowRight size={16} /></Link>
            <Link href="/architecture" className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-7 text-sm font-semibold text-white/80 transition hover:border-[#a78b71] hover:text-[#e8d5b7]">Explore architecture</Link>
          </div>
        </section>

        <section id="architecture" className="border-y border-white/10 bg-black/20 px-6 py-24 md:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 max-w-2xl"><p className="gold-label mb-4">System topology</p><h2 className="font-display text-4xl italic md:text-6xl">One composed system,<br />not another chat window.</h2><p className="mt-5 text-white/50">Move your cursor over any architectural node to reveal its responsibility and how it participates in the flow.</p></div>
            <ArchitectureMap />
            <div className="mt-8 flex items-center gap-2 text-xs text-white/40"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Hover or focus a node to inspect it.</div>
          </div>
        </section>

        <section id="capabilities" className="mx-auto max-w-7xl px-6 py-28 md:px-12">
          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="gold-label mb-4">Built for compound work</p><h2 className="font-display text-4xl italic md:text-6xl">Every interaction<br />becomes infrastructure.</h2></div><Link className="text-sm text-[#c9b8a0] hover:text-[#e8d5b7]" href="/integrations">View connected systems →</Link></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">{features.map(({ icon: Icon, title, text }) => <article key={title} className="luxury-card p-6"><div className="mb-7 grid h-12 w-12 place-items-center rounded-xl bg-[#a78b71]/10 text-[#c9b8a0]"><Icon size={22} /></div><h3 className="text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-white/50">{text}</p></article>)}</div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-6 py-10 md:px-12"><div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-white/45 md:flex-row md:items-center md:justify-between"><span className="font-display text-xl italic text-white">Capsule <span className="text-[#c9b8a0]">AI</span></span><div className="flex gap-6"><Link href="/architecture">Architecture</Link><Link href="/security">Security</Link><Link href="/login">Sign in</Link></div><span>© 2026 Capsule AI</span></div></footer>
    </div>
  );
}
