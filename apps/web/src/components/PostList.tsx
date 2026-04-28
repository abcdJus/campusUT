import Link from "next/link";
import type { Post } from "@campustalk/shared";
import { MessageCircle, ThumbsUp } from "lucide-react";
import { timeAgo } from "@/lib/format";

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <div className="empty-state">No posts yet.</div>;
  }

  return (
    <div className="post-list">
      {posts.map((post) => (
        <article className="post-row" key={post.id}>
          <div>
            <Link href={`/posts/${post.id}`} className="post-title-link">
              {post.title}
            </Link>
            <p>{post.content}</p>
            <div className="meta-line">
              <span>{post.anonymous ? "Anonymous" : post.author?.name ?? "Member"}</span>
              <span>{timeAgo(post.createdAt)}</span>
            </div>
          </div>
          <div className="post-counters">
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
      ))}
    </div>
  );
}
