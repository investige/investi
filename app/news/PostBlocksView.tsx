import type { PostBlock } from "./types";

export default function PostBlocksView({
  body,
  blocks,
}: {
  body: string;
  blocks: PostBlock[] | null;
}) {
  if (!blocks || blocks.length === 0) {
    return <p className="whitespace-pre-wrap text-purple-100">{body}</p>;
  }

  return (
    <div className="space-y-4">
      {blocks.map((block, index) =>
        block.type === "text" ? (
          <p key={index} className="whitespace-pre-wrap text-purple-100">
            {block.text}
          </p>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={index}
            src={block.url}
            alt=""
            className="w-full rounded-lg"
          />
        )
      )}
    </div>
  );
}
