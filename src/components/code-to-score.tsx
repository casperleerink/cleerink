"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { playNote, startAudio } from "./piano-synth";

/**
 * A code snippet whose words lift off the page and land in a piano roll,
 * then play back as a short piece in D minor. Every word is one note.
 */

const TEMPO = 90;
const SNIPPET = `const piece = compose({ key: "D minor", tempo: ${TEMPO} });

for (const bar of piece.bars) {
  for (const note of bar) {
    piano.play(note, { pedal: true });
  }
}

export default piece;`;

// [start beat, length in beats, midi pitch]. One note per word in SNIPPET.
const NOTES = (
  [
    [0, 4, 50], [1, 3, 57], [0, 1.5, 69], [1.5, 0.5, 67], [2, 1, 65], [3, 1, 64],
    [4, 4, 46], [5, 3, 53], [4, 1, 62], [5, 1, 65], [6, 1.5, 70], [7.5, 0.5, 69],
    [8, 4, 43], [9, 3, 50], [8, 1, 67], [9, 1, 70], [10, 1.5, 74], [11.5, 0.5, 72],
    [12, 4, 45], [13, 3, 52], [12, 2, 73], [14, 1, 76], [15, 1, 73],
    [16, 4, 50], [16, 4, 65], [16, 4, 74],
  ] satisfies [number, number, number][]
)
  .map(([start, length, pitch]) => ({ start, end: start + length, pitch }))
  .sort((a, b) => a.start - b.start || a.pitch - b.pitch);

const BEATS = 20;
const SECONDS_PER_BEAT = 60 / TEMPO;
const LOW = 41;
const HIGH = 78;
const BLACK_KEYS = new Set([1, 3, 6, 8, 10]);

type Kind = "keyword" | "call" | "string" | "number" | "name" | "punct";
type Token = { text: string; kind: Kind; line: number; col: number };
type Rect = { x: number; y: number; w: number; h: number };

const COLORS: Record<Kind, string> = {
  keyword: "#5BA8BF",
  call: "#F0E7B5",
  string: "#D9B96C",
  number: "#E59F71",
  name: "#CCCCCC",
  punct: "#BDBDBD",
};
const KEYWORDS = new Set(["const", "for", "of", "export", "default", "true"]);

function tokenize(source: string) {
  const tokens: Token[] = [];
  source.split("\n").forEach((text, line) => {
    const pattern = /"[^"]*"|\d+|[A-Za-z_]\w*|\S/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text))) {
      const word = match[0];
      const col = match.index;
      const kind: Kind = KEYWORDS.has(word)
        ? "keyword"
        : word.startsWith('"')
        ? "string"
        : /^\d/.test(word)
        ? "number"
        : !/^\w/.test(word)
        ? "punct"
        : text[col + word.length] === "("
        ? "call"
        : "name";
      tokens.push({ text: word, kind, line, col });
    }
  });
  return tokens;
}

const TOKENS = tokenize(SNIPPET);
const WORDS = TOKENS.filter((t) => t.kind !== "punct");
const PUNCT = TOKENS.filter((t) => t.kind === "punct");
const LINES = SNIPPET.split("\n");
const MAX_COLS = Math.max(...LINES.map((l) => l.length));

// Timeline of one loop, in seconds.
const HOLD_CODE = 3;
const MORPH = 2.6;
const PLAY = (BEATS + 2) * SECONDS_PER_BEAT;
const CYCLE = HOLD_CODE + MORPH + PLAY + MORPH;
const ROLL_ONLY = HOLD_CODE + MORPH + PLAY;

