import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";
import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
export function TiltCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const rx = useSpring(x, { stiffness: 180, damping: 25 }),
    ry = useSpring(y, { stiffness: 180, damping: 25 });
  return (
    <motion.div
      className={"tilt " + className}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((-(e.clientY - r.top - r.height / 2) / r.height) * 6);
        y.set(((e.clientX - r.left - r.width / 2) / r.width) * 6);
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="overlay" />
        <Dialog.Content className="sheet">
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description className="muted">
            Trace the claim to its source and understand its limitations.
          </Dialog.Description>
          <Dialog.Close
            className="icon-button close"
            aria-label="Close inspector"
          >
            <X size={20} />
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function Constellation() {
  return (
    <div className="constellation" aria-label="Illustrative evidence network">
      <svg viewBox="0 0 600 480" aria-hidden="true">
        <defs>
          <radialGradient id="halo">
            <stop stopColor="#8b5cf6" stopOpacity=".25" />
            <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="300" cy="240" r="230" fill="url(#halo)" />
        {[90, 160, 220].map((r) => (
          <circle
            key={r}
            cx="300"
            cy="240"
            r={r}
            fill="none"
            stroke="#8991be"
            strokeOpacity=".12"
            strokeDasharray={r === 160 ? "3 7" : undefined}
          />
        ))}
        {[
          [105, 125],
          [440, 80],
          [495, 260],
          [395, 390],
          [155, 370],
          [70, 245],
        ].map(([x, y], i) => (
          <g key={i}>
            <path
              d={`M300 240 Q${x} 240 ${x} ${y}`}
              fill="none"
              stroke={i % 2 ? "#22d3ee" : "#8b5cf6"}
              strokeOpacity=".55"
            />
            <circle cx={x} cy={y} r="5" fill={i % 2 ? "#22d3ee" : "#a78bfa"} />
          </g>
        ))}
        <circle cx="300" cy="240" r="44" fill="#191c37" stroke="#a78bfa" />
        <path
          d="M283 240l12 12 23-28"
          fill="none"
          stroke="#c4b5fd"
          strokeWidth="3"
        />
      </svg>
      <span className="orbit-label l1">↗ SOURCE DISCOVERED</span>
      <span className="orbit-label l2">✓ Supporting evidence</span>
      <span className="orbit-label l3">≠ Contradiction detected</span>
      <span className="orbit-label l4">CLAIM · 003</span>
      <span className="core-label">FOLLOW THE EVIDENCE</span>
      <span className="visual-caption">ILLUSTRATIVE EVIDENCE NETWORK / 01</span>
    </div>
  );
}
