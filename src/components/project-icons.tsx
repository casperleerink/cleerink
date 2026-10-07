import type { ReactNode } from "react";

const Icon = ({ children }: { children: ReactNode }) => (
  <svg
    viewBox="0 0 40 40"
    width={40}
    height={40}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    aria-hidden
  >
    {children}
  </svg>
);

/** Clips on tracks with a playhead running through them. */
export const SoundToolsIcon = () => (
  <Icon>
    <rect x="4" y="9" width="13" height="5" rx="2" />
    <rect x="20" y="9" width="16" height="5" rx="2" />
    <rect x="9" y="18" width="19" height="5" rx="2" />
    <rect x="4" y="27" width="8" height="5" rx="2" />
    <rect x="15" y="27" width="13" height="5" rx="2" />
    <path d="M24 4v32" strokeOpacity={0.5} />
  </Icon>
);

/** A spectrum held still, each bin capped at its frozen level. */
export const SpectralFreezeIcon = () => (
  <Icon>
    {[30, 18, 10, 16, 24, 14, 20, 27].map((top, i) => {
      const x = 7 + i * 3.7;
      return (
        <g key={x}>
          <path d={`M${x} 34V${top + 3}`} strokeOpacity={0.5} />
          <path d={`M${x - 1.2} ${top}h2.4`} />
        </g>
      );
    })}
  </Icon>
);

/** Players as points on one shared loop. */
export const CircularMusicIcon = () => (
  <Icon>
    <circle cx="20" cy="20" r="13" strokeOpacity={0.5} />
    <circle cx="20" cy="7" r="2.5" fill="currentColor" />
    <circle cx="31.3" cy="26.5" r="2.5" fill="currentColor" />
    <circle cx="8.7" cy="26.5" r="2.5" fill="currentColor" />
    <path d="M20 20l7-9" />
  </Icon>
);

/** A waveform inside a browser window. */
export const BrowserDawIcon = () => (
  <Icon>
    <rect x="4" y="7" width="32" height="26" rx="3" strokeOpacity={0.5} />
    <path d="M4 13h32" strokeOpacity={0.5} />
    <path d="M9 23h3l2-5 3 10 3-12 3 9 2-4 2 2h4" />
  </Icon>
);

/** Task columns on a board. */
export const HoomanDashboardIcon = () => (
  <Icon>
    <rect x="4" y="6" width="9" height="8" rx="2" />
    <rect x="4" y="17" width="9" height="8" rx="2" />
    <rect x="4" y="28" width="9" height="6" rx="2" strokeOpacity={0.5} />
    <rect x="16" y="6" width="9" height="12" rx="2" />
    <rect x="16" y="21" width="9" height="6" rx="2" strokeOpacity={0.5} />
    <rect x="28" y="6" width="8" height="6" rx="2" />
  </Icon>
);
