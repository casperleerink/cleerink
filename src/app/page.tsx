import Block from "../components/Block";
import { compareDesc } from "date-fns";
import { allPosts } from "contentlayer/generated";
import { PostCard } from "@/components/post-card";

export default function Home() {
  const posts = allPosts.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );

  return (
    <main className="px-12 py-44">
      <div className="mx-auto max-w-screen-sm flex flex-col gap-8">
        <h1 className="font-medium text-2xl">
          Hi there! Welcome to my website!
        </h1>

        <p className="text-gray-500">
          My name is Casper Leerink, I am a Full-Stack Developer and musician. I
          currently work at{" "}
          <a
            href="https://hoooman.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-gray-500/10 text-gray-100 rounded hover:text-gray-500 transition-colors px-1"
          >
            Hoooman Studio
          </a>{" "}
          as a Full-Stack Developer where I lead the development team that works
          on various web applications and websites for multiple clients. Check
          out their{" "}
          <a
            href="https://hoooman.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            site
          </a>{" "}
          if you want to learn more.
        </p>

        <div className="max-w-screen-lg mx-auto w-full aspect-[6/2] relative overflow-hidden">
          <Block className="animate-[box1_6s_infinite_linear] group overflow-hidden" />
          <Block className="animate-[box2_6s_infinite_linear] group overflow-hidden" />
          <Block className="animate-[box3_6s_infinite_linear]" />
          <Block className="animate-[box4_6s_infinite_linear]" />
          <Block className="animate-[box5_6s_infinite_linear]" />
          <Block className="animate-[box6_6s_infinite_linear]" />
        </div>
        <p className="text-gray-500">
          I have the most experience writing Typescript on both frontend and
          backend with frameworks such as{" "}
          <a
            href="https://nextjs.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-gray-500/10 text-gray-100 rounded hover:text-gray-500 transition-colors px-1"
          >
            Next.js
          </a>
          ,{" "}
          <a
            href="https://svelte.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-gray-500/10 text-gray-100 rounded hover:text-gray-500 transition-colors px-1"
          >
            Svelte
          </a>{" "}
          and am in the process of learning Go and Rust.
        </p>
        <h2 className="text-gray-500 text-lg font-medium">Writings</h2>
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post.url} {...post} />
          ))}
        </div>
      </div>
    </main>
  );
}
