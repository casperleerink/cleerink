"use client";
import { Scroll } from "lucide-react";
import { useState } from "react";
import { Rectangle, useContainerSize, useEngine, Circle } from "react-matters";
import { allSlides, useSlides } from "./slides";
interface Props {}

const MatterChildren: React.FC<Props> = ({}) => {
  const slides = useSlides((state) => state.slides);
  const { addSlide, done } = useSlides();
  const [width, height] = useContainerSize();
  const engine = useEngine();

  if (!width || !height) return null;
  return (
    <>
      <div
        className="absolute inset-0"
        onWheel={(ev) => {
          if (!engine) return null;
        }}
      />
      {slides.map((slide) => (
        <Rectangle
          key={slide.id}
          initialPosition={{
            x: slide.initialPosition.x * width,
            y: slide.initialPosition.y * height,
          }}
          className="select-none pointer-events-none"
          draggable
        >
          {slide.content}
        </Rectangle>
      ))}
      <Circle
        initialPosition={{
          x: 0.5 * width,
          y: 0.5 * height,
        }}
        draggable
        className={`w-24 h-24 bg-beige text-gray-900 ${
          done ? "cursor-default opacity-50" : "cursor-pointer opacity-100"
        }`}
      >
        <div
          onClick={() => {
            addSlide({
              width,
              height,
            });
          }}
          className={`absolute inset-0 grid place-items-center hover:scale-105 transition-transform`}
        >
          <h1 className="text-xl font-bold">
            {done ? "Finished" : "Continue"}
          </h1>
        </div>
      </Circle>
    </>
  );
};

export default MatterChildren;
