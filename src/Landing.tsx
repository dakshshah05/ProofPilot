import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Network,
  FileText,
  Layers,
  ScanLine,
  Link2,
  Search,
  Check,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Constellation, TiltCard } from "./ui";
import { examples } from "./data";
export function Logo() {
  return (
    <span className="logo">
      <span className="logo-symbol">
        <ScanLine size={23} />
      </span>
      proofpilot<span className="ai-tag">AI</span>
    </span>
  );
}
const features = [
  {
    icon: ScanLine,
    title: "One statement. Every claim.",
    name: "Claim Intelligence",
    text: "Separate complex statements into clear, individual claims. Know exactly what you’re investigating.",
  },
  {
    icon: Search,
    title: "Go beyond the first result.",
    name: "Evidence Discovery",
    text: "Follow original sources, inspect the context, and keep a traceable record of what you find.",
  },
  {
    icon: Layers,
    title: "The other side matters.",
    name: "Contradiction Detection",
    text: "Put conflicting evidence side by side. Make uncertainty visible instead of hiding it.",
  },
  {
    icon: Network,
    title: "See how it all connects.",
    name: "Evidence Graph",
    text: "Explore the relationships between claims, sources, and evidence in one spatial canvas.",
  },
  {
    icon: FileText,
    title: "Research you can take with you.",
    name: "Evidence Passport",
    text: "A structured dossier of findings, citations, open questions, and honest limitations.",
  },
  {
    icon: Link2,
    title: "No black boxes. Just context.",
    name: "Transparent Reasoning",
    text: "Inspect the passage behind each assessment and follow every conclusion to its source.",
  },
];
export default function Landing({
  enter,
  openDemo,
}: {
  enter: () => void;
  openDemo: (title?: string) => void;
}) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const carousel = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  useEffect(() => {
    const nodes = document.querySelectorAll("[data-step]");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting)
            setActive(Number((e.target as HTMLElement).dataset.step));
        }),
      { rootMargin: "-20% 0px -40% 0px" },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <header className="landing-nav">
        <a href="#" aria-label="ProofPilot home">
          <Logo />
        </a>
        <nav aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#capabilities">Capabilities</a>
          <a href="#examples">
            Explore examples <span className="tiny-tag">DEMO</span>
          </a>
        </nav>
        <button className="button small secondary" onClick={enter}>
          Open workspace <ArrowUpRight size={15} />
        </button>
      </header>
      <main>
        <section
          className="hero"
          ref={hero}
          onPointerMove={(e) => {
            if (reduced || e.pointerType !== "mouse") return;
            const r = e.currentTarget.getBoundingClientRect();
            hero.current?.style.setProperty("--px", `${e.clientX - r.left}px`);
            hero.current?.style.setProperty("--py", `${e.clientY - r.top}px`);
          }}
        >
          <div className="hero-copy">
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <div className="eyebrow">
                <span className="live-dot" /> EVIDENCE OVER ASSUMPTIONS
              </div>
              <h1>
                Every claim
                <br />
                has a story.
                <br />
                <span>Find the evidence.</span>
              </h1>
              <p className="hero-description">
                An AI-powered intelligence engine that investigates claims,
                uncovers contradictions, and transforms information into
                transparent, evidence-backed reports.
              </p>
              <div className="hero-actions">
                <motion.button
                  className="button primary"
                  onClick={enter}
                  whileHover={reduced ? undefined : { y: -3 }}
                  onPointerMove={(e) => {
                    if (reduced || e.pointerType !== "mouse") return;
                    const r = e.currentTarget.getBoundingClientRect();
                    e.currentTarget.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.025}px 0`;
                  }}
                  onPointerLeave={(e) =>
                    (e.currentTarget.style.translate = "0 0")
                  }
                >
                  Start Investigating <ArrowRight size={18} />
                </motion.button>
                <a href="#how-it-works" className="button text-button">
                  <span className="play-icon">
                    <Play size={12} />
                  </span>{" "}
                  Watch How It Works
                </a>
              </div>
              <div className="trust-row">
                <span>
                  <ShieldCheck size={14} /> Traceable sources
                </span>
                <span>
                  <Network size={14} /> Transparent reasoning
                </span>
                <span>
                  <FileText size={14} /> Exportable findings
                </span>
              </div>
            </motion.div>
          </div>
          <Constellation />
          <div className="hero-footer">
            <span>
              BUILT FOR CURIOUS MINDS. DESIGNED FOR CRITICAL THINKING.
            </span>
            <a href="#how-it-works">SCROLL TO DISCOVER ↓</a>
          </div>
        </section>
        <section className="principles-strip">
          <span>
            Less noise.
            <br />
            <strong>More understanding.</strong>
          </span>
          <p>
            Claims are everywhere.
            <br />
            Clarity takes investigation.
          </p>
          <div>
            <ShieldCheck />
            <span>
              Evidence first.
              <br />
              <small>Always.</small>
            </span>
          </div>
          <div>
            <Layers />
            <span>
              Uncertainty included.
              <br />
              <small>By design.</small>
            </span>
          </div>
        </section>
        <section className="section" id="how-it-works">
          <div className="section-heading">
            <div>
              <div className="eyebrow">01 / THE PROCESS</div>
              <h2>
                From Question
                <br />
                to Evidence.
              </h2>
            </div>
            <p>
              A clear path through complex information.
              <br />
              Every step leaves a trail you can follow.
            </p>
          </div>
          <div className="workflow">
            <div className="workflow-visual">
              <Constellation />
              <div className="workflow-active">
                <span className="mono">0{active + 1} / 06</span>
                <h3>
                  {
                    [
                      "A question enters the system.",
                      "Individual claims emerge.",
                      "Sources are discovered.",
                      "Evidence is connected.",
                      "Contradictions become visible.",
                      "Your Evidence Passport.",
                    ][active]
                  }
                </h3>
                <span className="muted">
                  An illustrated workflow, not a live investigation.
                </span>
              </div>
            </div>
            <div className="workflow-steps">
              {[
                "Ask a better question",
                "Break it into claims",
                "Go to the source",
                "Connect the evidence",
                "Challenge the conclusion",
                "Keep the full picture",
              ].map((s, i) => (
                <motion.article
                  data-step={i}
                  key={s}
                  className={active === i ? "step active" : "step"}
                  initial={reduced ? false : { opacity: 0.6, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <span className="step-number">0{i + 1}</span>
                  <div>
                    <h3>{s}</h3>
                    <p>
                      {
                        [
                          "Start with a statement, a question, or a claim worth checking.",
                          "Separate the testable assertions from the surrounding language.",
                          "Discover relevant material and retrieve original passages.",
                          "Link each passage to the claim it addresses.",
                          "Compare supporting and contradictory findings, with context.",
                          "Export a transparent account of findings and what remains unknown.",
                        ][i]
                      }
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
        <section className="section" id="capabilities">
          <div className="section-heading">
            <div>
              <div className="eyebrow">02 / YOUR RESEARCH TOOLKIT</div>
              <h2>
                Built to question.
                <br />
                Designed to clarify.
              </h2>
            </div>
            <p>
              Six connected capabilities.
              <br />
              One considered investigation.
            </p>
          </div>
          <div className="bento">
            {features.map((f, i) => (
              <TiltCard key={f.name} className={"feature feature-" + i}>
                <div className="feature-top">
                  <f.icon size={22} />
                  <span className="mono">0{i + 1}</span>
                </div>
                <div className="feature-mini" aria-hidden="true">
                  {i === 0 ? (
                    <>
                      <span className="sentence">
                        “A guarantee deserves a closer look.”
                      </span>
                      <div className="chips">
                        <span>Claim 01 ↗</span>
                        <span>Claim 02 ↗</span>
                        <span>Claim 03 ↗</span>
                      </div>
                    </>
                  ) : i === 1 ? (
                    <div className="source-lines">
                      <span>
                        ▤ Original publication <Check size={12} />
                      </span>
                      <span>
                        ▤ Independent analysis <Check size={12} />
                      </span>
                      <span>
                        ▤ Source methodology <Check size={12} />
                      </span>
                    </div>
                  ) : i === 2 ? (
                    <div className="comparison">
                      <span className="supported">✓ Supporting</span>
                      <span>versus</span>
                      <span className="contradicted">≠ Contradictory</span>
                    </div>
                  ) : i === 3 ? (
                    <div className="mini-network">
                      ◉ ─── ◇ ─── ◉<br />
                      ╲　　│　　╱
                      <br />
                      　　◉
                    </div>
                  ) : i === 4 ? (
                    <div className="mini-document">
                      <span>PROOFPILOT / EVIDENCE PASSPORT</span>
                      <b>
                        An investigation.
                        <br />
                        The complete picture.
                      </b>
                      <hr />
                      <i />
                      <i />
                    </div>
                  ) : (
                    <div className="citation">
                      Claim <span>────</span> [01]
                      <br />
                      <span>　└────────</span> [02]
                    </div>
                  )}
                </div>
                <span className="feature-label">{f.name}</span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </TiltCard>
            ))}
          </div>
        </section>
        <section className="section inside">
          <div className="eyebrow">03 / A CLOSER LOOK</div>
          <h2>Inside an Investigation.</h2>
          <div className="stack-cards">
            {["Decompose", "Discover", "Compare", "Verify"].map((s, i) => (
              <article
                className="stack-card"
                style={{ top: 100 + i * 20 }}
                key={s}
              >
                <span className="stack-number">0{i + 1}</span>
                <div>
                  <span className="eyebrow">FOLLOW THE RESEARCH</span>
                  <h3>{s}.</h3>
                  <p>
                    {
                      [
                        "Precise questions make better investigations. Turn a broad statement into claims that can actually be checked.",
                        "A headline is a starting point. Find the original source and read what it really says.",
                        "Agreement is only half the picture. Examine conflicting passages and the context behind them.",
                        "Separate what the evidence supports from what still needs an answer. Keep the limitations with the conclusion.",
                      ][i]
                    }
                  </p>
                </div>
                <span className="stack-glyph" aria-hidden="true">
                  {["⌘", "⌕", "≠", "✓"][i]}
                </span>
              </article>
            ))}
          </div>
        </section>
        <section className="section examples" id="examples">
          <div className="section-heading">
            <div>
              <div className="eyebrow">04 / TAKE A CLOSER LOOK</div>
              <h2>Curiosity starts here.</h2>
            </div>
            <div className="carousel-controls">
              <button
                className="icon-button"
                aria-label="Previous examples"
                onClick={() =>
                  carousel.current?.scrollBy({
                    left: -340,
                    behavior: reduced ? "instant" : "smooth",
                  })
                }
              >
                <ChevronLeft />
              </button>
              <button
                className="icon-button"
                aria-label="Next examples"
                onClick={() =>
                  carousel.current?.scrollBy({
                    left: 340,
                    behavior: reduced ? "instant" : "smooth",
                  })
                }
              >
                <ChevronRight />
              </button>
            </div>
          </div>
          <p className="muted">
            Illustrative cases to explore the interface. All example evidence is
            fictional.
          </p>
          <div className="example-track" ref={carousel}>
            {examples.map((s, i) => (
              <TiltCard className="example-card" key={s}>
                <div className="example-meta">
                  <span>EXAMPLE 0{i + 1}</span>
                  <span className="tiny-tag">FICTIONAL</span>
                </div>
                <h3>{s}</h3>
                <p>
                  Explore how a statement becomes a set of questions, sources,
                  and transparent findings.
                </p>
                <button className="text-link" onClick={() => openDemo(s)}>
                  View demo <ArrowUpRight size={17} />
                </button>
              </TiltCard>
            ))}
          </div>
        </section>
        <section className="closing">
          <div className="eyebrow">
            YOUR NEXT QUESTION DESERVES A BETTER ANSWER.
          </div>
          <h2>Don’t just take their word for it.</h2>
          <button className="button primary" onClick={enter}>
            Follow the evidence <ArrowRight size={18} />
          </button>
          <p>Clarity begins with curiosity.</p>
        </section>
      </main>
      <footer>
        <Logo />
        <p>Trust comes from evidence. Not decoration.</p>
        <span>© {new Date().getFullYear()} ProofPilot AI</span>
      </footer>
    </>
  );
}
