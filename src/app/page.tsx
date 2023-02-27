import Image from "next/image";
import Link from "next/link";
import Block from "../components/Block";

export default function Home() {
  return (
    <main>
      <div className="relative w-full h-screen grid place-items-center px-6">
        <div className="max-w-screen-lg w-full mx-auto h-[40vw] lg:h-96 relative">
          <Block className="animate-[box1_6s_infinite_linear] hover:scale-105 transition-transform group overflow-hidden"></Block>
          <Block className="animate-[box2_6s_infinite_linear] hover:scale-105 transition-transform group overflow-hidden">
            <Link
              href="/"
              className="block absolute -inset-2 opacity-0 group-hover:opacity-80 transition-opacity"
            >
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src="https://res.cloudinary.com/casperleerink/image/upload/v1607865933/headshot.jpg"
                  alt="profile"
                  sizes="50vw"
                  fill
                  className="object-cover"
                />
              </div>
            </Link>
          </Block>
          <Block className="animate-[box3_6s_infinite_linear]" />
          <Block className="animate-[box4_6s_infinite_linear] hover:scale-105 transition-transform" />
          <Block className="animate-[box5_6s_infinite_linear] hover:scale-105 transition-transform" />
          <Block className="animate-[box6_6s_infinite_linear]" />
        </div>
      </div>
    </main>
  );
}
