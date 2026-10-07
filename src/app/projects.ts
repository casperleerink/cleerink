import {
  BrowserDawIcon,
  CircularMusicIcon,
  HoomanDashboardIcon,
  SoundToolsIcon,
  SpectralFreezeIcon,
} from "@/components/project-icons";
import type { WorkItemProps } from "@/components/work-item";

type Project = WorkItemProps & {
  group: keyof typeof groups;
  featured?: boolean;
};

export const groups = {
  audio: "Music & Audio",
  work: "Work",
  "open-source": "Open Source",
};

/** Featured projects show on the home page in this order. */
export const projects: Project[] = [
  {
    title: "Sound Tools",
    description:
      "A small DAW an AI agent can work in. A project is a folder of JSON files and every change plays live. Synth, sampler, effects and CLAP/VST3 plugins, written in Rust.",
    github: "https://github.com/casperleerink/sound-tools",
    icon: SoundToolsIcon,
    group: "audio",
    featured: true,
  },
  {
    title: "Spectral Freeze",
    description:
      "Spectral freeze instrument plugin (CLAP/VST3) with a per-bin magnitude filter. Rust port of my earlier JUCE version.",
    github: "https://github.com/casperleerink/spectral-freeze-rust",
    icon: SpectralFreezeIcon,
    group: "audio",
    featured: true,
  },
  {
    title: "Circular Music",
    description: "Multiplayer music experiment built with Elementary Audio",
    github: "https://github.com/casperleerink/circular-music",
    website: "https://circular-music-web.vercel.app",
    icon: CircularMusicIcon,
    group: "audio",
    featured: true,
  },
  {
    title: "Hooman Dashboard",
    description: "Client and project management app for Hooman Studio",
    github: "https://github.com/Hooman-studio",
    website: "https://hooman.com/dashboard",
    icon: HoomanDashboardIcon,
    group: "work",
    featured: true,
  },
  {
    title: "el-audio-daw",
    description:
      "Browser DAW with real-time collaboration, built on Elementary Audio (experimental)",
    github: "https://github.com/casperleerink/el-audio-daw",
    icon: BrowserDawIcon,
    group: "audio",
  },
  {
    title: "Before You Ship",
    description:
      "AI advisor with codebase access that turns feature requests and bug reports into dev-ready briefs",
    github: "https://github.com/casperleerink/before-you-ship",
    group: "open-source",
  },
  {
    title: "React Matters",
    description:
      "Render React components as matter.js bodies to animate them with the physics engine",
    github: "https://github.com/casperleerink/react-matters",
    group: "open-source",
  },
  {
    title: "Sanity Plugin Icons",
    description:
      "Sanity plugin for picking icons with improved UI and no default icon set loading",
    github: "https://github.com/casperleerink/sanity-plugin-icons",
    group: "open-source",
  },
];
