import { lazy, Suspense, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  FileText,
  ShieldCheck,
  Download,
  Printer,
  Copy,
} from "lucide-react";
import type { Investigation, Evidence } from "./data";
import { safeUrl } from "./data";
import { Logo } from "./Landing";
const Graph = lazy(() => import("./Graph"));
export default function Results({
  report,
  select,
  notify,
  initialGraph = false,
}: {
  report: Investigation;
  select: (e: Evidence) => void;
  notify: (s: string) => void;
  initialGraph?: boolean;
}) {
  const [view, setView] = useState(
    initialGraph ? "Evidence graph" : "Overview",
  );
  const [filter, setFilter] = useState("All");
  const visible = report.evidence.filter(
    (e) => filter === "All" || e.classification === filter,
  );
  function download() {
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proofpilot-${report.id.replace(/[^a-z0-9-]/gi, "_")}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("JSON download requested.");
  }
  return (
    <>
      <div className="report-heading">
        <div>
          <div className="eyebrow">
            {report.demo
              ? "FICTIONAL EXAMPLE · NOT VERIFIED RESEARCH"
              : "EVIDENCE WORKSPACE"}
          </div>
          <h1>{report.title}</h1>
          <span className="mono">
            {report.id} · {report.date} · {report.claims.length} claims ·{" "}
            {new Set(report.evidence.map((e) => e.url || e.title)).size} sources
          </span>
        </div>
        <button
          className="button secondary"
          onClick={() => setView("Passport")}
        >
          <FileText size={16} /> Evidence Passport
        </button>
      </div>
      {report.demo && (
        <div className="demo-banner">
          <ShieldCheck size={18} />
          <span>
            Illustrative demo. All passages and publishers are fictional. No
            live investigation was performed.
          </span>
        </div>
      )}
      <div className="tabs" role="tablist" aria-label="Investigation views">
        {["Overview", "Evidence graph", "Evidence list", "Passport"].map(
          (v, i) => (
            <button
              role="tab"
              id={`tab-${i}`}
              aria-controls="report-panel"
              aria-selected={view === v}
              tabIndex={view === v ? 0 : -1}
              key={v}
              onKeyDown={(e) => {
                if (
                  ["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)
                ) {
                  e.preventDefault();
                  const next =
                    e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? 3
                        : (i + (e.key === "ArrowRight" ? 1 : 3)) % 4;
                  setView(
                    ["Overview", "Evidence graph", "Evidence list", "Passport"][
                      next
                    ],
                  );
                  document.getElementById(`tab-${next}`)?.focus();
                }
              }}
              onClick={() => setView(v)}
            >
              {v}
            </button>
          ),
        )}
      </div>
      <section
        id="report-panel"
        role="tabpanel"
        aria-labelledby={`tab-${["Overview", "Evidence graph", "Evidence list", "Passport"].indexOf(view)}`}
      >
        {view !== "Passport" ? (
          <>
            <div className="filters" aria-label="Filter evidence">
              {["All", "Supported", "Contradicted", "Uncertain"].map((f) => (
                <button
                  aria-pressed={filter === f}
                  className={filter === f ? "selected" : ""}
                  key={f}
                  onClick={() => setFilter(f)}
                >
                  {f}{" "}
                  <span>
                    {f === "All"
                      ? report.evidence.length
                      : report.evidence.filter((e) => e.classification === f)
                          .length}
                  </span>
                </button>
              ))}
            </div>
            {view === "Evidence graph" ? (
              <>
                <Suspense
                  fallback={
                    <div className="panel empty-state" role="status">
                      Loading evidence graph…
                    </div>
                  }
                >
                  <Graph report={report} select={select} filter={filter} />
                </Suspense>
                <button
                  className="text-link"
                  onClick={() => setView("Evidence list")}
                >
                  Use accessible evidence list <ArrowRight size={16} />
                </button>
              </>
            ) : (
              <>
                {view === "Overview" && (
                  <div className="panel summary-panel">
                    <span className="eyebrow">EXECUTIVE SUMMARY</span>
                    <h2>A closer look at the claim.</h2>
                    <p>{report.summary}</p>
                  </div>
                )}
                <div className="evidence-grid">
                  {visible.map((e) => (
                    <button
                      className="panel evidence-card"
                      key={e.id}
                      onClick={() => select(e)}
                    >
                      <div>
                        <span
                          className={`badge ${e.classification.toLowerCase()}`}
                        >
                          {e.classification === "Supported"
                            ? "✓"
                            : e.classification === "Contradicted"
                              ? "≠"
                              : "?"}{" "}
                          {e.classification}
                        </span>
                        <span className="mono">{e.id}</span>
                      </div>
                      <h3>{e.claim}</h3>
                      <p>{e.explanation}</p>
                      <span className="evidence-source">
                        <FileText size={15} />
                        {e.title}
                        <ArrowUpRight size={16} />
                      </span>
                    </button>
                  ))}
                </div>
                {!visible.length && (
                  <p className="empty-state">
                    No evidence matches this filter.
                  </p>
                )}
              </>
            )}
          </>
        ) : (
          <article className="passport panel">
            <div className="passport-tools">
              <button className="button secondary" onClick={download}>
                <Download size={16} />
                JSON
              </button>
              <button
                className="button secondary"
                onClick={() => window.print()}
              >
                <Printer size={16} />
                Print / PDF
              </button>
              <button
                className="button secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      JSON.stringify(report, null, 2),
                    );
                    notify("Report copied.");
                  } catch {
                    notify("Clipboard unavailable. Download the JSON instead.");
                  }
                }}
              >
                <Copy size={16} />
                Copy
              </button>
            </div>
            <div className="passport-masthead">
              <Logo />
              <span className="mono">RESEARCH DOSSIER / {report.id}</span>
            </div>
            <span className="eyebrow">
              EVIDENCE PASSPORT {report.demo ? "· FICTIONAL DEMO" : ""}
            </span>
            <h1>{report.title}</h1>
            <p className="mono">
              {report.date} · {report.claims.length} claims ·{" "}
              {new Set(report.evidence.map((e) => e.url || e.title)).size}{" "}
              sources
            </p>
            <p className="assessment">
              {report.demo
                ? "Illustrative assessment only"
                : report.evidence.some((e) => e.classification !== "Supported")
                  ? "Mixed or incomplete evidence"
                  : "Supporting records present; review limitations"}
            </p>
            {[
              { title: "Executive Summary", body: <p>{report.summary}</p> },
              {
                title: "Claims Investigated",
                body: (
                  <ol>
                    {report.claims.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ol>
                ),
              },
              {
                title: "Supporting Evidence",
                body: (
                  <EvidencePassages
                    evidence={report.evidence.filter(
                      (e) => e.classification === "Supported",
                    )}
                    select={select}
                  />
                ),
              },
              {
                title: "Contradictory Evidence",
                body: (
                  <EvidencePassages
                    evidence={report.evidence.filter(
                      (e) => e.classification === "Contradicted",
                    )}
                    select={select}
                  />
                ),
              },
              {
                title: "Source Analysis",
                body: (
                  <EvidencePassages
                    evidence={report.evidence}
                    select={select}
                  />
                ),
              },
              {
                title: "Unresolved Questions",
                body: (
                  <ul>
                    {report.questions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                ),
              },
              { title: "Limitations", body: <p>{report.limitations}</p> },
              {
                title: "Further Verification",
                body: (
                  <p>
                    Review the original publications, check their dates and
                    methods, and seek independent evidence for unresolved claims
                    before relying on the assessment.
                  </p>
                ),
              },
            ].map((s, i) => (
              <section className="passport-section" key={s.title}>
                <span className="mono">0{i + 1}</span>
                <div>
                  <h2>{s.title}</h2>
                  {s.body}
                </div>
              </section>
            ))}
          </article>
        )}
      </section>
    </>
  );
}
function EvidencePassages({
  evidence,
  select,
}: {
  evidence: Evidence[];
  select: (e: Evidence) => void;
}) {
  return evidence.length ? (
    <div>
      {evidence.map((e) => (
        <div key={e.id} className="passport-evidence">
          <button className="text-link" onClick={() => select(e)}>
            [{e.id}] {e.title} <ArrowUpRight size={14} />
          </button>
          <p>“{e.passage}”</p>
          <small>
            {e.publisher} · {e.classification}
          </small>
          {safeUrl(e.url) && (
            <a className="print-url" href={safeUrl(e.url)}>
              {safeUrl(e.url)}
            </a>
          )}
        </div>
      ))}
    </div>
  ) : (
    <p>No records in this category.</p>
  );
}
