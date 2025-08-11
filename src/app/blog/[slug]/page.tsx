import { format, parseISO } from "date-fns";
import { allPosts } from "contentlayer/generated";

export const generateStaticParams = async () =>
  allPosts.map((post) => ({ slug: post._raw.flattenedPath }));

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find((post) => post._raw.flattenedPath === params.slug);
  if (!post) throw new Error(`Post not found for slug: ${params.slug}`);
  return { title: post.title };
};

const PostLayout = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find((post) => post._raw.flattenedPath === params.slug);
  if (!post) throw new Error(`Post not found for slug: ${params.slug}`);

  return (
    <main className="px-12 py-44">
      <article className="mx-auto max-w-screen-md flex flex-col gap-16">
        <div className="flex flex-col gap-4">
          <time dateTime={post.date} className="mb-1 text-sm text-gray-600">
            {format(parseISO(post.date), "LLLL d, yyyy")}
          </time>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium">
            {post.title}
          </h1>
        </div>
        <div
          className="prose lg:prose-lg prose-invert"
          dangerouslySetInnerHTML={{ __html: post.body.html }}
        />
      </article>
    </main>
  );
};

export default PostLayout;
