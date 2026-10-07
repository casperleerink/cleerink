import { compareDesc } from "date-fns";
import { allPosts } from "contentlayer/generated";
import { PostCard } from "@/components/post-card";
import { WorkItem } from "@/components/work-item";
import { CodeToScore } from "@/components/code-to-score";
import { projects } from "./projects";
import Link from "next/link";

export default function Home() {
  const posts = allPosts.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );

  return (
    <main className="px-12 py-44">
      <div className="mx-auto max-w-screen-lg flex flex-col gap-12">
        <section className="flex flex-col gap-6">
          <h1 className="font-semibold text-3xl md:text-4xl leading-tight">
            Product‑minded full‑stack engineer with a music background
          </h1>
          <p className="text-gray-500 max-w-2xl">
            I’m originally from the Netherlands, where I studied piano
            performance and music composition before moving to Canada. My
            background in music taught me how to work with structure, detail,
            and creative problem-solving — skills that now shape how I approach
            software development.
          </p>
          <p className="text-gray-500 max-w-2xl">
            Curiosity pulled me toward programming, and I taught myself the full
            stack from the ground up. That self-directed path gave me both
            technical versatility and the habit of breaking complex challenges
            into simple, elegant solutions. Today, I combine my engineering
            expertise with a design-oriented mindset to build scalable
            applications that feel effortless to use.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#featured"
              className="px-4 scroll-smooth py-2 rounded-md bg-beige text-gray-900 font-medium border border-beige/20 hover:opacity-90 transition"
            >
              View Work
            </a>
            <a
              href="https://github.com/casperleerink"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-md border border-gray-500/20 hover:border-gray-500/40 text-gray-100"
            >
              GitHub
            </a>
            <a
              href="mailto:casperleerink@gmail.com?subject=Hello%20from%20your%20website"
              className="text-gray-500 hover:text-gray-200 transition-colors"
            >
              Email me
            </a>
            <a
              href="https://www.linkedin.com/in/casper-leerink/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-200 transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </section>

        <CodeToScore className="w-full aspect-[3/2] sm:aspect-[3/1]" />

        <section id="featured" className="flex flex-col gap-4 scroll-mt-24">
          <div className="flex items-baseline justify-between">
            <h2 className="text-gray-100 text-xl font-semibold">
              Featured Work
            </h2>
            <Link
              href="/work"
              className="text-sm text-gray-500 hover:text-gray-200 transition-colors"
            >
              View all
            </Link>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 items-start gap-4 sm:gap-8">
            {projects
              .filter((p) => p.featured)
              .map((p) => (
                <WorkItem key={p.title} {...p} />
              ))}
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-gray-500 text-lg font-medium">Writings</h2>
            <Link
              href="/blog"
              className="text-sm text-gray-500 hover:text-gray-200 transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {posts.slice(0, 3).map((post) => (
              <PostCard key={post.url} {...post} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
