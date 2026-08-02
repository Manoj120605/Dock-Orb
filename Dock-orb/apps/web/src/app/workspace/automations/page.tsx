"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle, Box, CheckCircle2, FolderOpen, Github, KeyRound,
  Loader2, Play, RefreshCcw, ServerCog, Sparkles, Workflow, XCircle,
} from "lucide-react";

const API = "http://localhost:3001/api/v1";
const WORKSPACE_ID = "default-workspace";

export default function AutomationsPage() {
  const [aiApiKey, setAiApiKey] = useState("");
  const [aiBaseUrl, setAiBaseUrl] = useState("");
  const [providerHint, setProviderHint] = useState("");
  const [contextMode, setContextMode] = useState<"local" | "github">("local");
  const [localProjectPath, setLocalProjectPath] = useState("");
  const [githubPat, setGithubPat] = useState("");
  const [repoLink, setRepoLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusOk, setStatusOk] = useState(true);
  const [workflowPrompt, setWorkflowPrompt] = useState("");
  const [creating, setCreating] = useState(false);
  const [browsing, setBrowsing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [dockerStatus, setDockerStatus] = useState({ hasDocker: false, isN8nRunning: false, loading: true });

  useEffect(() => {
    checkDockerStatus();
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API}/workspaces/${WORKSPACE_ID}/automation/config`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.aiApiKey) setAiApiKey(""); // don't pre-fill masked key
      if (data.aiBaseUrl) setAiBaseUrl(data.aiBaseUrl);
      if (data.githubPat) { setContextMode("github"); }
      if (data.repoLink) setRepoLink(data.repoLink);
      if (data.localProjectPath) { setLocalProjectPath(data.localProjectPath); }
    } catch { /* silent */ }
  };

  const checkDockerStatus = async () => {
    setDockerStatus((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${API}/workspaces/${WORKSPACE_ID}/automation/docker/status`);
      const data = await res.json();
      setDockerStatus({ hasDocker: data.hasDocker, isN8nRunning: data.isN8nRunning, loading: false });
    } catch {
      setDockerStatus({ hasDocker: false, isN8nRunning: false, loading: false });
    }
  };

  const saveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiApiKey.trim()) {
      setStatusOk(false);
      setStatusMessage("Please enter your AI API key.");
      return;
    }
    setSaving(true);
    setStatusMessage("");
    setTestResult(null);
    try {
      const body: any = { aiApiKey, aiBaseUrl, providerHint };
      if (contextMode === "github" && githubPat) {
        body.githubPat = githubPat;
        body.repoLink = repoLink;
      }
      if (localProjectPath) body.localProjectPath = localProjectPath;

      const res = await fetch(`${API}/workspaces/${WORKSPACE_ID}/automation/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setStatusOk(!!data.success);
      setStatusMessage(data.message || "Saved successfully");
    } catch {
      setStatusOk(false);
      setStatusMessage("Failed to reach API server. Make sure the backend is running.");
    } finally {
      setSaving(false);
    }
  };

  const browseFolder = async () => {
    setBrowsing(true);
    try {
      const res = await fetch(`${API}/workspaces/${WORKSPACE_ID}/automation/browse-folder`);
      const data = await res.json();
      if (data.path) setLocalProjectPath(data.path);
    } catch { /* silent */ }
    finally { setBrowsing(false); }
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${API}/workspaces/${WORKSPACE_ID}/automation/test-connection`);
      const data = await res.json();
      setTestResult({ ok: data.success, msg: data.message + (data.aiBaseUrl ? ` · ${data.aiBaseUrl}` : "") });
    } catch {
      setTestResult({ ok: false, msg: "Cannot reach API server" });
    } finally { setTesting(false); }
  };

  const toggleN8n = async () => {
    setDockerStatus((prev) => ({ ...prev, loading: true }));
    const endpoint = dockerStatus.isN8nRunning ? "stop-n8n" : "start-n8n";
    try {
      await fetch(`${API}/workspaces/${WORKSPACE_ID}/automation/docker/${endpoint}`, { method: "POST" });
      setTimeout(checkDockerStatus, 1500);
    } catch {
      setDockerStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#09090b] p-6 text-zinc-100">
      <div className="mb-6 border-b border-zinc-800 pb-5">
        <p className="workspace-label">System Integrations</p>
        <h1 className="mt-2 text-lg font-semibold">Automations & Context</h1>
        <p className="mt-1 text-xs text-zinc-500">
          Configure your AI provider and project context. GitHub and local files are both optional.
        </p>
      </div>

      {/* Quick workflow creator */}
      <div className="mb-6 flex max-w-5xl items-center gap-3 rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-2">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-indigo-500 text-white">
          <Sparkles size={18} />
        </div>
        <input
          type="text"
          value={workflowPrompt}
          onChange={(e) => setWorkflowPrompt(e.target.value)}
          placeholder="Describe an automation (e.g. 'When PR merged, notify Slack and run n8n build')..."
          className="h-10 flex-1 bg-transparent px-2 text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
        />
        <button
          onClick={() => { setCreating(true); setTimeout(() => { setCreating(false); setWorkflowPrompt(""); }, 1500); }}
          disabled={!workflowPrompt.trim() || creating}
          className="h-10 rounded-md bg-indigo-500 px-5 text-xs font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
        >
          {creating ? "Generating..." : "Create Workflow"}
        </button>
      </div>

      <div className="grid max-w-5xl gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">

          {/* ── AI Provider ── */}
          <section className="workspace-card p-5">
            <div className="mb-4 flex items-center gap-2 border-b border-zinc-800 pb-3">
              <KeyRound size={16} className="text-indigo-400" />
              <h2 className="text-sm font-semibold">AI Provider</h2>
              <span className="ml-auto text-[10px] text-zinc-500">Required</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">API Key</label>
                <input
                  type="password"
                  value={aiApiKey}
                  onChange={(e) => setAiApiKey(e.target.value)}
                  placeholder="Gemini (AQ./AIza...), OpenAI (sk-...), Groq (gsk_...), NVIDIA (nvapi-...) etc."
                  className="h-9 w-full rounded-md border border-zinc-800 bg-[#0a0a0a] px-3 text-xs text-zinc-200 outline-none focus:border-indigo-500/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Provider</label>
                <select
                  value={providerHint}
                  onChange={(e) => setProviderHint(e.target.value)}
                  className="h-9 w-full rounded-md border border-zinc-800 bg-[#0a0a0a] px-3 text-xs text-zinc-200 outline-none focus:border-indigo-500/50"
                >
                  <option value="">Auto-detect from key prefix</option>
                  <option value="gemini">Google Gemini (AI Studio)</option>
                  <option value="openai">OpenAI</option>
                  <option value="groq">Groq</option>
                  <option value="nvidia">NVIDIA NIM</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="anthropic">Anthropic Claude</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="ollama">Ollama (local)</option>
                </select>
                <p className="mt-1.5 text-[11px] text-zinc-600">
                  Select <strong className="text-zinc-500">Google Gemini</strong> if your key starts with AQ. or AIza.
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Base URL <span className="text-zinc-600">(optional — for NVIDIA NIM, LM Studio, Ollama, etc.)</span>
                </label>
                <input
                  type="text"
                  value={aiBaseUrl}
                  onChange={(e) => setAiBaseUrl(e.target.value)}
                  placeholder="https://integrate.api.nvidia.com/v1"
                  className="h-9 w-full rounded-md border border-zinc-800 bg-[#0a0a0a] px-3 text-xs text-zinc-200 outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>
          </section>

          {/* ── Project Context ── */}
          <section className="workspace-card p-5">
            <div className="mb-4 flex items-center gap-2 border-b border-zinc-800 pb-3">
              <ServerCog size={16} className="text-indigo-400" />
              <h2 className="text-sm font-semibold">Project Context</h2>
              <span className="ml-auto text-[10px] text-zinc-500">Optional</span>
            </div>

            <div className="mb-5 flex gap-1 rounded-md border border-zinc-800 bg-zinc-900/50 p-1">
              <button
                onClick={() => setContextMode("local")}
                className={`flex flex-1 items-center justify-center gap-2 rounded py-2 text-xs font-medium transition ${contextMode === "local" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                <FolderOpen size={14} /> Local Files
              </button>
              <button
                onClick={() => setContextMode("github")}
                className={`flex flex-1 items-center justify-center gap-2 rounded py-2 text-xs font-medium transition ${contextMode === "github" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                <Github size={14} /> GitHub (MCP)
              </button>
            </div>

            {contextMode === "local" ? (
              <div className="space-y-4">
                <div className="rounded-md border border-indigo-500/20 bg-indigo-500/5 p-3 text-xs text-zinc-400">
                  The AI will read files from your chosen folder as project context. No GitHub account needed.
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Project Directory</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={localProjectPath}
                      onChange={(e) => setLocalProjectPath(e.target.value)}
                      placeholder="Click Browse or paste path manually..."
                      className="h-9 flex-1 rounded-md border border-zinc-800 bg-[#0a0a0a] px-3 font-mono text-xs text-zinc-200 outline-none focus:border-indigo-500/50"
                    />
                    <button
                      type="button"
                      onClick={browseFolder}
                      disabled={browsing}
                      className="flex h-9 items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-xs text-zinc-300 hover:bg-zinc-700 disabled:opacity-60"
                    >
                      {browsing ? <Loader2 size={13} className="animate-spin" /> : <FolderOpen size={13} />}
                      Browse
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-zinc-600">
                    Clicking Browse opens a native folder picker on your system.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md border border-zinc-700/30 bg-zinc-900/30 p-3 text-xs text-zinc-400">
                  Connect a GitHub repository. The AI can read code, create issues, and open PRs on your behalf.
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">GitHub Personal Access Token</label>
                  <input
                    type="password"
                    value={githubPat}
                    onChange={(e) => setGithubPat(e.target.value)}
                    placeholder="ghp_..."
                    className="h-9 w-full rounded-md border border-zinc-800 bg-[#0a0a0a] px-3 text-xs text-zinc-200 outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Repository URL</label>
                  <input
                    type="text"
                    value={repoLink}
                    onChange={(e) => setRepoLink(e.target.value)}
                    placeholder="https://github.com/username/repo"
                    className="h-9 w-full rounded-md border border-zinc-800 bg-[#0a0a0a] px-3 text-xs text-zinc-200 outline-none focus:border-indigo-500/50"
                  />
                </div>
                {githubPat && (
                  <p className="text-[11px] text-emerald-400">✓ MCP server will start automatically after saving</p>
                )}
              </div>
            )}

            <div className="mt-5 flex items-center justify-between border-t border-zinc-800 pt-4">
              <div className="flex items-center gap-2">
                {statusMessage && (
                  <span className={`text-xs ${statusOk ? "text-emerald-400" : "text-red-400"}`}>
                    {statusMessage}
                  </span>
                )}
                {testResult && (
                  <span className={`flex items-center gap-1 text-xs ${testResult.ok ? "text-emerald-400" : "text-red-400"}`}>
                    {testResult.ok ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {testResult.msg}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={testConnection}
                  disabled={testing}
                  className="flex h-9 items-center gap-2 rounded-md border border-zinc-700 px-3 text-xs text-zinc-400 hover:bg-zinc-900 disabled:opacity-50"
                >
                  {testing ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                  Test
                </button>
                <button
                  onClick={saveConfig}
                  disabled={saving || !aiApiKey}
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-indigo-500 px-4 text-xs font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
                  Save & Connect
                </button>
              </div>
            </div>
          </section>

          {/* ── Preset workflows ── */}
          <section className="workspace-card p-5">
            <div className="mb-4 flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Workflow size={16} className="text-indigo-400" />
              <h2 className="text-sm font-semibold">Preset Workflows</h2>
            </div>
            <div className="space-y-2">
              {[
                { name: "Code Review & PR Generation", desc: "AI reads your project, reviews changes, and opens a PR." },
                { name: "Daily Standup Report", desc: "Summarise recent file changes and open issues." },
                { name: "Security Vulnerability Scan", desc: "Runs Threat Modeler skill across your codebase." },
                { name: "Auto-generate Documentation", desc: "Generates README and API docs from your project files." },
              ].map((flow) => (
                <div key={flow.name} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 p-3">
                  <div>
                    <h3 className="text-xs font-medium text-zinc-200">{flow.name}</h3>
                    <p className="mt-0.5 text-[10px] text-zinc-500">{flow.desc}</p>
                  </div>
                  <button className="flex h-7 items-center gap-1.5 rounded bg-zinc-800 px-2.5 text-[10px] font-medium text-zinc-300 transition hover:bg-indigo-500 hover:text-white">
                    <Play size={10} /> Run
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Sidebar ── */}
        <aside className="space-y-5">
          <div className="workspace-card p-5">
            <div className="mb-4 flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Box size={16} className="text-indigo-400" />
              <h2 className="text-sm font-semibold">n8n Automation</h2>
              <span className="ml-auto text-[10px] text-zinc-500">Optional</span>
            </div>
            {dockerStatus.loading ? (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Loader2 size={12} className="animate-spin" /> Checking Docker...
              </div>
            ) : !dockerStatus.hasDocker ? (
              <div className="space-y-3">
                <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-400">
                  <div className="mb-1 flex items-center gap-2 font-semibold">
                    <AlertCircle size={13} /> Docker not detected
                  </div>
                  n8n workflows require Docker Desktop.
                </div>
                <a
                  href="https://www.docker.com/products/docker-desktop/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-full items-center justify-center gap-2 rounded border border-zinc-800 text-xs text-zinc-400 hover:bg-zinc-900"
                >
                  Download Docker Desktop ↗
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle2 size={13} /> Docker running
                </div>
                <div className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/50 p-3">
                  <div>
                    <p className="text-[11px] font-medium text-zinc-300">n8n Container</p>
                    <p className="mt-0.5 text-[10px] text-zinc-500">
                      {dockerStatus.isN8nRunning ? "Running · port 5678" : "Stopped"}
                    </p>
                  </div>
                  <button
                    onClick={toggleN8n}
                    className={`h-6 rounded px-2.5 text-[10px] font-medium transition ${dockerStatus.isN8nRunning ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"}`}
                  >
                    {dockerStatus.isN8nRunning ? "Stop" : "Start"}
                  </button>
                </div>
                {dockerStatus.isN8nRunning && (
                  <a href="http://localhost:5678" target="_blank" rel="noopener noreferrer"
                    className="flex h-8 w-full items-center justify-center gap-2 rounded border border-zinc-800 text-xs text-zinc-400 hover:bg-zinc-900">
                    Open n8n Editor ↗
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="workspace-card p-4">
            <p className="mb-3 text-xs font-semibold text-zinc-300">Active integrations</p>
            <div className="space-y-2 text-[11px]">
              {[
                { label: "AI Provider", value: aiApiKey ? "Configured" : "Not set", ok: !!aiApiKey },
                { label: "Local project", value: localProjectPath || "None", ok: !!localProjectPath },
                { label: "GitHub MCP", value: githubPat ? "Configured" : "Optional", ok: !!githubPat },
                { label: "n8n", value: dockerStatus.isN8nRunning ? "Running" : "Optional", ok: dockerStatus.isN8nRunning },
              ].map(({ label, value, ok }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-zinc-500">{label}</span>
                  <span className={ok ? "text-emerald-400" : "text-zinc-600"}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
