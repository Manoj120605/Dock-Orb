"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Bot, FileCode2, Paperclip, Sparkles, User } from "lucide-react";

interface Message { id: string; role: "user" | "assistant"; content: string; }

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([{ id: "1", role: "assistant", content: "I’ve loaded the Capsule Platform context and NestJS Expert skill. What would you like to automate or investigate?" }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);
  const submit = (event: React.FormEvent) => { event.preventDefault(); const content = input.trim(); if (!content) return; setMessages((current) => [...current, { id: Date.now().toString(), role: "user", content }]); setInput(""); setTyping(true); setTimeout(() => { setTyping(false); setMessages((current) => [...current, { id: `${Date.now()}-response`, role: "assistant", content: "I’ll use the active Capsule context, inspect the relevant workflow layer, and propose the smallest reliable next step." }]); }, 900); };
  return <div className="flex h-[calc(100vh-4rem)] flex-col bg-[#09090b] text-zinc-100">
    <div className="flex h-11 shrink-0 items-center gap-5 border-b border-zinc-800 px-6"><button className="h-11 border-b-2 border-indigo-500 px-1 text-xs font-medium text-zinc-100">Conversation</button><button className="h-11 px-1 text-xs text-zinc-500 hover:text-zinc-300">Activity</button><span className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Context synced</span></div>
    <div className="flex-1 overflow-y-auto px-6 py-6"><div className="mx-auto max-w-3xl space-y-6">{messages.map((message) => <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}><div className={`grid h-7 w-7 shrink-0 place-items-center rounded-md ${message.role === "assistant" ? "bg-indigo-500/10 text-indigo-300" : "order-2 bg-zinc-800 text-zinc-300"}`}>{message.role === "assistant" ? <Bot size={15} /> : <User size={14} />}</div><div className={`max-w-[80%] ${message.role === "user" ? "order-1 rounded-lg bg-zinc-800" : "workspace-card"} px-4 py-3 text-[13px] leading-6 text-zinc-300`}>{message.role === "assistant" && <div className="mb-1.5 flex items-center gap-2 text-[10px] font-medium text-zinc-500"><span>Capsule AI</span><span>•</span><span>gpt-4o</span></div>}{message.content}</div></div>)}{typing && <div className="flex gap-3"><div className="grid h-7 w-7 place-items-center rounded-md bg-indigo-500/10 text-indigo-300"><Bot size={15} /></div><div className="workspace-card flex items-center gap-1 px-4 py-3"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-500" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-500 [animation-delay:150ms]" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-500 [animation-delay:300ms]" /></div></div>}<div ref={endRef} /></div></div>
    <div className="border-t border-zinc-800 bg-[#0c0c0e] px-6 py-4"><form onSubmit={submit} className="mx-auto max-w-3xl"><div className="workspace-card flex items-end gap-2 p-2 focus-within:border-zinc-700"><button type="button" aria-label="Attach file" className="grid h-8 w-8 place-items-center rounded-md text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"><Paperclip size={16} /></button><textarea value={input} onChange={(event) => setInput(event.target.value)} rows={1} placeholder="Ask Capsule AI to work with your project context..." className="max-h-28 min-h-8 flex-1 resize-none bg-transparent py-1.5 text-[13px] leading-5 text-zinc-200 outline-none placeholder:text-zinc-600" /><button disabled={!input.trim()} className="grid h-8 w-8 place-items-center rounded-md bg-indigo-500 text-white transition hover:bg-indigo-400 disabled:bg-zinc-800 disabled:text-zinc-600"><ArrowUp size={16} /></button></div><div className="mt-2 flex items-center justify-between px-1 text-[10px] text-zinc-600"><span className="flex items-center gap-1"><FileCode2 size={11} /> Project context active</span><span className="flex items-center gap-1"><Sparkles size={11} /> 2 skills attached</span></div></form></div>
  </div>;
}
