"use client";

import { useEffect, useState } from "react";
import { Check, CheckCircle2, KeyRound, SlidersHorizontal, XCircle } from "lucide-react";

const API = "http://localhost:3001/api/v1";
const WORKSPACE_ID = "default-workspace";

export default function SettingsPage() {
  const [streaming, setStreaming] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  const [saved, setSaved] = useState(false);
  const [apiStatus, setApiStatus] = useState<"checking" | "ok" | "error">("checking");
  const [dockerStatus, setDockerStatus] = useState<"checking" | "running" | "stopped">("checking");
  const [mcpStatus, setMcpStatus] = useState<"checking" | "connected" | "disconnected">("checking");

  useEffect(() => {
    // Check API health
    fetch(`${API}/health`).then(() => setApiStatus("ok")).catch(() => setApiStatus("error"));

    // Check Docker & MCP
    fetch(`${API}/workspaces/${WORKSPACE_ID}/automation/docker/status`)
      .then((r) => r.json())
      .then((d) => {
        setDockerStatus(d?.running ? "running" : "stopped");
        setMcpStatus(d?.mcpRunning ? "connected" : "disconnected");
      })
      .catch(() => {
        setDockerStatus("stopped");
        setMcpStatus("disconnected");
      });
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Toggle = ({ value, update, label, description }: { value: boolean; update: (v: boolean) => void; label: string; description: string }) => (
    <button onClick={() => update(!value)} className="flex w-full items-center justify-between py-4 text-left">
      <div>
        <p className="text-xs font-medium text-zinc-200">{label}</p>
        <p className="mt-0.5 text-[11px] text-zinc-500">{description}</p>
      </div>
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition ${value ? "bg-indigo-500" : "bg-zinc-800"}`}>
        <span className={`absolute top-1 h-3 w-3 rounded-full bg-white transition-all ${value ? "left-5" : "left-1"}`} />
      </span>
    </button>
  );

  const statusDot = (state: string, goodVal: string) => (
    <span className={`flex items-center gap-1.5 text-[11px] ${state === goodVal ? "text-emerald-400" : state === "checking" ? "text-zinc-500" : "text-red-400"}`}>
      {state === goodVal ? <CheckCircle2 size={12} /> : state === "checking" ? <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-500" /> : <XCircle size={12} />}
      {state === "checking" ? "Checking..." : state === goodVal ? state.charAt(0).toUpperCase() + state.slice(1) : state.charAt(0).toUpperCase() + state.slice(1)}
    </span>
  );

  return (
    <div className="h-full overflow-y-auto bg-[#09090b] p-6 text-zinc-100">
      <div className="mb-6 border-b border-zinc-800 pb-5">
        <p className="workspace-label">Workspace controls</p>
        <h1 className="mt-2 text-lg font-semibold">Settings</h1>
        <p className="mt-1 text-xs text-zinc-500">Configure how Dock-Orb operates across this workspace.</p>
      </div>

      <div className="grid max-w-4xl gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <section className="workspace-card">
            <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
              <SlidersHorizontal size={15} className="text-indigo-400" />
              <h2 className="text-xs font-semibold">Workflow behavior</h2>
            </div>
            <div className="divide-y divide-zinc-800 px-4">
              <Toggle
                value={streaming}
                update={setStreaming}
                label="Stream AI responses"
                description="Receive model output token-by-token in real time"
              />
              <Toggle
                value={saveHistory}
                update={setSaveHistory}
                label="Save conversation history"
                description="Persist messages to Capsule memory for context recall"
              />
            </div>
          </section>

          <div className="rounded-md border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs text-indigo-300">
            <p className="font-semibold">Universal AI provider</p>
            <p className="mt-1 text-zinc-400">Dock-Orb works with any OpenAI-compatible API. Set your provider key and base URL in the <span className="font-medium text-indigo-300">Automations</span> tab.</p>
          </div>

          <button
            onClick={handleSave}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-indigo-500 px-4 text-xs font-semibold text-white hover:bg-indigo-400"
          >
            {saved ? <><Check size={14} /> Saved</> : "Save preferences"}
          </button>
        </div>

        <aside className="workspace-card h-fit divide-y divide-zinc-800 p-4">
          <div className="flex items-center gap-2 pb-4">
            <KeyRound size={15} className="text-indigo-400" />
            <h2 className="text-xs font-semibold">System status</h2>
          </div>
          <div className="space-y-3 pt-4 text-[11px]">
            <div className="flex items-center justify-between text-zinc-500">
              <span>API server</span>
              {statusDot(apiStatus, "ok")}
            </div>
            <div className="flex items-center justify-between text-zinc-500">
              <span>Docker engine</span>
              {statusDot(dockerStatus, "running")}
            </div>
            <div className="flex items-center justify-between text-zinc-500">
              <span>GitHub MCP server</span>
              {statusDot(mcpStatus, "connected")}
            </div>
            <div className="flex items-center justify-between text-zinc-500">
              <span>Endpoint</span>
              <span className="font-mono text-zinc-300">localhost:3001</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
