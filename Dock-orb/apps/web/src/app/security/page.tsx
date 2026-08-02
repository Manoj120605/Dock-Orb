import Link from "next/link";
import { ArrowLeft, KeyRound, LockKeyhole, ScanSearch } from "lucide-react";

const controls = [
  { icon: KeyRound, title: "Identity boundary", text: "JWT-based access control protects authenticated API and websocket interactions." },
  { icon: LockKeyhole, title: "Service separation", text: "The workspace, orchestration API, database, cache, and vector store operate as clearly separated layers." },
  { icon: ScanSearch, title: "Observable operations", text: "Usage analytics and API cost tracking make the system’s behavior easier to inspect and govern." },
];

export default function SecurityPage() {
  return <main className="min-h-screen px-6 py-10 md:px-12"><div className="mx-auto max-w-6xl"><Link href="/" className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-[#e8d5b7]"><ArrowLeft size={16} /> Back to Capsule AI</Link><header className="py-16 text-center"><p className="gold-label mb-4">Security posture</p><h1 className="font-display text-5xl italic md:text-7xl">Intelligence needs<br />clear boundaries.</h1><p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/55">Capsule keeps the controls surrounding AI workflows as deliberate as the models within them.</p></header><div className="grid gap-6 md:grid-cols-3">{controls.map(({ icon: Icon, title, text }) => <article key={title} className="luxury-card p-7"><Icon className="mb-8 text-[#c9b8a0]" size={26} /><h2 className="font-display text-2xl italic">{title}</h2><p className="mt-4 text-sm leading-7 text-white/50">{text}</p></article>)}</div></div></main>;
}
