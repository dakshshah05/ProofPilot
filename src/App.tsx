import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  ShieldCheck,
  Network,
  FileText,
  Layers,
  ScanLine,
  Plus,
  LayoutDashboard,
  History,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  Check,
  ExternalLink,
  X,
  Clock,
  BookOpen,
} from "lucide-react";
import { Sheet } from "./ui";
import Landing, { Logo } from "./Landing";
import Results from "./Results";
import { Button } from "./Button";
import {
  demo,
  examples,
  readHistory,
  validReport,
  safeUrl,
  type Investigation,
  type Evidence,
} from "./data";
const stages = [
  "Understanding",
  "Decomposing",
  "Searching",
  "Retrieving",
  "Analyzing",
  "Verifying",
  "Generating Passport",
];
function Pulse({
  stage,
  completed,
  message,
  onCancel,
}: {
  stage: string;
  completed: string[];
  message: string;
  onCancel: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const t = setInterval(
      () => setElapsed(Math.floor((Date.now() - start) / 1000)),
      1000,
    );
    return () => clearInterval(t);
  }, []);
  return (
    <div className="pulse-panel panel">
      <div className="pulse-orb">
        <Network size={36} />
      </div>
      <div className="eyebrow">INVESTIGATION PULSE</div>
      <h2>{stage}</h2>
      <p role="status">{message}</p>
      <span className="mono">
        {elapsed}s elapsed · Waiting for verified updates
      </span>
      <ol className="stage-list">
        {stages.map((s) => (
          <li
            key={s}
            className={
              completed.includes(s) ? "done" : s === stage ? "current" : ""
            }
          >
            {completed.includes(s) ? (
              <Check size={15} />
            ) : (
              <span className="stage-dot" />
            )}
            {s}
          </li>
        ))}
      </ol>
      <button className="button secondary" onClick={onCancel}>
        Stop waiting
      </button>
    </div>
  );
}
export default function App() {
  const [page, setPage] = useState("landing");
  const [collapsed, setCollapsed] = useState(false);
  const [history, setHistory] = useState(readHistory);
  const [report, setReport] = useState<Investigation | null>(null);
  const [selected, setSelected] = useState<Evidence | null>(null);
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({
    stage: "Connecting",
    completed: [] as string[],
    message: "Waiting for the research service to acknowledge the request.",
  });
  const [endpoint, setEndpoint] = useState(() => {
    try {
      return localStorage.getItem("proofpilot:endpoint") || "";
    } catch {
      return "";
    }
  });
  const [endpointDraft, setEndpointDraft] = useState(endpoint);
  const controller = useRef<AbortController | null>(null);
  const [command, setCommand] = useState(false);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommand((v) => !v);
      }
    };
    window.addEventListener("keydown", fn);
    return () => {
      window.removeEventListener("keydown", fn);
      controller.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(t);
  }, [notice]);
  function navigate(next: string) {
    setPage(next);
    setError("");
    window.scrollTo(0, 0);
  }
  function openDemo(title?: string) {
    setReport(demo(title));
    navigate("results");
  }
  async function investigate() {
    setError("");
    if (input.trim().length < 12) {
      setError("Enter a claim of at least 12 characters.");
      return;
    }
    if (!endpoint) {
      setError(
        "Live research is not connected. Configure a research service in Settings, or explore the fictional demo below.",
      );
      return;
    }
    const abort = new AbortController();
    controller.current = abort;
    setRunning(true);
    setProgress({
      stage: "Connecting",
      completed: [],
      message: "Request sent. Waiting for the research service.",
    });
    const timeout = setTimeout(() => abort.abort("timeout"), 120000);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim: input.trim() }),
        signal: abort.signal,
      });
      if (!response.ok)
        throw new Error(
          `Research service returned ${response.status}. Please check its configuration and try again.`,
        );
      if (!response.body) throw new Error("The service returned no response.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "",
        result: Investigation | null = null;
      function consume(line: string) {
        if (!line.trim()) return;
        const event = JSON.parse(line);
        if (event.type === "error")
          throw new Error(
            typeof event.message === "string"
              ? event.message
              : "The research service failed.",
          );
        if (event.type === "status" && stages.includes(event.stage))
          setProgress({
            stage: event.stage,
            completed: Array.isArray(event.completed)
              ? event.completed.filter((s: string) => stages.includes(s))
              : [],
            message:
              typeof event.message === "string"
                ? event.message
                : "Research is in progress.",
          });
        if (event.type === "result") {
          if (!validReport(event.report) || event.report.demo)
            throw new Error("The research service returned an invalid report.");
          result = event.report;
        }
      }
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        lines.forEach(consume);
      }
      buffer += decoder.decode();
      consume(buffer);
      if (!result)
        throw new Error(
          "The service closed without a completed report. No result was saved.",
        );
      const finished = result as Investigation;
      setReport(finished);
      setHistory((old) => {
        const next = [finished, ...old.filter((x) => x.id !== finished.id)];
        try {
          localStorage.setItem("proofpilot:v1", JSON.stringify(next));
        } catch {
          setNotice(
            "Report loaded, but browser storage is full. Download it to keep a copy.",
          );
        }
        return next;
      });
      navigate("results");
    } catch (e) {
      setError(
        abort.signal.aborted
          ? abort.signal.reason === "timeout"
            ? "The request timed out after two minutes. No result was saved."
            : "Stopped waiting. The remote service may still be processing."
          : e instanceof Error
            ? e.message
            : "Network request failed. Check your connection.",
      );
    } finally {
      clearTimeout(timeout);
      setRunning(false);
      controller.current = null;
    }
  }
  const real = history.filter((r) => !r.demo);
  if (page === "landing")
    return <Landing enter={() => navigate("dashboard")} openDemo={openDemo} />;
  return (
    <div className={"app-shell " + (collapsed ? "collapsed" : "")}>
      <aside className="sidebar">
        <button
          className="brand-button"
          onClick={() => navigate("landing")}
          aria-label="Back to home"
        >
          <Logo />
        </button>
        <button
          className="button primary new-button"
          aria-label="New investigation"
          onClick={() => navigate("new")}
        >
          <Plus size={18} />
          <span>New investigation</span>
        </button>
        <span className="nav-label">WORKSPACE</span>
        <nav aria-label="Workspace navigation">
          {[
            { id: "dashboard", label: "Overview", icon: LayoutDashboard },
            { id: "history", label: "Investigation history", icon: History },
            { id: "graph", label: "Evidence graph", icon: Network },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((n) => (
            <button
              key={n.id}
              title={n.label}
              className={page === n.id ? "active" : ""}
              onClick={() => navigate(n.id)}
            >
              <n.icon size={19} />
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="local-note">
            <ShieldCheck size={19} />
            <p>
              Your research, in context.<small>Saved in this browser.</small>
            </p>
          </div>
          <button
            className="collapse-button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen size={20} />
            ) : (
              <PanelLeftClose size={20} />
            )}
            <span>Collapse sidebar</span>
          </button>
        </div>
      </aside>
      <div className="app-main">
        <header className="workspace-header">
          <div className="breadcrumb">
            Workspace <ChevronRight size={14} />{" "}
            <strong>
              {page === "results"
                ? "Investigation"
                : page === "new"
                  ? "New investigation"
                  : page.charAt(0).toUpperCase() + page.slice(1)}
            </strong>
          </div>
          <button
            className="search-command"
            aria-label="Find an investigation"
            onClick={() => setCommand(true)}
          >
            <Search size={16} />
            <span>Find an investigation</span>
            <kbd>Ctrl K</kbd>
          </button>
          <span className="connection">
            <span className={endpoint ? "live-dot" : "offline-dot"} />
            {endpoint ? "Service configured" : "Demo available"}
          </span>
          <button
            className="avatar"
            aria-label="Open settings"
            onClick={() => navigate("settings")}
          >
            P
          </button>
        </header>
        <main className="workspace-content">
          {page === "dashboard" && (
            <>
              <div className="workspace-title">
                <div>
                  <div className="eyebrow">YOUR INTELLIGENCE WORKSPACE</div>
                  <h1>
                    A little curiosity.
                    <br />
                    <span>A clearer picture.</span>
                  </h1>
                  <p>Start with a question. Follow where the evidence leads.</p>
                </div>
                <span className="date-label">
                  <Clock size={15} />
                  {new Date().toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="stats-grid">
                {[
                  { label: "Investigations", value: real.length, icon: Layers },
                  {
                    label: "Claims analyzed",
                    value: real.reduce((n, r) => n + r.claims.length, 0),
                    icon: ScanLine,
                  },
                  {
                    label: "Sources examined",
                    value: new Set(
                      real.flatMap((r) =>
                        r.evidence.map((e) => e.url || e.title),
                      ),
                    ).size,
                    icon: BookOpen,
                  },
                  {
                    label: "Evidence records",
                    value: real.reduce((n, r) => n + r.evidence.length, 0),
                    icon: Network,
                  },
                ].map((s) => (
                  <div className="stat panel" key={s.label}>
                    <s.icon size={18} />
                    <strong>{s.value.toString().padStart(2, "0")}</strong>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
              <div className="dashboard-grid">
                <section className="panel start-panel">
                  <span className="eyebrow">
                    THE NEXT DISCOVERY STARTS HERE
                  </span>
                  <h2>
                    What would you like
                    <br />
                    to investigate?
                  </h2>
                  <p>
                    Bring a claim, a bold promise, or a question that deserves a
                    closer look.
                  </p>
                  <button
                    className="button primary"
                    onClick={() => navigate("new")}
                  >
                    New investigation <ArrowRight size={17} />
                  </button>
                  <div className="starter-tags">
                    {examples.slice(0, 3).map((e) => (
                      <button
                        key={e}
                        onClick={() => {
                          setInput(`Investigate ${e.toLowerCase()}.`);
                          navigate("new");
                        }}
                      >
                        {e} <Plus size={12} />
                      </button>
                    ))}
                  </div>
                </section>
                <section className="panel demo-panel">
                  <div className="eyebrow">
                    EXPLORE BEFORE YOU BEGIN{" "}
                    <span className="tiny-tag">DEMO</span>
                  </div>
                  <div className="demo-network" aria-hidden="true">
                    <Network size={82} strokeWidth={0.8} />
                  </div>
                  <h3>A guarantee worth questioning.</h3>
                  <p>
                    Follow a fictional internship claim from first question to
                    Evidence Passport.
                  </p>
                  <button className="text-link" onClick={() => openDemo()}>
                    Explore the investigation <ArrowUpRight size={17} />
                  </button>
                </section>
              </div>
              <div className="section-heading compact">
                <h2>Recent investigations</h2>
                <button
                  className="text-link"
                  onClick={() => navigate("history")}
                >
                  View all <ArrowRight size={15} />
                </button>
              </div>
              {real.length ? (
                real.slice(0, 4).map((r) => (
                  <button
                    className="history-row panel"
                    key={r.id}
                    onClick={() => {
                      setReport(r);
                      navigate("results");
                    }}
                  >
                    <FileText />
                    <span>
                      <strong>{r.title}</strong>
                      <small>
                        {r.id} · {r.date}
                      </small>
                    </span>
                    <ChevronRight />
                  </button>
                ))
              ) : (
                <div className="empty-state panel">
                  <FileText size={28} />
                  <h3>Your research trail starts here.</h3>
                  <p>
                    Completed investigations will appear here. Demo cases are
                    excluded from your statistics.
                  </p>
                </div>
              )}
            </>
          )}
          {page === "new" && (
            <>
              <div className="eyebrow">START WITH A QUESTION</div>
              <h1>Let’s look into it.</h1>
              <p className="muted">
                Be specific. A clear claim makes a better starting point.
              </p>
              {running ? (
                <Pulse
                  {...progress}
                  onCancel={() => controller.current?.abort()}
                />
              ) : (
                <form
                  className="panel investigation-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void investigate();
                  }}
                >
                  <label htmlFor="claim">
                    What would you like to investigate?
                  </label>
                  <textarea
                    id="claim"
                    value={input}
                    maxLength={5000}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="For example: This training program guarantees every graduate a full-time job."
                    aria-describedby="claim-help claim-error"
                  />
                  <div className="input-footer">
                    <span id="claim-help">
                      A statement, a question, or a claim. Minimum 12
                      characters.
                    </span>
                    <span>{input.length.toLocaleString()} / 5,000</span>
                  </div>
                  <div className="form-actions">
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => setInput("")}
                      disabled={!input}
                    >
                      Clear
                    </button>
                    <Button type="submit">
                      Start Investigation <ArrowRight size={17} />
                    </Button>
                  </div>
                </form>
              )}
              {error && (
                <p id="claim-error" className="error" role="alert">
                  {error}
                </p>
              )}
              <div className="suggestions">
                <span className="eyebrow">NEED A STARTING POINT?</span>
                {[
                  "Does a guaranteed internship mean a guaranteed job?",
                  "Does this product’s battery last 48 hours under normal use?",
                  "Does a placement rate include every enrolled student?",
                ].map((s) => (
                  <button
                    className="panel"
                    key={s}
                    disabled={running}
                    onClick={() => setInput(s)}
                  >
                    {s}
                    <ArrowUpRight size={16} />
                  </button>
                ))}
              </div>
              <button
                className="text-link"
                disabled={running}
                onClick={() => openDemo()}
              >
                Explore a fictional example <ArrowRight size={16} />
              </button>
            </>
          )}
          {page === "history" && (
            <>
              <div className="eyebrow">YOUR RESEARCH TRAIL</div>
              <h1>Investigation history</h1>
              <label className="search-box">
                <Search size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title or ID"
                  aria-label="Search history"
                />
              </label>
              {history
                .filter((r) =>
                  (r.title + r.id).toLowerCase().includes(query.toLowerCase()),
                )
                .map((r) => (
                  <button
                    className="history-row panel"
                    key={r.id}
                    onClick={() => {
                      setReport(r);
                      navigate("results");
                    }}
                  >
                    <FileText />
                    <span>
                      <strong>{r.title}</strong>
                      <small>
                        {r.id} · {r.date}
                      </small>
                    </span>
                    <ChevronRight />
                  </button>
                ))}
              {!history.filter((r) =>
                (r.title + r.id).toLowerCase().includes(query.toLowerCase()),
              ).length && (
                <div className="empty-state panel">
                  <History />
                  <h3>No matching investigations</h3>
                  <p>
                    Completed live investigations are saved in this browser.
                  </p>
                  <button
                    className="button primary"
                    onClick={() => navigate("new")}
                  >
                    Start an investigation
                  </button>
                </div>
              )}
            </>
          )}
          {page === "settings" && (
            <>
              <div className="eyebrow">MAKE IT YOUR WORKSPACE</div>
              <h1>Settings</h1>
              <form
                className="panel settings-panel"
                onSubmit={(e) => {
                  e.preventDefault();
                  try {
                    const url = endpointDraft.trim();
                    if (
                      url &&
                      (!safeUrl(url) ||
                        (!url.startsWith("https://") &&
                          !/^http:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(
                            url,
                          )))
                    )
                      throw new Error("Use HTTPS, or HTTP on localhost.");
                    localStorage.setItem("proofpilot:endpoint", url);
                    setEndpoint(url);
                    setError("");
                    setNotice("Research service setting saved.");
                  } catch (e) {
                    setError(
                      e instanceof Error
                        ? e.message
                        : "Could not save settings.",
                    );
                  }
                }}
              >
                <h2>Research connection</h2>
                <p>
                  The interface is ready for a research service. Until one is
                  connected, use the clearly labeled fictional examples.
                </p>
                <label htmlFor="endpoint">Research service endpoint</label>
                <input
                  id="endpoint"
                  type="url"
                  value={endpointDraft}
                  onChange={(e) => setEndpointDraft(e.target.value)}
                  placeholder="https://your-service.example/investigate"
                />
                <p className="muted">
                  Claims are sent to this endpoint when you start an
                  investigation. Keep provider credentials on your server, never
                  in this field.
                </p>
                <button className="button primary">Save connection</button>
                {error && (
                  <p role="alert" className="error">
                    {error}
                  </p>
                )}
                <details>
                  <summary>Research service contract</summary>
                  <p>
                    POST a JSON object with a claim string. Return
                    newline-delimited JSON status events and one validated
                    result event. See the project README for the complete
                    schema. The service must allow this app’s origin through
                    CORS.
                  </p>
                </details>
              </form>
              <section className="panel settings-panel">
                <h2>Motion & accessibility</h2>
                <p>
                  ProofPilot follows your system’s reduced-motion preference.
                  Decorative movement and tilt are disabled when reduced motion
                  is on.
                </p>
                <h2>Local storage</h2>
                <p>
                  Reports stay in this browser. Export a JSON copy from an
                  Evidence Passport to keep your research.
                </p>
                <label className="button secondary import-button">
                  Import report JSON
                  <input
                    type="file"
                    accept="application/json,.json"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        if (file.size > 5000000)
                          throw new Error(
                            "Choose a JSON file smaller than 5 MB.",
                          );
                        const data = JSON.parse(await file.text());
                        if (!validReport(data))
                          throw new Error(
                            "This file is not a valid ProofPilot report.",
                          );
                        const next = [
                          data,
                          ...history.filter((r) => r.id !== data.id),
                        ];
                        localStorage.setItem(
                          "proofpilot:v1",
                          JSON.stringify(next),
                        );
                        setHistory(next);
                        setNotice("Report imported.");
                      } catch (e) {
                        setNotice(
                          e instanceof Error ? e.message : "Import failed.",
                        );
                      }
                    }}
                  />
                </label>
              </section>
            </>
          )}
          {(page === "results" || page === "graph") &&
            (report ? (
              <Results
                key={report.id + page}
                report={report}
                select={setSelected}
                notify={setNotice}
                initialGraph={page === "graph"}
              />
            ) : (
              <div className="empty-state panel">
                <Network size={40} />
                <h2>A graph begins with evidence.</h2>
                <p>
                  Open a completed investigation or explore a fictional example.
                </p>
                <button className="button primary" onClick={() => openDemo()}>
                  Explore demo
                </button>
              </div>
            ))}
        </main>
        <div className="workspace-footer">
          <ShieldCheck size={14} /> Evidence informs. You decide.
          <span>ProofPilot AI / Research workspace</span>
        </div>
      </div>
      <Sheet
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Evidence inspector"
      >
        {selected && (
          <div className="inspector-content">
            <span className={`badge ${selected.classification.toLowerCase()}`}>
              {selected.classification}
            </span>
            <h2>{selected.claim}</h2>
            <span className="eyebrow">EXACT SOURCE PASSAGE</span>
            <blockquote>{selected.passage}</blockquote>
            <dl>
              <dt>Source</dt>
              <dd>{selected.title}</dd>
              <dt>Publisher</dt>
              <dd>{selected.publisher}</dd>
              <dt>Published</dt>
              <dd>{selected.published || "Not provided"}</dd>
              <dt>Retrieved</dt>
              <dd>
                {selected.retrieved ||
                  (report?.demo
                    ? "Not retrieved — illustrative record"
                    : "Not provided")}
              </dd>
            </dl>
            <h3>Why this classification?</h3>
            <p>{selected.explanation}</p>
            {safeUrl(selected.url) ? (
              <a
                className="button primary"
                href={safeUrl(selected.url)}
                target="_blank"
                rel="noreferrer"
              >
                Open original source <ExternalLink size={16} />
              </a>
            ) : (
              <p className="muted">
                No original source link is available for this record.
              </p>
            )}
          </div>
        )}
      </Sheet>
      <Sheet
        open={command}
        onClose={() => setCommand(false)}
        title="Find an investigation"
      >
        <label className="search-box">
          <Search size={17} />
          <input
            autoFocus
            aria-label="Search saved investigations"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Title or investigation ID"
          />
        </label>
        {history
          .filter((r) =>
            (r.title + r.id).toLowerCase().includes(query.toLowerCase()),
          )
          .map((r) => (
            <button
              className="history-row panel"
              key={r.id}
              onClick={() => {
                setReport(r);
                navigate("results");
                setCommand(false);
              }}
            >
              {r.title}
              <ArrowRight size={17} />
            </button>
          ))}
        {!history.length && <p>No saved investigations yet.</p>}
        <button
          className="button primary"
          onClick={() => {
            navigate("new");
            setCommand(false);
          }}
        >
          <Plus size={17} />
          New investigation
        </button>
      </Sheet>
      {notice && (
        <div className="toast" role="status">
          {notice}
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
