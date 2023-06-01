"use client";
import { useState, WheelEvent } from "react";
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
  const [gravity, setGravity] = useState(1);
  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    setGravity(e.deltaY * -0.1 - 0.1);
  };
  return (
    <MatterContainer
      engineOptions={{
        gravity: {
          x: 0,
          y: gravity,
        },
      }}
      onWheel={handleWheel}
      className="relative w-full h-[calc(100vh-3rem)] overflow-hidden overscroll-contain"
    >
      <MatterChildren />
      <Bounds />
      <MatterRender />
    </MatterContainer>
  );
}
