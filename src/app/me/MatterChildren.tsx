"use client";
import { Scroll } from "lucide-react";
import { useState } from "react";
import { Rectangle, useContainerSize, useEngine, Circle } from "react-matters";
import { allSlides, useSlides } from "./slides";
interface Props {}

const MatterChildren: React.FC<Props> = ({}) => {
  const slides = useSlides((state) => state.slides);
  const [currentIndex, setCurrentIndex] = useState(0);
  const addIndex = () => setCurrentIndex((old) => old + 1);
  const addSlide = useSlides((state) => state.addSlide);
  const [width, height] = useContainerSize();
  const engine = useEngine();

  if (!width || !height) return null;

  const done = currentIndex >= allSlides.length - 1;
  return (
    <>
      <div
        className="absolute inset-0"
        onWheel={(ev) => {
          if (!engine) return null;
          engine.gravity.y = ev.deltaY * 0.05 + 0.02;
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
              id: `${Math.random() * 100}`,
              content: (
                <div className="w-auto px-4 md:px-8 py-2 md:py-4 rounded-lg text-xs md:text-base border grid place-item-center bg-gradient-to-bl from-gray-800 to-black border-gray-800 text-gray-400">
                  {allSlides[currentIndex]}
                </div>
              ),
              initialPosition: {
                x: Math.random(),
                y: Math.random(),
              },
            });
            addIndex();
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
