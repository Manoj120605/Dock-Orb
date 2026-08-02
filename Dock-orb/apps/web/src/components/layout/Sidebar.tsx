"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bot, Database, Layers3, MessageSquare, Plus, Settings, Sparkles } from "lucide-react";

const navItems = [
  { name: "Chat", path: "/workspace/chat", icon: MessageSquare },
  { name: "Capsules", path: "/workspace/capsules", icon: Database },
  { name: "Skills", path: "/workspace/skills", icon: Sparkles },
  { name: "Dashboard", path: "/workspace/dashboard", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  return <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-[#1f1f23] bg-[#0c0c0e]">
    <div className="flex h-16 items-center gap-3 border-b border-[#1f1f23] px-4">
      <div className="grid h-7 w-7 place-items-center rounded-md bg-[#27272a] text-zinc-200"><Layers3 size={15} /></div>
      <div><div className="text-[13px] font-semibold text-zinc-100">Capsule AI</div><div className="text-[10px] text-zinc-500">AUTOMATION WORKSPACE</div></div>
    </div>
    <div className="p-3">
      <Link href="/workspace/chat" className="flex h-9 items-center justify-center gap-2 rounded-md bg-[#6366f1] text-xs font-semibold text-white transition hover:bg-[#5558dc]"><Plus size={15} /> New workflow</Link>
    </div>
    <nav className="space-y-1 px-3">
      <p className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[.13em] text-zinc-600">Workspace</p>
      {navItems.map(({ name, path, icon: Icon }) => {
        const active = pathname.startsWith(path);
        return <Link key={path} href={path} className={`flex h-9 items-center gap-3 rounded-md border px-2.5 text-xs font-medium transition ${active ? "border-zinc-800 bg-zinc-900 text-zinc-100" : "border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"}`}><Icon size={16} className={active ? "text-indigo-400" : "text-zinc-500"} />{name}</Link>;
      })}
    </nav>
    <div className="mt-6 border-t border-[#1f1f23] px-3 pt-5">
      <p className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[.13em] text-zinc-600">Recent</p>
      {["API gateway review", "Frontend refactor", "Qdrant collection plan"].map((item, index) => <button key={item} className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs ${index === 0 ? "text-zinc-300" : "text-zinc-500"} hover:bg-zinc-900 hover:text-zinc-200`}><Bot size={14} /> <span className="truncate">{item}</span></button>)}
    </div>
    <div className="mt-auto border-t border-[#1f1f23] p-3">
      <Link href="/workspace/settings" className="flex items-center gap-3 rounded-md p-2 hover:bg-zinc-900"><div className="grid h-7 w-7 place-items-center rounded-md bg-zinc-800 text-[11px] font-semibold">G</div><div className="min-w-0 flex-1"><div className="truncate text-xs font-medium text-zinc-200">gsgmk</div><div className="mt-0.5 flex items-center gap-1 text-[10px] text-zinc-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> System operational</div></div><Settings size={15} className="text-zinc-500" /></Link>
    </div>
  </aside>;
}
