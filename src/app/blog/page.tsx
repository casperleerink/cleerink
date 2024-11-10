import { PostCard } from "@/components/post-card";
import { allPosts, Post } from "contentlayer/generated";
import { compareDesc } from "date-fns";
const Page = () => {
  const posts = allPosts.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );
  return (
    <main className="px-12 py-44">
      <div className="mx-auto max-w-screen-sm flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post.url} {...post} />
          ))}
        </div>
      </div>
    </main>
  );
};

export default Page;
