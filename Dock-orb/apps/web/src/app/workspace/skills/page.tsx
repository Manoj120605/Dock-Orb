"use client";

import { useMemo, useState } from "react";
import { Code, Download, Search, Shield, Sparkles, Wrench } from "lucide-react";

const initialSkills = [
  { id: "1", name: "NestJS Expert", domain: "Software", installed: true, icon: Code, tags: ["backend", "typescript"] },
  { id: "2", name: "React UI Master", domain: "Software", installed: true, icon: Code, tags: ["frontend", "react"] },
  { id: "3", name: "Threat Modeler", domain: "Security", installed: true, icon: Shield, tags: ["security", "stride"] },
  { id: "4", name: "SolidWorks Assistant", domain: "Mechanical", installed: false, icon: Wrench, tags: ["cad", "3d"] },
  { id: "5", name: "FEA Analyst", domain: "Mechanical", installed: false, icon: Wrench, tags: ["simulation", "ansys"] },
];

export default function SkillsPage() {
  const [skills, setSkills] = useState(initialSkills); const [query, setQuery] = useState(""); const [filter, setFilter] = useState("All");
  const visible = useMemo(() => skills.filter((skill) => (filter === "All" || skill.domain === filter) && `${skill.name} ${skill.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [skills, filter, query]);
  const install = (id: string) => setSkills((current) => current.map((skill) => skill.id === id ? { ...skill, installed: true } : skill));
  return <div className="h-full overflow-y-auto bg-[#09090b] p-6 text-zinc-100"><div className="mb-6 border-b border-zinc-800 pb-5"><p className="workspace-label">Skill library</p><h1 className="mt-2 text-lg font-semibold">Automation skills</h1><p className="mt-1 text-xs text-zinc-500">Attach approved expertise to the AI pipeline.</p></div><div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center"><label className="flex h-9 max-w-md flex-1 items-center gap-2 rounded-md border border-zinc-800 bg-[#0c0c0e] px-3"><Search size={15} className="text-zinc-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search skills..." className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-zinc-600" /></label><div className="flex gap-1 overflow-x-auto">{["All", "Software", "Mechanical", "Security"].map((item) => <button key={item} onClick={() => setFilter(item)} className={`h-8 rounded-md px-3 text-xs transition ${filter === item ? "bg-[#a78b71] text-black" : "border border-zinc-800 text-zinc-400 hover:bg-zinc-900"}`}>{item}</button>)}</div></div><div className="grid gap-3 pb-8 md:grid-cols-2 xl:grid-cols-3">{visible.map((skill) => { const Icon = skill.icon; return <article key={skill.id} className="workspace-card flex min-h-52 flex-col p-5"><div className="flex items-start justify-between"><div className="grid h-10 w-10 place-items-center rounded-md bg-[#a78b71]/10 text-[#c9b8a0]"><Icon size={20} /></div>{skill.installed ? <span className="flex items-center gap-1 text-[10px] text-emerald-400"><Sparkles size={11} /> Installed</span> : <button onClick={() => install(skill.id)} className="inline-flex items-center gap-1 rounded-md border border-[#a78b71]/40 px-2 py-1 text-[10px] text-[#e8d5b7] hover:bg-[#a78b71] hover:text-black"><Download size={11} /> Install</button>}</div><h2 className="mt-6 text-sm font-semibold">{skill.name}</h2><p className="mt-1 text-xs text-zinc-500">Capsule AI · {skill.domain}</p><div className="mt-auto flex flex-wrap gap-1.5 pt-5">{skill.tags.map((tag) => <span key={tag} className="rounded border border-zinc-800 px-1.5 py-1 text-[10px] text-zinc-500">#{tag}</span>)}</div></article>; })}</div>{visible.length === 0 && <div className="workspace-card grid h-40 place-items-center text-sm text-zinc-500">No skills match your current search.</div>}</div>;
}
