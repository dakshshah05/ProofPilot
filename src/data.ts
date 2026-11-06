export type Evidence = {
  id: string;
  claim: string;
  classification: "Supported" | "Contradicted" | "Uncertain";
  passage: string;
  title: string;
  publisher: string;
  url?: string;
  published?: string;
  retrieved?: string;
  explanation: string;
};
export type Investigation = {
  id: string;
  title: string;
  date: string;
  demo: boolean;
  claims: string[];
  evidence: Evidence[];
  summary: string;
  limitations: string;
  questions: string[];
};
export const examples = [
  "Internship guarantees",
  "Product performance claims",
  "Educational marketing claims",
  "Public statistics",
  "Technology claims",
];
export function demo(
  title = "Does a guaranteed internship mean a guaranteed job?",
): Investigation {
  const scenario = scenarios[title];
  if (scenario) {
    const base = demo();
    const evidence: Evidence[] = scenario.records.map((record, index) => ({
      id: `E0${index + 1}`, claim: record[0], passage: record[1],
      explanation: record[2], classification: (['Supported','Contradicted','Uncertain'] as const)[index],
      title: ['Sample specification','Sample testing notes','Sample methodology'][index],
      publisher: 'Fictional Research Studio',
    }));
    return {...base, id: `DEMO-00${examples.indexOf(title)+1}`, title: scenario.title,
      claims: evidence.map(e=>e.claim), evidence,
      summary: scenario.summary + ' All records in this example are fictional.',
      questions: ['Can the result be independently reproduced?', 'What conditions and exclusions affect the claim?']};
  }
  return {
    id: "DEMO-001",
    title,
    date: "2026-11-06",
    demo: true,
    claims: [
      "The program guarantees an internship.",
      "Every graduate receives a full-time offer.",
      "Placement figures cover all participants.",
    ],
    summary:
      "This fictional case shows why an internship guarantee and a full-time employment guarantee are different claims. The sample records illustrate supporting, conflicting, and incomplete evidence—not a finding about a real organization.",
    limitations:
      "All passages and organizations in this demo are fictional. No external sources have been retrieved. Do not cite this example as research.",
    questions: [
      "What is the denominator of the placement rate?",
      "Are eligibility criteria disclosed before enrollment?",
    ],
    evidence: [
      {
        id: "E01",
        claim: "The program guarantees an internship.",
        classification: "Supported",
        passage:
          "Eligible participants who complete every module will receive an internship placement.",
        title: "Sample program terms",
        publisher: "Fictional Learning Co.",
        explanation:
          "The sample passage supports an internship placement, conditional on eligibility and completion.",
      },
      {
        id: "E02",
        claim: "Every graduate receives a full-time offer.",
        classification: "Contradicted",
        passage:
          "Internship placements do not guarantee a subsequent offer of employment.",
        title: "Sample enrollment agreement",
        publisher: "Fictional Learning Co.",
        explanation:
          "The sample agreement explicitly distinguishes internship placement from full-time employment.",
      },
      {
        id: "E03",
        claim: "Placement figures cover all participants.",
        classification: "Uncertain",
        passage:
          "Our reported placement outcomes reflect eligible respondents to the graduate survey.",
        title: "Sample outcomes methodology",
        publisher: "Fictional Learning Co.",
        explanation:
          "The passage does not disclose the response rate or total number of participants.",
      },
    ],
  };
}
const scenarios: Record<string, {title:string;summary:string;records:[string,string,string][]}> = {
  'Product performance claims': {title:'Does a 48-hour battery claim hold up in everyday use?',summary:'The sample records distinguish a laboratory battery result from an everyday-use promise.',records:[
    ['The device reaches 48 hours in standby.','Standby testing reached 48 hours with wireless connections disabled.','The sample result supports standby endurance under the stated conditions.'],
    ['The device lasts 48 hours during video playback.','Continuous video playback testing recorded 11 hours.','The sample playback result conflicts with the broad 48-hour claim.'],
    ['Everyday users can expect the same endurance.','Battery life varies with settings and usage.','No representative daily-use study is included.']]},
  'Educational marketing claims': {title:'What does a 95% placement rate actually measure?',summary:'This example follows the denominator and exclusions behind a fictional placement statistic.',records:[
    ['The rate refers to survey respondents.','95% of eligible survey respondents reported a placement.','The sample statement limits the result to eligible respondents.'],
    ['The rate includes every enrolled student.','Nonrespondents and withdrawn students are excluded.','The stated exclusions contradict an all-student interpretation.'],
    ['The result predicts next year’s outcomes.','The survey covers one graduating cohort.','A single cohort cannot establish future outcomes.']]},
  'Public statistics': {title:'Does a rise in reported cases mean a rise in incidence?',summary:'The sample separates a measured reporting change from a claim about underlying incidence.',records:[
    ['Reported cases increased.','The sample register recorded 120 cases versus 100 in the prior period.','The illustrative register supports an increase in recorded cases.'],
    ['The reporting method remained unchanged.','This period introduced three additional reporting centers.','The collection method changed, limiting direct comparison.'],
    ['The underlying incidence increased by the same rate.','No population-adjusted estimate is available.','Reporting coverage and population changes remain unresolved.']]},
  'Technology claims': {title:'Is a new model twice as fast across every workload?',summary:'This example contrasts a narrow benchmark result with a universal performance claim.',records:[
    ['A selected benchmark ran twice as fast.','Benchmark A completed in 5 seconds versus the baseline’s 10 seconds.','The sample measurement supports the improvement for benchmark A.'],
    ['Every workload ran twice as fast.','Benchmark B required 12 seconds versus the baseline’s 10 seconds.','The counterexample contradicts the universal claim.'],
    ['The result applies to production deployments.','Tests used one hardware configuration and synthetic inputs.','No production workload validation is supplied.']]},
};
export function readHistory(): Investigation[] {
  try {
    const data = JSON.parse(localStorage.getItem("proofpilot:v1") || "[]");
    return Array.isArray(data) ? data.filter(validReport) : [];
  } catch {
    return [];
  }
}
export function validReport(x: unknown): x is Investigation {
  if (!x || typeof x !== "object") return false;
  const r = x as Investigation;
  return (
    typeof r.id === "string" &&
    typeof r.title === "string" &&
    typeof r.date === "string" &&
    typeof r.demo === "boolean" &&
    typeof r.summary === "string" &&
    typeof r.limitations === "string" &&
    Array.isArray(r.questions) &&
    r.questions.every((x) => typeof x === "string") &&
    Array.isArray(r.claims) &&
    r.claims.every((x) => typeof x === "string") &&
    Array.isArray(r.evidence) &&
    new Set(r.evidence.map(e => e?.id)).size === r.evidence.length &&
    r.evidence.every(
      (e) =>
        e !== null &&
        typeof e === "object" &&
        typeof e.id === "string" &&
        typeof e.claim === "string" &&
        typeof e.passage === "string" &&
        typeof e.title === "string" &&
        typeof e.publisher === "string" &&
        typeof e.explanation === "string" &&
        [e.url, e.published, e.retrieved].every(value => value === undefined || typeof value === 'string') &&
        ["Supported", "Contradicted", "Uncertain"].includes(e.classification),
    )
  );
}
export function safeUrl(url?: string) {
  try {
    const u = new URL(url || "");
    return ["https:", "http:"].includes(u.protocol) ? u.href : undefined;
  } catch {
    return undefined;
  }
}
