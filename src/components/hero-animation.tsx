"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { playNote, startAudio } from "./piano-synth";

/**
 * A piano improvisation on a piano roll. Its notes regroup into a small
 * system diagram, a signal runs through it, and they fall back into music.
 */

// From "sound-tools-piano-improv", take 3, 21.4s to 36.5s.
// [start, length in seconds, midi pitch, velocity]
const NOTES = (
  [
    [0.05, 0.31, 49, 77], [0.4, 0.5, 56, 52], [0.75, 0.74, 70, 70], [0.77, 1.03, 65, 69],
    [1.46, 8.57, 72, 86], [2.12, 2.45, 51, 79], [2.48, 2.21, 58, 68], [2.85, 1.72, 68, 86],
    [2.85, 0.87, 65, 52], [3.93, 2.2, 66, 61], [6.09, 0.59, 49, 63], [6.09, 0.44, 65, 62],
    [6.5, 1.77, 56, 52], [6.92, 1.27, 65, 50], [8.92, 0.39, 49, 100], [9.25, 1.59, 56, 64],
    [9.64, 1.09, 65, 63], [11.62, 0.36, 49, 72], [11.96, 1.47, 56, 72], [12.31, 0.76, 75, 93],
    [12.32, 1.08, 65, 72], [13.39, 3.21, 77, 98], [14.58, 1.57, 70, 93],
  ] satisfies [number, number, number, number][]
).map(([start, length, pitch, velocity]) => ({ start, end: start + length, pitch, velocity }));

const DURATION = Math.max(...NOTES.map((n) => n.end));
const LOW = Math.min(...NOTES.map((n) => n.pitch));
const HIGH = Math.max(...NOTES.map((n) => n.pitch));

// The system: one node per note, in layers that feed into each other.
const LAYERS = [2, 4, 6, 5, 4, 2];
const NODES = LAYERS.flatMap((size, layer) =>
  Array.from({ length: size }, (_, row) => ({ layer, row, size }))
);
const firstOf = (layer: number) => LAYERS.slice(0, layer).reduce((a, b) => a + b, 0);
/** Connect each node to the nearest nodes in the next layer, both ways. */
const EDGES = LAYERS.slice(0, -1).flatMap((size, layer) => {
  const next = LAYERS[layer + 1];
  const near = (row: number, from: number, to: number) =>
    Math.round((row * (to - 1)) / Math.max(from - 1, 1));
  const pairs = new Set<string>();
  for (let r = 0; r < size; r++) pairs.add(`${r}:${near(r, size, next)}`);
  for (let r = 0; r < next; r++) pairs.add(`${near(r, next, size)}:${r}`);
  return Array.from(pairs, (pair) => {
    const [a, b] = pair.split(":").map(Number);
    return [firstOf(layer) + a, firstOf(layer + 1) + b] as const;
  });
});

const GRAY = "#BDBDBD";
const BEIGE = "#F0E7B5";

// Timeline of one loop, in seconds. It starts with the music playing.
const PLAY = DURATION + 1;
const MORPH = 2.6;
const HOLD_SYSTEM = 3.5;
const CYCLE = PLAY + MORPH + HOLD_SYSTEM + MORPH;

/**
 * morph: 1 is the piano roll, 0 is the system.
 * at: seconds into the music while it plays. pulse: 0 to 1 while the system runs.
 */
