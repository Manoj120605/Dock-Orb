"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, ChevronRight, Command, Search, Share2 } from "lucide-react";

export function ChatHeader() {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const results = [
    { label: "Capsule Platform", detail: "Project capsule", href: "/workspace/capsules" },
    { label: "NestJS Expert", detail: "Installed skill", href: "/workspace/skills" },
    { label: "Automation dashboard", detail: "Usage and activity", href: "/workspace/dashboard" },
  ].filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));
  return <header className="z-10 h-16 shrink-0 border-b border-[#1f1f23] bg-[#09090b] px-6">
    <div className="flex h-full items-center justify-between gap-5">
      <div className="flex min-w-0 items-center gap-2 text-xs"><span className="text-zinc-500">Workspace</span><ChevronRight size={14} className="text-zinc-700" /><span className="truncate font-medium text-zinc-200">Automation Console</span><span className="ml-2 rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-400">v2.4.0</span></div>
      <div className="relative hidden max-w-sm flex-1 md:block"><label className="flex h-9 items-center gap-2 rounded-md border border-zinc-800 bg-[#0c0c0e] px-3 text-zinc-500 focus-within:border-zinc-700"><Search size={15} /><input value={query} onFocus={() => setSearchOpen(true)} onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }} onKeyDown={(event) => { if (event.key === "Escape") setSearchOpen(false); }} className="min-w-0 flex-1 bg-transparent text-xs text-zinc-200 outline-none placeholder:text-zinc-600" placeholder="Search workspace..." /><kbd className="flex items-center gap-0.5 text-[10px] text-zinc-600"><Command size={10} />K</kbd></label>{searchOpen && <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-md border border-zinc-800 bg-[#0c0c0e] p-1 shadow-2xl">{results.length ? results.map((item) => <Link onClick={() => setSearchOpen(false)} href={item.href} key={item.label} className="block rounded px-3 py-2 hover:bg-zinc-900"><span className="block text-xs text-zinc-200">{item.label}</span><span className="text-[10px] text-zinc-500">{item.detail}</span></Link>) : <p className="px-3 py-3 text-xs text-zinc-500">No workspace resources found.</p>}</div>}</div>
      <div className="flex items-center gap-1"><button aria-label="Share workspace" className="grid h-8 w-8 place-items-center rounded-md text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"><Share2 size={16} /></button><button aria-label="Notifications" className="grid h-8 w-8 place-items-center rounded-md text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"><Bell size={16} /></button><Link href="/workspace/settings" aria-label="Open settings" className="ml-2 rounded-md border border-zinc-800 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 hover:bg-zinc-900">Settings</Link></div>
    </div>
  </header>;
}
