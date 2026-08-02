"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Database, Folder, Loader2, Plus, RefreshCw, Search, User, Zap } from "lucide-react";

const API = "http://localhost:3001/api/v1";
const WORKSPACE_ID = "default-workspace";

type Capsule = {
  id: string;
  name: string;
  type: "PROJECT" | "TASK" | "USER" | "CONVERSATION";
  updatedAt: string;
  status: string;
};

const typeIcons = { PROJECT: Folder, TASK: CheckCircle2, USER: User, CONVERSATION: Database };

export default function CapsulesPage() {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("ALL");
  const [notice, setNotice] = useState("");

  const fetchCapsules = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/capsules?workspaceId=${WORKSPACE_ID}`);
      const data = await res.json();
      if (data.success) {
        setCapsules(data.data || []);
      } else {
        setError("Failed to load capsules.");
      }
    } catch {
      setError("Cannot reach API server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCapsules(); }, []);

  const createCapsule = async () => {
    setCreating(true);
    try {
      const res = await fetch(`${API}/capsules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: WORKSPACE_ID,
          name: `Untitled Capsule ${capsules.length + 1}`,
          type: "PROJECT",
          description: "New capsule",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotice("New Capsule created.");
        fetchCapsules();
      } else {
        setError("Failed to create capsule.");
      }
    } catch {
      setError("Cannot reach API server.");
    } finally {
      setCreating(false);
    }
  };

  const filtered = useMemo(
    () =>
      capsules.filter(
        (c) =>
          (type === "ALL" || c.type === type) &&
          c.name.toLowerCase().includes(query.toLowerCase())
      ),
    [capsules, query, type]
  );

  return (
    <div className="h-full overflow-y-auto bg-[#09090b] p-6 text-zinc-100">
      <div className="mb-6 flex flex-col gap-4 border-b border-zinc-800 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="workspace-label">Memory registry</p>
          <h1 className="mt-2 text-lg font-semibold">Capsules</h1>
          <p className="mt-1 text-xs text-zinc-500">Structured project memory available to your AI workflows.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchCapsules} className="h-9 rounded-md border border-zinc-800 px-3 text-xs text-zinc-400 hover:bg-zinc-900">
            <RefreshCw size={13} />
          </button>
          <button
            onClick={createCapsule}
            disabled={creating}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-indigo-500 px-3 text-xs font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
          >
            {creating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={15} />}
            Create capsule
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</div>
      )}
      {notice && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs text-indigo-300">
          <CheckCircle2 size={14} /> {notice}
        </div>
      )}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <label className="flex h-9 max-w-md flex-1 items-center gap-2 rounded-md border border-zinc-800 bg-[#0c0c0e] px-3">
          <Search size={15} className="text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-zinc-600"
            placeholder="Search capsules..."
          />
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="h-9 rounded-md border border-zinc-800 bg-[#0c0c0e] px-3 text-xs text-zinc-300 outline-none"
        >
          <option value="ALL">All types</option>
          <option value="PROJECT">Project</option>
          <option value="TASK">Task</option>
          <option value="USER">User</option>
          <option value="CONVERSATION">Conversation</option>
        </select>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center gap-2 text-xs text-zinc-500">
          <Loader2 size={16} className="animate-spin" /> Loading capsules from API...
        </div>
      ) : (
        <>
          <p className="mb-3 text-[11px] text-zinc-500">{filtered.length} of {capsules.length} capsules</p>
          <div className="grid gap-3 pb-8 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((capsule) => {
              const Icon = typeIcons[capsule.type] || Database;
              return (
                <button
                  key={capsule.id}
                  onClick={() => setNotice(`${capsule.name} is now the active context.`)}
                  className="workspace-card group min-h-44 p-4 text-left hover:border-indigo-500/50 hover:bg-white/[.04]"
                >
                  <div className="flex items-start justify-between">
                    <div className="grid h-9 w-9 place-items-center rounded-md bg-indigo-500/10 text-indigo-400">
                      <Icon size={18} />
                    </div>
                    {capsule.status === "ACTIVE" && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <Zap size={11} /> Active
                      </span>
                    )}
                  </div>
                  <h2 className="mt-6 text-sm font-semibold group-hover:text-indigo-300">{capsule.name}</h2>
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-zinc-500">{capsule.type} capsule</p>
                  <div className="mt-5 flex justify-between border-t border-zinc-800 pt-3 text-[11px] text-zinc-500">
                    <span>{new Date(capsule.updatedAt).toLocaleDateString()}</span>
                    <span className="text-zinc-600">{capsule.id.slice(0, 8)}</span>
                  </div>
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && !loading && (
            <div className="workspace-card grid h-40 place-items-center text-sm text-zinc-500">
              {capsules.length === 0 ? "No capsules yet. Create one to get started." : "No capsules match your search."}
            </div>
          )}
        </>
      )}
    </div>
  );
}
