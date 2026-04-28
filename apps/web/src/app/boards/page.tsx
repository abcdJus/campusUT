import Link from "next/link";

export default function BoardsIndexPage() {
  return (
    <main className="page-shell narrow">
      <div className="workspace-panel">
        <p className="eyebrow">Boards</p>
        <h1>CampusTalk boards</h1>
        <p>Choose a board to browse community posts.</p>
        <Link className="button" href="/boards/free">
          Open Free Board
        </Link>
      </div>
    </main>
  );
}
