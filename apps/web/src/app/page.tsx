import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, MessageSquare, ShoppingBag } from "lucide-react";
import { api } from "@/lib/api";
import { BoardIcon } from "@/components/BoardIcon";
import { PostList } from "@/components/PostList";
import { formatCurrency } from "@/lib/format";

export default async function HomePage() {
  const [{ items: boards }, { items: posts }, { items: courses }, { items: marketItems }] =
    await Promise.all([
      api.getBoards(),
      api.getPosts({ sort: "recent" }),
      api.getCourses(),
      api.getMarketItems()
    ]);

  return (
    <main className="page-shell">
      <section className="dashboard-grid">
        <div className="workspace-panel feed-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Campus feed</p>
              <h1>What students are talking about</h1>
            </div>
            <Link className="action-link" href="/write">
              New post <ArrowRight size={16} />
            </Link>
          </div>
          <PostList posts={posts.slice(0, 5)} />
        </div>

        <aside className="workspace-panel profile-panel">
          <div className="avatar-block">
            <div className="avatar">CT</div>
            <div>
              <strong>Guest session</strong>
              <p>Sign in to write, like, and save courses.</p>
            </div>
          </div>
          <div className="stat-grid">
            <div>
              <span>{posts.length}</span>
              <small>Posts</small>
            </div>
            <div>
              <span>{courses.length}</span>
              <small>Courses</small>
            </div>
            <div>
              <span>{marketItems.length}</span>
              <small>Listings</small>
            </div>
          </div>
          <Link className="button full" href="/login">
            Login
          </Link>
        </aside>
      </section>

      <section className="section-grid">
        <div className="workspace-panel">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Boards</p>
              <h2>Community spaces</h2>
            </div>
          </div>
          <div className="board-grid">
            {boards.map((board) => (
              <Link
                href={`/boards/${board.slug}`}
                key={board.slug}
                className={`board-card accent-${board.accent}`}
              >
                <span className="board-icon">
                  <BoardIcon board={board} />
                </span>
                <strong>{board.name}</strong>
                <p>{board.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="right-stack">
          <Link className="tool-tile" href="/courses">
            <BookOpen size={20} />
            <div>
              <strong>Course Search</strong>
              <span>{courses[0]?.code ?? "Search"} and timetable planning</span>
            </div>
          </Link>
          <Link className="tool-tile" href="/market">
            <ShoppingBag size={20} />
            <div>
              <strong>Marketplace</strong>
              <span>
                {marketItems[0]?.title ?? "Student listings"} ·{" "}
                {marketItems[0] ? formatCurrency(marketItems[0].priceCents) : "CAD"}
              </span>
            </div>
          </Link>
          <Link className="tool-tile" href="/timetable">
            <Clock3 size={20} />
            <div>
              <strong>Timetable</strong>
              <span>Weekly schedule view</span>
            </div>
          </Link>
          <Link className="tool-tile" href="/boards/free">
            <MessageSquare size={20} />
            <div>
              <strong>Free Board</strong>
              <span>Recent student discussions</span>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
