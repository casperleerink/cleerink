"use client";

import { Bounds, MatterContainer } from "react-matters";
import MatterChildren from "./MatterChildren";
import dynamic from "next/dynamic";

const MatterRender = dynamic(
  async () => (await import("react-matters")).Render,
  {
    ssr: false,
  }
);

export default function About() {
  return (
    <MatterContainer
      engineOptions={{
        gravity: {
          x: 0,
          y: 5,
        },
      }}
      className="relative w-full h-[calc(100vh-3rem)] overflow-hidden overscroll-contain"
    >
      <MatterChildren />
      <Bounds />
      <MatterRender />
    </MatterContainer>
  );
}
