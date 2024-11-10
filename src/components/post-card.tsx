import { Post } from "contentlayer/generated";
import { format, parseISO } from "date-fns";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const PostCard = (post: Post) => {
  return (
    <Link
      href={post.url}
      className="bg-gray-800 border border-gray-500/10 rounded-lg relative px-5 py-4 flex items-center justify-between"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-xl">{post.title}</h2>
        <time dateTime={post.date} className="block text-xs text-gray-500">
          {format(parseISO(post.date), "LLLL d, yyyy")}
        </time>
      </div>
      <ArrowRight />
    </Link>
  );
};
