import "dotenv/config";
import bcrypt from "bcryptjs";
import cors from "cors";
import express, { type Request } from "express";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import morgan from "morgan";
import { Pool } from "pg";
import { z } from "zod";
import {
  boards,
  seedCourses,
  seedMarketItems,
  seedPosts,
  type BoardSlug,
  type Course,
  type MarketItem,
  type Post,
  type SortKey,
  type UserSummary
} from "@campustalk/shared";
import { randomUUID } from "node:crypto";

type JwtUser = Pick<UserSummary, "id" | "email" | "name">;

type StoredUser = UserSummary & {
  passwordHash: string;
  studentId?: string;
};

const app = express();
const port = Number(process.env.PORT ?? 4000);
const jwtSecret = process.env.JWT_SECRET ?? "campustalk-dev-secret";
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

let memoryPosts: Post[] = [...seedPosts];
let memoryUsers: StoredUser[] = [];

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

function signToken(user: JwtUser) {
  return jwt.sign(user, jwtSecret, { subject: user.id, expiresIn: "7d" });
}

function readAuthUser(req: Request): JwtUser | null {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(header.slice("Bearer ".length), jwtSecret) as JwtUser;
  } catch {
    return null;
  }
}

async function withDatabase<T>(
  query: (pool: Pool) => Promise<T>,
  fallback: () => T | Promise<T>
) {
  if (!pool) return fallback();
  try {
    return await query(pool);
  } catch (error) {
    console.warn("Postgres unavailable; using in-memory response.", error);
    return fallback();
  }
}

function filterPosts({
  board,
  q,
  sort
}: {
  board?: BoardSlug;
  q?: string;
  sort?: SortKey;
}) {
  const needle = q?.trim().toLowerCase();
  const filtered = memoryPosts.filter((post) => {
    const matchesBoard = board ? post.board === board : true;
    const matchesQuery = needle
      ? `${post.title} ${post.content}`.toLowerCase().includes(needle)
      : true;
    return matchesBoard && matchesQuery;
  });

  return filtered.sort((a, b) => {
    if (sort === "hot") {
      return b.likes - a.likes || Date.parse(b.createdAt) - Date.parse(a.createdAt);
    }
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });
}

function toMarketItem(row: Record<string, unknown>): MarketItem {
  return {
    id: String(row.id),
    title: String(row.title),
    category: row.category as MarketItem["category"],
    priceCents: Number(row.price_cents),
    condition: row.condition as MarketItem["condition"],
    campus: String(row.campus),
    sellerName: String(row.seller_name ?? "Member"),
    createdAt: new Date(String(row.created_at)).toISOString()
  };
}

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const registerSchema = authSchema.extend({
  name: z.string().min(1),
  studentId: z.string().min(1),
  university: z.string().min(1),
  major: z.string().min(1)
});

const postSchema = z.object({
  board: z.enum(["free", "class", "exam", "job", "club-utksa", "club-utkos"]),
  title: z.string().min(1).max(120),
  content: z.string().min(1).max(4000),
  anonymous: z.boolean().default(false),
  allowComments: z.boolean().default(true)
});

app.get("/health", async (_req, res) => {
  const database = await withDatabase(
    async (db) => {
      await db.query("select 1");
      return "connected";
    },
    () => "memory"
  );
  res.json({ ok: true, service: "campustalk-api", database });
});

app.get("/api/boards", (_req, res) => {
  res.json({ items: boards });
});

app.get("/api/posts", async (req, res) => {
  const board = req.query.board as BoardSlug | undefined;
  const q = req.query.q as string | undefined;
  const sort = (req.query.sort as SortKey | undefined) ?? "recent";

  const items = await withDatabase(
    async (db) => {
      const result = await db.query<Post>(
        `
          select
            p.id,
            p.board_slug as "board",
            p.title,
            p.content,
            case
              when p.anonymous then null
              else json_build_object(
                'id', u.id,
                'email', u.email,
                'name', u.name,
                'university', u.university,
                'major', u.major,
                'avatarUrl', u.avatar_url
              )
            end as "author",
            p.anonymous,
            p.allow_comments as "allowComments",
            coalesce(likes.total, 0)::int as "likes",
            coalesce(comments.total, 0)::int as "comments",
            p.created_at as "createdAt"
          from posts p
          left join users u on u.id = p.author_id
          left join (
            select post_id, count(*) as total from post_likes group by post_id
          ) likes on likes.post_id = p.id
          left join (
            select post_id, count(*) as total from comments group by post_id
          ) comments on comments.post_id = p.id
          where ($1::text is null or p.board_slug = $1)
            and (
              $2::text is null
              or p.title ilike '%' || $2 || '%'
              or p.content ilike '%' || $2 || '%'
            )
          order by
            case when $3::text = 'hot' then coalesce(likes.total, 0) else 0 end desc,
            p.created_at desc
          limit 50
        `,
        [board ?? null, q ?? null, sort]
      );
      return result.rows;
    },
    () => filterPosts({ board, q, sort })
  );

  res.json({ items });
});

app.get("/api/posts/:id", async (req, res) => {
  const post = await withDatabase(
    async (db) => {
      const result = await db.query<Post>(
        `
          select
            p.id,
            p.board_slug as "board",
            p.title,
            p.content,
            case
              when p.anonymous then null
              else json_build_object(
                'id', u.id,
                'email', u.email,
                'name', u.name,
                'university', u.university,
                'major', u.major,
                'avatarUrl', u.avatar_url
              )
            end as "author",
            p.anonymous,
            p.allow_comments as "allowComments",
            coalesce(likes.total, 0)::int as "likes",
            coalesce(comments.total, 0)::int as "comments",
            p.created_at as "createdAt"
          from posts p
          left join users u on u.id = p.author_id
          left join (
            select post_id, count(*) as total from post_likes group by post_id
          ) likes on likes.post_id = p.id
          left join (
            select post_id, count(*) as total from comments group by post_id
          ) comments on comments.post_id = p.id
          where p.id = $1
        `,
        [req.params.id]
      );
      return result.rows[0] ?? null;
    },
    () => memoryPosts.find((post) => post.id === req.params.id) ?? null
  );

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json(post);
});

