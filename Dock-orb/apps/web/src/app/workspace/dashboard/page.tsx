"use client";

import { useEffect, useState } from "react";
import { Activity, ArrowUpRight, ArrowDownRight, Database, Gauge, Layers3, Loader2, MessageSquare, RefreshCw, Zap, CheckCircle2, Clock } from "lucide-react";

const API = "http://localhost:3001/api/v1";
const WORKSPACE_ID = "default-workspace";

export default function DashboardPage() {
  const [capsuleCount, setCapsuleCount] = useState<number | null>(null);
  const [convCount, setConvCount] = useState<number | null>(null);
  const [dockerStatus, setDockerStatus] = useState<{ hasDocker: boolean; isN8nRunning: boolean } | null>(null);
  const [mcpRunning, setMcpRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [capsRes, convRes, dockerRes, mcpRes] = await Promise.allSettled([
        fetch(`${API}/capsules?workspaceId=${WORKSPACE_ID}`).then((r) => r.json()),
        fetch(`${API}/chat/workspaces/${WORKSPACE_ID}/conversations`).then((r) => r.json()),
        fetch(`${API}/workspaces/${WORKSPACE_ID}/automation/docker/status`).then((r) => r.json()),
        fetch(`${API}/workspaces/${WORKSPACE_ID}/automation/config`).then((r) => r.json()),
      ]);

      if (capsRes.status === "fulfilled" && capsRes.value.success) setCapsuleCount(capsRes.value.data?.length ?? 0);
      if (convRes.status === "fulfilled" && convRes.value.success) setConvCount(convRes.value.data?.length ?? 0);
      if (dockerRes.status === "fulfilled") setDockerStatus(dockerRes.value);
      if (mcpRes.status === "fulfilled") setMcpRunning(mcpRes.value.isMcpRunning ?? false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const metrics = [
    {
      label: "Active capsules",
      value: capsuleCount === null ? "—" : String(capsuleCount),
      icon: Database,
      status: capsuleCount !== null ? "live" : "loading",
    },
    {
      label: "Conversations",
      value: convCount === null ? "—" : String(convCount),
      icon: MessageSquare,
      status: convCount !== null ? "live" : "loading",
    },
    {
      label: "Docker engine",
      value: dockerStatus === null ? "—" : dockerStatus.hasDocker ? "Running" : "Offline",
      icon: Zap,
      status: dockerStatus?.hasDocker ? "good" : "bad",
    },
    {
      label: "n8n automation",
      value: dockerStatus === null ? "—" : dockerStatus.isN8nRunning ? "Running" : "Stopped",
      icon: Gauge,
      status: dockerStatus?.isN8nRunning ? "good" : "bad",
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-[#09090b] p-6 text-zinc-100">
      <div className="mb-6 flex flex-col gap-4 border-b border-zinc-800 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="workspace-label">Operations overview</p>
          <h1 className="mt-2 text-lg font-semibold">Dashboard</h1>
          <p className="mt-1 text-xs text-zinc-500">Live status of your AI infrastructure and workspace.</p>
        </div>
        <button
          onClick={fetchData}
          className="flex h-9 items-center gap-2 rounded-md border border-zinc-800 bg-[#0c0c0e] px-3 text-xs text-zinc-400 hover:bg-zinc-900"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Live metrics */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, status }) => (
          <div key={label} className="workspace-card p-4">
            <div className="flex items-center justify-between">
              <span className="workspace-label">{label}</span>
              <Icon size={15} className="text-zinc-600" />
            </div>
            <div className="mt-4 flex items-end justify-between">
              {loading ? (
                <Loader2 size={18} className="animate-spin text-zinc-600" />
              ) : (
                <span className="text-2xl font-semibold tracking-tight">{value}</span>
              )}
              <span className={`flex items-center gap-1 text-[10px] ${
                status === "live" || status === "good"
                  ? "text-emerald-400"
                  : status === "bad"
                  ? "text-red-400"
                  : "text-zinc-500"
              }`}>
                {status === "live" || status === "good" ? <ArrowUpRight size={12} /> : status === "bad" ? <ArrowDownRight size={12} /> : null}
                {status === "live" || status === "good" ? "Live" : status === "bad" ? "Offline" : ""}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* System status */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_288px]">
        <section className="workspace-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <div>
              <p className="text-xs font-semibold">Infrastructure status</p>
              <p className="mt-0.5 text-[11px] text-zinc-500">Real-time overview of all connected services</p>
            </div>
            <span className={`flex items-center gap-1.5 text-[10px] ${!loading ? "text-emerald-400" : "text-zinc-500"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${!loading ? "bg-emerald-500" : "bg-zinc-500 animate-pulse"}`} />
              {loading ? "Syncing..." : "Live"}
            </span>
          </div>
          <div className="divide-y divide-zinc-800/60">
            {[
              { label: "API Server (NestJS)", ok: true, detail: "localhost:3001" },
              { label: "Docker Engine", ok: dockerStatus?.hasDocker ?? false, detail: dockerStatus?.hasDocker ? "Detected" : "Not found" },
              { label: "n8n Automation", ok: dockerStatus?.isN8nRunning ?? false, detail: dockerStatus?.isN8nRunning ? "Running on port 5678" : "Stopped" },
              { label: "GitHub MCP Server", ok: mcpRunning, detail: mcpRunning ? "Connected via stdio" : "Not configured – add PAT in Automations" },
            ].map(({ label, ok, detail }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3 text-xs">
                <div className="flex items-center gap-2">
                  {loading
                    ? <Loader2 size={13} className="animate-spin text-zinc-600" />
                    : ok
                    ? <CheckCircle2 size={13} className="text-emerald-400" />
                    : <Clock size={13} className="text-zinc-500" />
                  }
                  <span className="text-zinc-300">{label}</span>
                </div>
                <span className={`text-[11px] ${ok ? "text-emerald-400" : "text-zinc-500"}`}>{detail}</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="workspace-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold">Quick actions</p>
          </div>
          <div className="mt-4 space-y-2">
            <a
              href="/workspace/automations"
              className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-zinc-800 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            >
              <Zap size={13} /> Configure AI & MCP
            </a>
            <a
              href="/workspace/chat"
              className="flex h-9 w-full items-center justify-center gap-2 rounded-md bg-indigo-500 text-xs font-semibold text-white hover:bg-indigo-400"
            >
              <MessageSquare size={13} /> Start a conversation
            </a>
            {dockerStatus?.isN8nRunning && (
              <a
                href="http://localhost:5678"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-zinc-800 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              >
                <Layers3 size={13} /> Open n8n UI
              </a>
            )}
          </div>
          {capsuleCount !== null && (
            <div className="mt-4 border-t border-zinc-800 pt-4">
              <p className="text-[11px] text-zinc-500">Workspace contains</p>
              <p className="mt-1 text-xs font-medium text-zinc-300">
                {capsuleCount} capsule{capsuleCount !== 1 ? "s" : ""} · {convCount ?? 0} conversation{convCount !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
