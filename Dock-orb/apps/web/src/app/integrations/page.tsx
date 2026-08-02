import Link from "next/link";
import { ArrowLeft, Braces, CloudCog, Database, PlugZap } from "lucide-react";

const integrations = [
  { icon: CloudCog, title: "Model providers", text: "Route requests through LiteLLM to OpenAI, Anthropic, Gemini, local runtimes, and compatible endpoints." },
  { icon: PlugZap, title: "MCP servers", text: "Connect tools and trusted external context through a composable Model Context Protocol boundary." },
  { icon: Braces, title: "Workflow automation", text: "Use n8n and API events to connect AI output to the systems where work actually happens." },
  { icon: Database, title: "Knowledge sources", text: "Ground work in PostgreSQL records, Qdrant semantic retrieval, and versioned Capsules." },
];

export default function IntegrationsPage() {
  return <main className="min-h-screen px-6 py-10 md:px-12"><div className="mx-auto max-w-7xl"><Link href="/" className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-[#e8d5b7]"><ArrowLeft size={16} /> Back to Capsule AI</Link><header className="py-16"><p className="gold-label mb-4">Connection layer</p><h1 className="font-display text-5xl italic md:text-7xl">One context.<br />Many capabilities.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-white/55">Capsule is designed to make provider, tool, and workflow boundaries feel like one continuous operating environment.</p></header><div className="grid gap-6 md:grid-cols-2">{integrations.map(({ icon: Icon, title, text }) => <article key={title} className="luxury-card min-h-64 p-8"><div className="mb-10 grid h-12 w-12 place-items-center rounded-xl bg-[#a78b71]/10 text-[#c9b8a0]"><Icon size={23} /></div><h2 className="font-display text-3xl italic">{title}</h2><p className="mt-4 max-w-md leading-7 text-white/50">{text}</p></article>)}</div></div></main>;
}
