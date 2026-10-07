"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { playNote, startAudio } from "./piano-synth";

/**
 * A code snippet whose words slide into place as notes, then play back as a
 * short piece in D minor. Every word is one note.
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
const LOW = Math.min(...NOTES.map((n) => n.pitch));
const HIGH = Math.max(...NOTES.map((n) => n.pitch));

const GRAY = "#BDBDBD";
const BEIGE = "#F0E7B5";

type Token = { text: string; line: number; col: number };

function tokenize(source: string) {
  const tokens: Token[] = [];
  source.split("\n").forEach((text, line) => {
    const pattern = /"[^"]*"|\w+|\S/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text))) {
      tokens.push({ text: match[0], line, col: match.index });
    }
  });
  return tokens;
}

const TOKENS = tokenize(SNIPPET);
const isWord = (t: Token) => /^["\w]/.test(t.text);
const WORDS = TOKENS.filter(isWord);
const PUNCT = TOKENS.filter((t) => !isWord(t));
const LINES = SNIPPET.split("\n");
const MAX_COLS = Math.max(...LINES.map((l) => l.length));

// Timeline of one loop, in seconds.
const HOLD_CODE = 3;
const MORPH = 2.6;
const PLAY = (BEATS + 2) * SECONDS_PER_BEAT;
const CYCLE = HOLD_CODE + MORPH + PLAY + MORPH;
const ROLL_ONLY = HOLD_CODE + MORPH + PLAY;

/** morph: 0 is code, 1 is notes. beat is set while the piece plays. */
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
  const fontSize = Math.min((height / (LINES.length + 1.5)) * 0.55, width / (MAX_COLS * 0.6));
  const charW = fontSize * 0.6;
  const lineH = fontSize * 1.6;
  const top = (height - LINES.length * lineH) / 2;
  const codeAt = (t: Token) => ({
    x: t.col * charW,
    y: top + (t.line + 0.5) * lineH,
    w: t.text.length * charW,
  });

  const pad = height * 0.1;
  const rowH = (height - 2 * pad) / (HIGH - LOW);
  const beatX = (beat: number) => (beat / BEATS) * width;

  return {
    width,
    height,
    fontSize,
    beatX,
    codeAt,
    words: WORDS.map((token, i) => {
      const note = NOTES[i];
      return {
        token,
        note,
        code: codeAt(token),
        roll: {
          x: beatX(note.start) + 2,
          y: pad + (HIGH - note.pitch) * rowH,
          w: beatX(note.end) - beatX(note.start) - 4,
        },
      };
    }),
  };
}

type Layout = ReturnType<typeof layout>;

function draw(ctx: CanvasRenderingContext2D, l: Layout, t: number) {
  const { morph, beat } = phaseAt(t);
  ctx.clearRect(0, 0, l.width, l.height);
  ctx.textBaseline = "middle";
  ctx.font = `${l.fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.lineCap = "round";
  ctx.lineWidth = 2;

  // Punctuation has no note, so it just fades.
  ctx.fillStyle = GRAY;
  ctx.globalAlpha = 0.35 * (1 - clamp(morph * 3));
  for (const token of PUNCT) {
    const p = l.codeAt(token);
    ctx.fillText(token.text, p.x, p.y);
  }

  l.words.forEach(({ token, note, code, roll }, i) => {
    const m = wordMorph(morph, i);
    const x = mix(code.x, roll.x, m);
    const y = mix(code.y, roll.y, m);
    const w = mix(code.w, roll.w, m);
    const playing = beat !== null && beat >= note.start && beat < note.end;
    const played = beat !== null && beat >= note.end;

    ctx.fillStyle = GRAY;
    ctx.globalAlpha = 0.7 * (1 - clamp(m * 2.5));
    ctx.fillText(token.text, x, y);

    ctx.strokeStyle = playing ? BEIGE : GRAY;
    ctx.globalAlpha = playing ? 1 : clamp(m * 2 - 1) * (played ? 0.5 : 0.25);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.stroke();
  });

  if (beat !== null && beat <= BEATS) {
    const x = l.beatX(beat);
    ctx.fillStyle = BEIGE;
    ctx.globalAlpha = 0.25;
    ctx.fillRect(x, 0, 1, l.height);
  }
  ctx.globalAlpha = 1;
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
        aria-label="Lines of code whose words turn into notes and play as a short piano piece"
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
