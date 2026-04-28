import {
  boards,
  seedCourses,
  seedMarketItems,
  seedPosts,
  type Board,
  type BoardSlug,
  type Course,
  type MarketItem,
  type Post,
  type SortKey
} from "@campustalk/shared";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:4000";

type ApiList<T> = { items: T[] };

async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`API ${response.status}`);
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export const api = {
  getBoards() {
    return getJson<ApiList<Board>>("/api/boards", { items: boards });
  },
  getPosts(options?: { board?: BoardSlug; q?: string; sort?: SortKey }) {
    const params = new URLSearchParams();
    if (options?.board) params.set("board", options.board);
    if (options?.q) params.set("q", options.q);
    if (options?.sort) params.set("sort", options.sort);
    const fallback = options?.board
      ? seedPosts.filter((post) => post.board === options.board)
      : seedPosts;
    return getJson<ApiList<Post>>(`/api/posts?${params.toString()}`, {
      items: fallback
    });
  },
  async getPost(id: string) {
    const fallback = seedPosts.find((post) => post.id === id) ?? null;
    return getJson<Post | null>(`/api/posts/${encodeURIComponent(id)}`, fallback);
  },
  getCourses(q?: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const fallback = q
      ? seedCourses.filter((course) =>
          `${course.code} ${course.title} ${course.dept}`
            .toLowerCase()
            .includes(q.toLowerCase())
        )
      : seedCourses;
    return getJson<ApiList<Course>>(`/api/courses?${params.toString()}`, {
      items: fallback
    });
  },
  getMarketItems() {
    return getJson<ApiList<MarketItem>>("/api/market-items", {
      items: seedMarketItems
    });
  }
};
