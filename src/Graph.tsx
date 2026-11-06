import { useMemo, useState, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Maximize, RotateCcw } from "lucide-react";
import type { Investigation, Evidence } from "./data";
export default function EvidenceGraph({
  report,
  select,
  filter,
}: {
  report: Investigation;
  select: (e: Evidence) => void;
  filter: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [reset, setReset] = useState(0);
  const [error, setError] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const { nodes, edges } = useMemo(() => {
    const evidence = report.evidence.filter(
      (e) => filter === "All" || e.classification === filter,
    );
    const nodes: Node[] = [
      {
        id: "root",
        position: { x: 310, y: 0 },
        data: { label: report.title },
        style: {
          background: "#292044",
          color: "#f8fafc",
          border: "1px solid #8b5cf6",
          width: 240,
          padding: 18,
          borderRadius: 16,
        },
      },
    ];
    const edges: Edge[] = [];
    evidence.forEach((e, i) => {
      const color = {
        Supported: "#10b981",
        Contradicted: "#f87171",
        Uncertain: "#fbbf24",
      }[e.classification];
      nodes.push({
        id: e.id,
        position: { x: i * 290, y: 190 },
        data: {
          label: (
            <div>
              <small style={{ color }}>{e.classification.toUpperCase()}</small>
              <p>{e.claim}</p>
              <small>{e.title} ↗</small>
            </div>
          ),
        },
        style: {
          background: "#121b2d",
          color: "#f8fafc",
          border: `1px solid ${color}`,
          borderRadius: 16,
          width: 240,
          padding: 16,
          opacity: selected && selected !== e.id ? 0.5 : 1,
          boxShadow: selected === e.id ? `0 0 24px ${color}33` : undefined,
        },
      });
      edges.push({
        id: `root-${e.id}`,
        source: "root",
        target: e.id,
        style: {
          stroke: color,
          strokeWidth: selected === e.id ? 3 : 1.5,
          opacity: selected && selected !== e.id ? 0.25 : 1,
        },
        markerEnd: { type: MarkerType.ArrowClosed, color },
      });
    });
    return { nodes, edges };
  }, [report, filter, selected]);
  return (
    <div className="graph-wrap" ref={root}>
      <div className="graph-tools">
        <span className="mono">EVIDENCE NETWORK</span>
        <button
          className="icon-button"
          aria-label="Reset graph"
          onClick={() => {
            setSelected(null);
            setReset((v) => v + 1);
          }}
        >
          <RotateCcw size={17} />
        </button>
        <button
          className="icon-button"
          aria-label="Full screen graph"
          onClick={async () => {
            try {
              if (document.fullscreenElement) await document.exitFullscreen();
              else await root.current?.requestFullscreen();
            } catch {
              setError("Full screen is unavailable in this browser.");
            }
          }}
        >
          <Maximize size={17} />
        </button>
      </div>
      <ReactFlow
        key={reset}
        nodes={nodes}
        edges={edges}
        fitView
        minZoom={0.3}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        onNodeClick={(_, n) => {
          const e = report.evidence.find((e) => e.id === n.id);
          if (e) {
            setSelected(n.id);
            select(e);
          }
        }}
        colorMode="dark"
      >
        <Background color="#334155" gap={24} />
        <Controls showInteractive={false} />
      </ReactFlow>
      {error && <p role="status">{error}</p>}
      <div className="graph-caption">
        Select a source to inspect its evidence · Scroll to zoom · Drag to
        explore
      </div>
    </div>
  );
}
