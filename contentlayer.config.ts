// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer/source-files";
import rehypePrettyCode from "rehype-pretty-code";

export const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `**/*.md`,
  fields: {
    title: { type: "string", required: true },
    date: { type: "date", required: true },
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (post) => `/blog/${post._raw.flattenedPath}`,
    },
  },
}));

export default makeSource({
  contentDirPath: "posts",
  documentTypes: [Post],
  markdown: {
    rehypePlugins: [
      [
        // Build-time syntax highlighting via Shiki
        rehypePrettyCode as unknown as any,
        {
          // Use a readable dark theme; you can change this to any Shiki theme name
          theme: "github-dark-dimmed",
          keepBackground: false,
          onVisitLine(node: any) {
            // Prevent collapsing of empty lines
            if (node.children.length === 0) {
              node.children = [{ type: "text", value: " " }];
            }
          },
          onVisitHighlightedLine(node: any) {
            node.properties.className = [
              ...(node.properties.className || []),
              "highlighted-line",
            ];
          },
          onVisitHighlightedWord(node: any) {
            node.properties.className = [
              ...(node.properties.className || []),
              "highlighted-word",
            ];
          },
        } as unknown as any,
      ],
    ],
  },
});
