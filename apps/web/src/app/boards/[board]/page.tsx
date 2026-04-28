import Link from "next/link";
import { notFound } from "next/navigation";
import { boards as boardSeed, type BoardSlug } from "@campustalk/shared";
import { api } from "@/lib/api";
import { BoardIcon } from "@/components/BoardIcon";
import { PostList } from "@/components/PostList";

export function generateStaticParams() {
  return boardSeed.map((board) => ({ board: board.slug }));
}

type PageProps = {
  params: Promise<{ board: string }>;
};

export default async function BoardPage({ params }: PageProps) {
  const { board } = await params;
  const [{ items: boards }, { items: posts }] = await Promise.all([
    api.getBoards(),
    api.getPosts({
      board: board as BoardSlug,
      sort: "recent"
    })
  ]);
  const currentBoard = boards.find((item) => item.slug === board);
  if (!currentBoard) notFound();

  return (
    <main className="page-shell narrow">
      <div className={`board-header-panel accent-${currentBoard.accent}`}>
        <span className="board-icon large">
          <BoardIcon board={currentBoard} />
        </span>
        <div>
          <p className="eyebrow">Board</p>
          <h1>{currentBoard.name}</h1>
          <p>{currentBoard.description}</p>
        </div>
        <Link className="button" href="/write">
          New post
        </Link>
      </div>

      <form className="search-row">
        <input name="q" placeholder="Search posts" />
        <select name="sort" defaultValue="recent">
          <option value="recent">Recent</option>
          <option value="hot">Hot</option>
        </select>
        <button className="button subtle" type="submit">
          Search
        </button>
      </form>

      <PostList posts={posts} />
    </main>
  );
}
