import Block from "../components/Block";

export default function Home() {
  return (
    <main>
      <div className="relative w-full h-screen grid place-items-center px-6">
        <div className="max-w-screen-lg w-full mx-auto h-[40vw] lg:h-96 relative">
          <Block className="animate-[box1_6s_infinite_linear] group overflow-hidden" />
          <Block className="animate-[box2_6s_infinite_linear] group overflow-hidden" />
          <Block className="animate-[box3_6s_infinite_linear]" />
          <Block className="animate-[box4_6s_infinite_linear]" />
          <Block className="animate-[box5_6s_infinite_linear]" />
          <Block className="animate-[box6_6s_infinite_linear]" />
        </div>
      </div>
    </main>
  );
}
