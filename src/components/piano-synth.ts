let audio: { ctx: AudioContext; out: GainNode } | null = null;

function setup() {
  const ctx = new AudioContext();
  const out = ctx.createGain();
  out.gain.value = 0.3;
  const reverb = ctx.createConvolver();
  reverb.buffer = impulse(ctx, 2.5);
  const wet = ctx.createGain();
  wet.gain.value = 0.4;
  out.connect(ctx.destination);
  out.connect(reverb).connect(wet).connect(ctx.destination);
  return { ctx, out };
}

/** Decaying noise, a cheap room reverb. */
function impulse(ctx: AudioContext, seconds: number) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
    }
  }
  return buffer;
}

/** Must run inside a click handler, browsers block audio before a gesture. */
export function startAudio() {
  audio ??= setup();
  void audio.ctx.resume();
}

export function playNote(midi: number, seconds: number, velocity: number) {
  if (!audio) return;
  const { ctx, out } = audio;
  const t = ctx.currentTime;
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  const end = t + seconds + 1.5;

  const env = ctx.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(velocity, t + 0.004);
  env.gain.exponentialRampToValueAtTime(velocity * 0.35, t + 0.25);
  env.gain.exponentialRampToValueAtTime(0.0001, end);

  // A piano gets darker as the note rings out.
  const filter = ctx.createBiquadFilter();
  filter.frequency.setValueAtTime(Math.min(9000, freq * 10), t);
  filter.frequency.exponentialRampToValueAtTime(freq * 2, t + 1);
  env.connect(filter).connect(out);

  const partials: [OscillatorType, number, number][] = [
    ["triangle", 1, 1],
    ["sine", 2, 0.35],
    ["sine", 3, 0.12],
  ];
  for (const [type, ratio, gain] of partials) {
    const osc = ctx.createOscillator();
    const level = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq * ratio;
    level.gain.value = gain;
    osc.connect(level).connect(env);
    osc.start(t);
    osc.stop(end);
  }
}
