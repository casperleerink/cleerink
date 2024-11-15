import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { create } from "zustand";

interface Slide {
  id: string;
  content: ReactNode | string;
  initialPosition: {
    x: number;
    y: number;
  };
}

interface Store {
  slides: Slide[];
  index: number;
  done: boolean;
  addSlide: ({ width, height }: { width?: number; height?: number }) => void;
}

export const useSlides = create<Store>((set, get) => ({
  slides: [],
  addSlide: ({ width, height }) => {
    set((state) => ({
      slides: [
        ...state.slides,
        {
          id: `${Math.random() * 100}`,
          content: allSlides[state.index],
          initialPosition: {
            x: Math.random() * (width ?? 100),
            y: Math.random() * (height ?? 100),
          },
        },
      ],
      index: state.index + 1,
      done: state.index >= allSlides.length - 1,
    }));
  },
  index: 0,
  done: false,
  reset: () =>
    set({
      slides: [],
    }),
}));

export const allSlides = [
  "Hi there!",
  "I am Casper Leerink",
  "A software developer",
  "born in the netherlands",
  "Currently living in Vancouver",
  "Canada",
  <div className="relative w-20 h-20" key="photo">
    <Image
      src="https://res.cloudinary.com/casperleerink/image/upload/v1607865933/headshot.jpg"
      alt="A photo of Casper Leerink"
      fill
      className="rounded object-cover"
    />
  </div>,
  "As a software engineer",
  "with a background in the arts",
  "I bring both technical expertise",
  "as well as creative and visual understanding",
  "to the project at hand",
  "I believe in user driven development",
  "and like to think not only about the code",
  "but also about",
  "the best way to architect a project",
  "so it will remain usable",
  "in the future",
  <Link href="/work" className="font-bold text-beige" key="work">
    View Work
  </Link>,
];
