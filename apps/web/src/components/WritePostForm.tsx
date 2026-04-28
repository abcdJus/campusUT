"use client";

import type { Board } from "@campustalk/shared";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:4000";

export function WritePostForm({ boards }: { boards: Board[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setError("");
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("campustalk_token")
        : null;

    try {
      const response = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          board: formData.get("board"),
          title: formData.get("title"),
          content: formData.get("content"),
          anonymous: formData.get("anonymous") === "on",
          allowComments: formData.get("allowComments") === "on"
        })
      });
      const post = (await response.json()) as { id?: string; board?: string; error?: string };
      if (!response.ok || !post.id || !post.board) {
        throw new Error(post.error ?? "Could not publish post");
      }
      router.push(`/boards/${post.board}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish post");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={submit} className="write-form">
      <label>
        Board
        <select name="board" defaultValue="free">
          {boards.map((board) => (
            <option key={board.slug} value={board.slug}>
              {board.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Title
        <input name="title" required maxLength={120} placeholder="Post title" />
      </label>
      <label>
        Content
        <textarea name="content" required rows={14} maxLength={4000} />
      </label>
      <div className="check-row">
        <label>
          <input type="checkbox" name="anonymous" />
          Anonymous
        </label>
        <label>
          <input type="checkbox" name="allowComments" defaultChecked />
          Allow comments
        </label>
      </div>
      {error && <p className="form-error">{error}</p>}
      <button className="button" type="submit" disabled={pending}>
        <Send size={17} />
        {pending ? "Publishing..." : "Publish"}
      </button>
    </form>
  );
}
