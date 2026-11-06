# ProofPilot AI

A responsive evidence-first React application with a cinematic landing page, local research workspace, React Flow evidence graph, source inspector, streaming progress UI, and printable Evidence Passport.

## Run

```sh
npm install
npm run dev
npm run build
```

Node 20.19+ recommended. Built with React, TypeScript, Vite, Tailwind CSS, Motion, Lucide and Radix Dialog (the accessible primitive used by shadcn/ui). The graph is loaded only when opened.

## Current scope

This repository implements the interface and research-service client. It does **not** contain a live AI research engine. Demo evidence is fictional and clearly labeled. Demo cases never populate live statistics. Reports are stored in localStorage in this browser, not a shared cloud account. No API keys are included. There is no GitHub link because no repository URL was supplied.

Configure a research endpoint in Settings to enable live investigations. Use HTTPS outside localhost. Claims are sent only on submission. Provider API keys must remain on your service. The service must allow the application origin through CORS, handle authentication as appropriate, retrieve real source passages, and generate validated reports. HTTP errors, malformed responses, connection failures, timeout, and explicit service errors are shown without fabricated success. Stop waiting aborts the client request; it does not guarantee remote cancellation.

## Research API contract

POST the configured URL with `Content-Type: application/json`:

```json
{ "claim": "The user’s claim" }
```

Respond with UTF-8 newline-delimited JSON (`application/x-ndjson`). Flush each status event when its backend step is actually reached. Never manufacture completed stages.

```json
{"type":"status","stage":"Searching","completed":["Understanding","Decomposing"],"message":"Searching primary sources."}
{"type":"error","message":"Source provider is unavailable."}
```

Stage names: Understanding, Decomposing, Searching, Retrieving, Analyzing, Verifying, Generating Passport. Partial retrieval should be explained in status messages, report limitations and unresolved questions. There is no percentage progress.

A successful stream ends with one `{"type":"result","report":...}` event. The report must follow this schema:

```ts
interface Investigation {
  id: string;
  title: string;
  date: string;
  demo: boolean; // false for live results
  claims: string[];
  evidence: {
    id: string;
    claim: string;
    classification: "Supported" | "Contradicted" | "Uncertain";
    passage: string; // verbatim retrieved source passage
    title: string;
    publisher: string;
    url?: string; // only http(s) links are rendered
    published?: string;
    retrieved?: string;
    explanation: string;
  }[];
  summary: string;
  limitations: string;
  questions: string[];
}
```

No completed report is saved until the stream finishes successfully. A request times out after two minutes. JSON reports may be imported in Settings (5 MB limit); imported demo reports remain excluded from statistics. JSON exports and browser Print / Save as PDF are available from Passport.

## Accessibility and motion

Keyboard-operable tabs, source inspector with focus trapping/restoration and Escape dismissal, labeled controls, evidence list alternative, visible focus rings, and system reduced-motion support. Touch and reduced-motion users receive no card tilt or cursor effects. Example carousel uses native scrolling and contains no duplicated focus targets. Mobile uses a bottom navigation bar.

## Verification

Production TypeScript/Vite build passes. No Lighthouse scores are claimed. No live model integration has been verified without a configured research service.

Browser checks completed: desktop landing/workspace rendering, mobile dossier and graph at 390px, tablet form at 768px, no horizontal overflow in those checked views, graph-source inspector selection, Escape dismissal, End/arrow-key tab navigation, classification filtering, input validation, and honest missing-service errors. Report-schema checks cover all five fictional examples, malformed source data, duplicate source IDs, and unsafe URL schemes. Reduced-motion rules were reviewed in code; OS-level emulation and Lighthouse were not run. Live backend behavior remains unverified without a research service.
