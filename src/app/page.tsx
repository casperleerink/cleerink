export default function Home() {
  return (
    <main className="relative w-full h-screen grid place-items-center">
      <div className="absolute bg-beige left-[38%] right-[38%] rounded-full aspect-square animate-[ping_2s_ease-out_alternate_infinite]"></div>
      <div className="flex flex-col items-center space-y-8">
        <h1 className="relative text-3xl md:text-5xl mix-blend-difference">
          Casper Leerink
        </h1>
        <p className="relative text-xl mix-blend-difference">Coming soon...</p>
      </div>
    </main>
  );
}