function phaseAt(t: number): { morph: number; at: number | null; pulse: number | null } {
  if (t < PLAY) return { morph: 1, at: t, pulse: null };
  t -= PLAY;
  if (t < MORPH) return { morph: 1 - t / MORPH, at: null, pulse: null };
  t -= MORPH;
  if (t < HOLD_SYSTEM) return { morph: 0, at: null, pulse: t / HOLD_SYSTEM };
  t -= HOLD_SYSTEM;
  return { morph: t / MORPH, at: null, pulse: null };
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Each note moves a little later than the one before it. */
const STAGGER = 0.7;
const noteMorph = (morph: number, i: number) =>
  ease(clamp(morph * (1 + STAGGER) - (STAGGER * i) / NOTES.length));

function layout(width: number, height: number) {
  const pad = height * 0.1;
  const rowH = (height - 2 * pad) / (HIGH - LOW);
  const timeX = (seconds: number) => (seconds / DURATION) * width;

  const gapY = (height - 2 * pad) / Math.max(...LAYERS);
  const nodeW = Math.min(width * 0.05, 44);
  const nodeH = Math.min(gapY * 0.4, 8);
  const left = width * 0.1;
  const colW = (width * 0.8 - nodeW) / (LAYERS.length - 1);

  return {
    width,
    height,
    timeX,
    nodeH,
    notes: NOTES.map((note, i) => {
      const node = NODES[i];
      return {
        note,
        layer: node.layer,
        roll: {
          x: timeX(note.start) + 2,
          y: pad + (HIGH - note.pitch) * rowH,
          w: Math.max(timeX(note.end) - timeX(note.start) - 4, 2),
        },
        node: {
          x: left + node.layer * colW,
          y: height / 2 + (node.row - (node.size - 1) / 2) * gapY,
          w: nodeW,
        },
      };
    }),
  };
}

type Layout = ReturnType<typeof layout>;

function bar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.beginPath();
  ctx.roundRect(x, y - h / 2, Math.max(w, h), h, h / 2);
  ctx.fill();
}

function draw(ctx: CanvasRenderingContext2D, l: Layout, t: number) {
  const { morph, at, pulse } = phaseAt(t);
  ctx.clearRect(0, 0, l.width, l.height);

  // Connections only show once the notes have settled into nodes.
  ctx.strokeStyle = GRAY;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.15 * clamp(1 - morph * 2.5);
  for (const [from, to] of EDGES) {
    const a = l.notes[from].node;
    const b = l.notes[to].node;
    const mid = (a.x + a.w + b.x) / 2;
    ctx.beginPath();
    ctx.moveTo(a.x + a.w, a.y);
    ctx.bezierCurveTo(mid, a.y, mid, b.y, b.x, b.y);
    ctx.stroke();
  }

  // A signal passes through the system layer by layer.
  const signalAt = pulse === null ? null : pulse * (LAYERS.length + 1) - 1;

  l.notes.forEach(({ note, layer, roll, node }, i) => {
    const m = noteMorph(morph, i);
    const playing = at !== null && at >= note.start && at < note.end;
    const played = at !== null && at >= note.end;
    const signal = signalAt !== null && Math.abs(signalAt - layer) < 0.5;

    ctx.fillStyle = playing || signal ? BEIGE : GRAY;
    ctx.globalAlpha = playing || signal ? 1 : mix(0.35, played ? 0.5 : 0.25, m);
    bar(
      ctx,
      mix(node.x, roll.x, m),
      mix(node.y, roll.y, m),
      mix(node.w, roll.w, m),
      mix(l.nodeH, 2, m)
    );
  });

  if (at !== null && at <= DURATION) {
    ctx.fillStyle = BEIGE;
    ctx.globalAlpha = 0.25;
    ctx.fillRect(l.timeX(at), 0, 1, l.height);
  }
  ctx.globalAlpha = 1;
}

export function HeroAnimation({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const soundRef = useRef(false);
  const [sound, setSound] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let l = layout(1, 1);
    let time = reduced ? PLAY - 0.01 : 0;
    let lastAt = -1;
    let visible = true;
    let last = performance.now();
    let frame = 0;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      l = layout(width, height);
      draw(ctx, l, time);
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      // Cap the step so a hidden tab or offscreen canvas resumes where it was.
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      if (!visible) return;
      time = (time + dt) % CYCLE;
      const { at } = phaseAt(time);
      if (at === null) {
        lastAt = -1;
      } else {
        if (soundRef.current) {
          for (const n of NOTES) {
            if (n.start > lastAt && n.start <= at) {
              playNote(n.pitch, n.end - n.start, (n.velocity / 127) * 0.7);
            }
          }
        }
        lastAt = at;
      }
      draw(ctx, l, time);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    intersectionObserver.observe(canvas);
    if (!reduced) frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="A piano improvisation on a piano roll whose notes regroup into a system diagram"
        className="absolute inset-0 w-full h-full"
      />
      <button
        type="button"
        aria-label={sound ? "Turn sound off" : "Turn sound on"}
        onClick={() => {
          if (!sound) startAudio();
          soundRef.current = !sound;
          setSound(!sound);
        }}
        className="absolute bottom-0 right-0 text-gray-500/50 hover:text-gray-100 transition-colors"
      >
        {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>
    </div>
  );
}
