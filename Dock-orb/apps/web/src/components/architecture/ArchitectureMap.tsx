"use client";

import { BrainCircuit, Database, GitBranch, Network, ServerCog, Workflow } from "lucide-react";

const layers = [
  { name: "Workspace", detail: "Next.js App Router interface for chat, Capsules, skills, and analytics.", icon: Network, className: "md:col-span-2" },
  { name: "API Gateway", detail: "NestJS orchestration layer for authentication, conversations, websocket streaming, and policy enforcement.", icon: ServerCog, className: "" },
  { name: "AI Pipeline", detail: "Routes each request through context optimization, skills, model selection, and streaming responses.", icon: Workflow, className: "" },
  { name: "Capsule Memory", detail: "Persistent, structured project memory with versioned context, retrieval, and snapshots.", icon: BrainCircuit, className: "" },
  { name: "Data Cluster", detail: "PostgreSQL stores workspace records, Redis accelerates sessions, and Qdrant powers semantic retrieval.", icon: Database, className: "" },
  { name: "Provider Mesh", detail: "LiteLLM connects OpenAI, Anthropic, Gemini, local models, and other providers behind one contract.", icon: GitBranch, className: "md:col-span-2" },
];

export function ArchitectureMap() {
  return (
    <div className="relative mx-auto max-w-5xl">
      <svg className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" viewBox="0 0 900 410" preserveAspectRatio="none" aria-hidden="true">
        <path className="neural-line opacity-45" d="M225 72 C330 72 330 170 450 170 S570 72 675 72" fill="none" strokeWidth="1.5" />
        <path className="neural-line opacity-35" d="M450 170 C450 240 300 245 225 335 M450 170 C450 240 600 245 675 335" fill="none" strokeWidth="1.5" />
      </svg>
      <div className="relative grid gap-5 md:grid-cols-3">
        {layers.map((layer) => {
          const Icon = layer.icon;
          return (
            <div key={layer.name} tabIndex={0} className={`group luxury-card relative min-h-40 p-6 outline-none focus-visible:ring-2 focus-visible:ring-[#c9b8a0] ${layer.className}`}>
              <div className="mb-5 flex items-center justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#a78b71]/10 text-[#c9b8a0] transition group-hover:scale-110"><Icon size={21} /></div>
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,.8)]" />
              </div>
              <h3 className="font-display text-xl italic text-white">{layer.name}</h3>
              <p className="mt-2 text-sm leading-6 text-white/45">Hover to inspect this node</p>
              <div className="pointer-events-none absolute inset-x-5 bottom-5 translate-y-2 border-t border-[#a78b71]/30 pt-3 text-sm leading-6 text-[#e8d5b7] opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100">
                {layer.detail}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