/** morph: 0 is code, 1 is piano roll. beat is set while the piece plays. */
function phaseAt(t: number): { morph: number; beat: number | null } {
  if (t < HOLD_CODE) return { morph: 0, beat: null };
  t -= HOLD_CODE;
  if (t < MORPH) return { morph: t / MORPH, beat: null };
  t -= MORPH;
  if (t < PLAY) return { morph: 1, beat: t / SECONDS_PER_BEAT };
  t -= PLAY;
  return { morph: 1 - t / MORPH, beat: null };
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Each word leaves a little later than the one before it. */
const STAGGER = 0.7;
const wordMorph = (morph: number, i: number) =>
  ease(clamp(morph * (1 + STAGGER) - (STAGGER * i) / WORDS.length));

function layout(width: number, height: number) {
  const gutter = Math.max(28, width * 0.06);
  const pad = Math.max(12, width * 0.025);
  const left = gutter + pad;
  const contentW = width - left - pad;

  const fontSize = Math.min((height / (LINES.length + 1.5)) * 0.62, contentW / (MAX_COLS * 0.6));
  const lineH = fontSize * 1.6;
  const top = (height - LINES.length * lineH) / 2;
  const charW = fontSize * 0.6;
  const codeRect = (t: Token): Rect => ({
    x: left + t.col * charW,
    y: top + t.line * lineH + (lineH - fontSize * 1.3) / 2,
    w: t.text.length * charW,
    h: fontSize * 1.3,
  });

  const rowH = (height - pad) / (HIGH - LOW + 1);
  const rowY = (pitch: number) => pad / 2 + (HIGH - pitch) * rowH;
  const beatX = (beat: number) => left + (beat / BEATS) * contentW;

  return {
    width,
    height,
    gutter,
    fontSize,
    lineH,
    top,
    rowH,
    rowY,
    beatX,
    codeRect,
    words: WORDS.map((token, i) => {
      const note = NOTES[i];
      return {
        token,
        note,
        code: codeRect(token),
        roll: {
          x: beatX(note.start) + 1,
          y: rowY(note.pitch) + 1,
          w: beatX(note.end) - beatX(note.start) - 2,
          h: rowH - 2,
        },
      };
    }),
  };
}

type Layout = ReturnType<typeof layout>;

function draw(ctx: CanvasRenderingContext2D, l: Layout, t: number) {
  const { morph, beat } = phaseAt(t);
  const roll = ease(clamp(morph));
  ctx.clearRect(0, 0, l.width, l.height);
  ctx.textBaseline = "middle";
  ctx.font = `${l.fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;

  const active = new Set<number>();
  if (beat !== null) {
    for (const n of NOTES) if (beat >= n.start && beat < n.end) active.add(n.pitch);
  }

  // Piano roll grid and keys in the gutter.
  for (let pitch = LOW; pitch <= HIGH; pitch++) {
    const y = l.rowY(pitch);
    const black = BLACK_KEYS.has(pitch % 12);
    if (black) {
      ctx.fillStyle = `rgba(255,255,255,${0.025 * roll})`;
      ctx.fillRect(l.gutter, y, l.width - l.gutter, l.rowH);
    }
    // White keys run under the black ones, like on a real keyboard.
    const lit = active.has(pitch) ? "#F0E7B5" : null;
    ctx.globalAlpha = roll;
    ctx.fillStyle = black ? "#BDBDBD" : lit ?? "#BDBDBD";
    ctx.fillRect(0, y, l.gutter - 4, l.rowH);
    ctx.fillStyle = "#1E1E1E";
    if (black) ctx.fillRect(0, y + l.rowH / 2 - 0.5, l.gutter - 4, 1);
    else if (!BLACK_KEYS.has((pitch + 1) % 12)) ctx.fillRect(0, y, l.gutter - 4, 1);
    if (black) {
      ctx.fillStyle = lit ?? "#1E1E1E";
      ctx.fillRect(0, y - 0.5, l.gutter * 0.6, l.rowH + 1);
    }
    ctx.globalAlpha = 1;
  }
  for (let bar = 0; bar <= BEATS; bar += 4) {
    ctx.fillStyle = `rgba(255,255,255,${0.07 * roll})`;
    ctx.fillRect(l.beatX(bar), 0, 1, l.height);
  }

  // Line numbers fade out as the keys fade in.
  ctx.textAlign = "right";
  ctx.fillStyle = `rgba(189,189,189,${0.35 * (1 - roll)})`;
  LINES.forEach((_, i) => {
    ctx.fillText(String(i + 1), l.gutter - 4, l.top + (i + 0.5) * l.lineH);
  });
  ctx.textAlign = "left";

  // Punctuation has no note, so it just fades.
  ctx.globalAlpha = 1 - clamp(morph * 3);
  for (const token of PUNCT) {
    const r = l.codeRect(token);
    ctx.fillStyle = COLORS.punct;
    ctx.fillText(token.text, r.x, r.y + r.h / 2);
  }

  l.words.forEach(({ token, note, code, roll: target }, i) => {
    const m = wordMorph(morph, i);
    const arc = Math.sin(Math.PI * m) * l.height * 0.08 * (i % 2 ? 1 : -1);
    const x = mix(code.x, target.x, m);
    const y = mix(code.y, target.y, m) + arc;
    const w = mix(code.w, target.w, m);
    const h = mix(code.h, target.h, m);
    const color = COLORS[token.kind];
    const playing = beat !== null && beat >= note.start && beat < note.end;
    const played = beat !== null && beat >= note.end;

    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = playing ? 18 : 0;
    ctx.globalAlpha = playing ? 1 : mix(0.12, played ? 0.85 : 0.6, m);
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, Math.min(h / 2, 3));
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.globalAlpha = 1 - clamp(m * 2.5);
    ctx.fillText(token.text, x, y + h / 2);

    // A ring spreads from each note as it starts.
    const since = beat === null ? -1 : (beat - note.start) * SECONDS_PER_BEAT;
    if (since >= 0 && since < 1.2) {
      ctx.globalAlpha = 0.5 * (1 - since / 1.2);
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(x, y + h / 2, 3 + since * l.height * 0.12, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });

  if (beat !== null && beat <= BEATS) {
    const x = l.beatX(beat);
    ctx.fillStyle = "rgba(240,231,181,0.7)";
    ctx.fillRect(x, 0, 1.5, l.height);
  }
}

export function CodeToScore({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const soundRef = useRef(false);
  const [sound, setSound] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let l = layout(1, 1);
    let time = reduced ? ROLL_ONLY - 0.01 : 0;
    let lastBeat = -1;
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
      const { beat } = phaseAt(time);
      if (beat === null) {
        lastBeat = -1;
      } else {
        if (soundRef.current) {
          for (const n of NOTES) {
            if (n.start > lastBeat && n.start <= beat) {
              playNote(n.pitch, (n.end - n.start) * SECONDS_PER_BEAT, n.pitch < 60 ? 0.35 : 0.6);
            }
          }
        }
        lastBeat = beat;
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
        aria-label="Lines of code whose words turn into notes on a piano roll and play as a short piano piece"
        className="absolute inset-0 w-full h-full"
      />
      <button
        type="button"
        onClick={() => {
          if (!sound) startAudio();
          soundRef.current = !sound;
          setSound(!sound);
        }}
        className="absolute bottom-0 right-0 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-100 transition-colors"
      >
        {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
        {sound ? "Sound on" : "Sound off"}
      </button>
    </div>
  );
}
