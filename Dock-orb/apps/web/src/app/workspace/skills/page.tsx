"use client";

import { useEffect, useMemo, useState } from "react";
import { Code, Download, Loader2, RefreshCw, Search, Shield, Sparkles, Terminal, Wrench } from "lucide-react";

const API = "http://localhost:3001/api/v1";

type Skill = {
  id: string;
  name: string;
  description: string;
  domain: string;
  installed: boolean;
  tags: string[];
  version: string;
};

const BUILT_IN_SKILLS: Skill[] = [
  { id: "nestjs-expert", name: "NestJS Expert", description: "Backend architecture, modules, guards, pipes and testing patterns for NestJS.", domain: "Software", installed: true, tags: ["backend", "typescript", "api"], version: "1.0.0" },
  { id: "architecture-designer", name: "Architecture Designer", description: "Design system architecture, draw component diagrams and select tech stacks.", domain: "Software", installed: true, tags: ["architecture", "design", "planning"], version: "1.0.0" },
  { id: "planner", name: "Project Planner", description: "Break down complex goals into sprint-level tasks with dependencies.", domain: "Management", installed: true, tags: ["planning", "sprint", "tasks"], version: "1.0.0" },
  { id: "documentation-generator", name: "Documentation Generator", description: "Auto-generate READMEs, API docs, runbooks and changelogs.", domain: "Software", installed: true, tags: ["docs", "readme", "api"], version: "1.0.0" },
  { id: "report-creator", name: "Report Creator", description: "Create structured status reports, technical summaries and stakeholder updates.", domain: "Management", installed: true, tags: ["report", "summary", "business"], version: "1.0.0" },
  { id: "threat-modeler", name: "Threat Modeler", description: "STRIDE-based security analysis, attack surface mapping and mitigation planning.", domain: "Security", installed: false, tags: ["security", "stride", "infosec"], version: "1.0.0" },
  { id: "solidworks-assistant", name: "SolidWorks Assistant", description: "CAD workflow guidance, feature management and parametric design tips.", domain: "Mechanical", installed: false, tags: ["cad", "solidworks", "3d"], version: "1.0.0" },
  { id: "fea-analyst", name: "FEA Analyst", description: "Finite element analysis setup, mesh strategy and result interpretation.", domain: "Mechanical", installed: false, tags: ["simulation", "fea", "ansys"], version: "1.0.0" },
  { id: "circuit-designer", name: "Circuit Designer", description: "Schematic review, component selection and PCB layout best practices.", domain: "Electrical", installed: false, tags: ["pcb", "electronics", "eee"], version: "1.0.0" },
  { id: "embedded-firmware", name: "Embedded Firmware", description: "RTOS patterns, bare-metal drivers and peripheral integration for embedded systems.", domain: "Electrical", installed: false, tags: ["embedded", "rtos", "c"], version: "1.0.0" },
];

const domainIcons: Record<string, any> = {
  Software: Code,
  Security: Shield,
  Mechanical: Wrench,
  Electrical: Terminal,
  Management: Sparkles,
};

const DOMAINS = ["All", "Software", "Mechanical", "Electrical", "Security", "Management"];

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>(BUILT_IN_SKILLS);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [installing, setInstalling] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      skills.filter(
        (s) =>
          (filter === "All" || s.domain === filter) &&
          `${s.name} ${s.tags.join(" ")} ${s.description}`.toLowerCase().includes(query.toLowerCase())
      ),
    [skills, filter, query]
  );

  const install = async (id: string) => {
    setInstalling(id);
    // Simulate install (would call API in full impl)
    await new Promise((r) => setTimeout(r, 800));
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, installed: true } : s)));
    setInstalling(null);
  };

  const uninstall = (id: string) => {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, installed: false } : s)));
  };

  return (
    <div className="h-full overflow-y-auto bg-[#09090b] p-6 text-zinc-100">
      <div className="mb-6 border-b border-zinc-800 pb-5">
        <p className="workspace-label">Skill library</p>
        <h1 className="mt-2 text-lg font-semibold">AI Skills</h1>
        <p className="mt-1 text-xs text-zinc-500">
          Attach domain expertise to the AI pipeline. Skills are executable packages that give the AI specialized knowledge.
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <label className="flex h-9 max-w-md flex-1 items-center gap-2 rounded-md border border-zinc-800 bg-[#0c0c0e] px-3">
          <Search size={15} className="text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills by name, domain, or tag..."
            className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-zinc-600"
          />
        </label>
        <div className="flex flex-wrap gap-1">
          {DOMAINS.map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`h-8 rounded-md px-3 text-xs transition ${
                filter === d ? "bg-indigo-500 text-white" : "border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-[11px] text-zinc-500">
        {skills.filter((s) => s.installed).length} installed · {visible.length} shown
      </p>

      <div className="grid gap-3 pb-8 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((skill) => {
          const Icon = domainIcons[skill.domain] || Code;
          const isInstalling = installing === skill.id;
          return (
            <article key={skill.id} className="workspace-card flex min-h-52 flex-col p-5">
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-indigo-500/10 text-indigo-400">
                  <Icon size={20} />
                </div>
                {skill.installed ? (
                  <button
                    onClick={() => uninstall(skill.id)}
                    className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-red-400"
                  >
                    <Sparkles size={11} /> Installed
                  </button>
                ) : (
                  <button
                    onClick={() => install(skill.id)}
                    disabled={isInstalling}
                    className="inline-flex items-center gap-1 rounded-md border border-indigo-500/40 px-2 py-1 text-[10px] text-indigo-300 hover:bg-indigo-500 hover:text-white disabled:opacity-60"
                  >
                    {isInstalling ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
                    {isInstalling ? "Installing..." : "Install"}
                  </button>
                )}
              </div>
              <h2 className="mt-4 text-sm font-semibold">{skill.name}</h2>
              <p className="mt-1 text-[11px] text-zinc-500">{skill.description}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                {skill.tags.map((tag) => (
                  <span key={tag} className="rounded border border-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">
                    #{tag}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="workspace-card grid h-40 place-items-center text-sm text-zinc-500">
          No skills match your search.
        </div>
      )}
    </div>
  );
}
