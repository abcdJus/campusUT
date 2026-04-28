import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, ThumbsUp } from "lucide-react";
import { seedPosts } from "@campustalk/shared";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/format";

export function generateStaticParams() {
  return seedPosts.map((post) => ({ id: post.id }));
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await api.getPost(id);
  if (!post) notFound();

  return (
    <main className="page-shell narrow">
      <article className="post-detail">
        <Link href={`/boards/${post.board}`} className="back-link">
          Back to board
        </Link>
        <h1>{post.title}</h1>
        <div className="meta-line">
          <span>{post.anonymous ? "Anonymous" : post.author?.name ?? "Member"}</span>
          <span>{timeAgo(post.createdAt)}</span>
        </div>
        <p>{post.content}</p>
        <div className="post-counters inline">
          <span>
            <ThumbsUp size={15} />
            {post.likes}
          </span>
          <span>
            <MessageCircle size={15} />
            {post.comments}
          </span>
        </div>
      </article>
    </main>
  );
}