app.post("/api/posts", async (req, res) => {
  const parsed = postSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid post" });
    return;
  }

  const authUser = readAuthUser(req);
  const created = await withDatabase(
    async (db) => {
      const result = await db.query<{ id: string; board: BoardSlug }>(
        `
          insert into posts (
            board_slug, author_id, title, content, anonymous, allow_comments
          )
          values ($1, $2, $3, $4, $5, $6)
          returning id, board_slug as "board"
        `,
        [
          parsed.data.board,
          authUser?.id ?? null,
          parsed.data.title,
          parsed.data.content,
          parsed.data.anonymous,
          parsed.data.allowComments
        ]
      );
      return result.rows[0];
    },
    () => {
      const post: Post = {
        id: randomUUID(),
        board: parsed.data.board,
        title: parsed.data.title,
        content: parsed.data.content,
        author: authUser ? { ...authUser } : null,
        anonymous: parsed.data.anonymous,
        allowComments: parsed.data.allowComments,
        likes: 0,
        comments: 0,
        createdAt: new Date().toISOString()
      };
      memoryPosts = [post, ...memoryPosts];
      return { id: post.id, board: post.board };
    }
  );

  res.status(201).json(created);
});

app.post("/api/auth/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid user" });
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await withDatabase(
      async (db) => {
        const result = await db.query<UserSummary>(
          `
            insert into users (email, password_hash, name, student_id, university, major)
            values ($1, $2, $3, $4, $5, $6)
            returning id, email, name, university, major, avatar_url as "avatarUrl"
          `,
          [
            parsed.data.email.toLowerCase(),
            passwordHash,
            parsed.data.name,
            parsed.data.studentId,
            parsed.data.university,
            parsed.data.major
          ]
        );
        return result.rows[0];
      },
      () => {
        if (memoryUsers.some((item) => item.email === parsed.data.email.toLowerCase())) {
          throw new Error("Email already registered");
        }
        const memoryUser: StoredUser = {
          id: randomUUID(),
          email: parsed.data.email.toLowerCase(),
          name: parsed.data.name,
          studentId: parsed.data.studentId,
          university: parsed.data.university,
          major: parsed.data.major,
          passwordHash
        };
        memoryUsers = [memoryUser, ...memoryUsers];
        return memoryUser;
      }
    );

    const token = signToken({ id: user.id, email: user.email, name: user.name });
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(409).json({
      error: error instanceof Error ? error.message : "Could not create account"
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid login" });
    return;
  }

  const user = await withDatabase(
    async (db) => {
      const result = await db.query<StoredUser>(
        `
          select
            id,
            email,
            name,
            university,
            major,
            avatar_url as "avatarUrl",
            password_hash as "passwordHash"
          from users
          where email = $1
        `,
        [parsed.data.email.toLowerCase()]
      );
      return result.rows[0] ?? null;
    },
    () =>
      memoryUsers.find((item) => item.email === parsed.data.email.toLowerCase()) ??
      null
  );

  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const { passwordHash: _passwordHash, ...safeUser } = user;
  const token = signToken({
    id: safeUser.id,
    email: safeUser.email,
    name: safeUser.name
  });
  res.json({ user: safeUser, token });
});

app.get("/api/courses", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  const items = await withDatabase(
    async (db) => {
      const result = await db.query<Course>(
        `
          select
            c.code,
            c.title,
            c.dept,
            c.campus,
            c.term,
            c.delivery,
            c.status,
            c.description as "desc",
            coalesce(
              json_agg(
                json_build_object(
                  'day', cm.day,
                  'start', to_char(cm.start_time, 'HH24:MI'),
                  'end', to_char(cm.end_time, 'HH24:MI'),
                  'campus', cm.campus,
                  'room', cm.room,
                  'instructor', cm.instructor
                )
                order by cm.day, cm.start_time
              ) filter (where cm.id is not null),
              '[]'
            ) as meetings
          from courses c
          left join course_meetings cm on cm.course_code = c.code
          where $1::text = ''
            or c.code ilike '%' || $1 || '%'
            or c.title ilike '%' || $1 || '%'
            or c.dept ilike '%' || $1 || '%'
          group by c.code
          order by c.code
          limit 50
        `,
        [q]
      );
      return result.rows;
    },
    () =>
      seedCourses.filter((course) =>
        q
          ? `${course.code} ${course.title} ${course.dept}`
              .toLowerCase()
              .includes(q.toLowerCase())
          : true
      )
  );
  res.json({ items });
});

app.get("/api/market-items", async (_req, res) => {
  const items = await withDatabase(
    async (db) => {
      const result = await db.query<Record<string, unknown>>(
        `
          select
            m.id,
            m.title,
            m.category,
            m.price_cents,
            m.condition,
            m.campus,
            coalesce(u.name, 'Member') as seller_name,
            m.created_at
          from market_items m
          left join users u on u.id = m.seller_id
          order by m.created_at desc
          limit 50
        `
      );
      return result.rows.map(toMarketItem);
    },
    () => seedMarketItems
  );
  res.json({ items });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(port, () => {
  console.log(`CampusTalk API listening on http://localhost:${port}`);
});
