from __future__ import annotations

import os
from typing import Any

import asyncpg
from fastapi import FastAPI, Query
from pydantic import BaseModel


app = FastAPI(title="CampusTalk Python Service")


class Course(BaseModel):
    code: str
    title: str
    dept: str
    campus: str
    term: str
    delivery: str
    status: str
    desc: str


SEED_COURSES: list[Course] = [
    Course(
        code="CSC108H1",
        title="Introduction to Computer Programming",
        dept="Computer Science",
        campus="St. George",
        term="F",
        delivery="In-Person",
        status="Open",
        desc="Python-based intro to programming.",
    ),
    Course(
        code="MAT135H1",
        title="Calculus I",
        dept="Mathematics",
        campus="St. George",
        term="F",
        delivery="In-Person",
        status="Waitlist",
        desc="Limits, derivatives, applications.",
    ),
    Course(
        code="CSC148H1",
        title="Introduction to Computer Science",
        dept="Computer Science",
        campus="St. George",
        term="S",
        delivery="Online",
        status="Full",
        desc="Abstract data types and algorithms in Python.",
    ),
]


async def fetch_rows(query: str, *args: Any) -> list[asyncpg.Record] | None:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        return None

    connection = await asyncpg.connect(database_url)
    try:
        return await connection.fetch(query, *args)
    finally:
        await connection.close()


@app.get("/health")
async def health() -> dict[str, str | bool]:
    database_url = os.getenv("DATABASE_URL")
    status = "configured" if database_url else "memory"
    if database_url:
        try:
            rows = await fetch_rows("select 1")
            status = "connected" if rows is not None else "memory"
        except Exception:
            status = "unavailable"
    return {"ok": True, "service": "campustalk-python", "database": status}


@app.get("/courses/search")
async def search_courses(
    q: str = Query(default="", description="Course code, title, or department"),
    limit: int = Query(default=10, ge=1, le=50),
) -> dict[str, list[Course]]:
    needle = q.strip().lower()
    rows = None
    try:
        rows = await fetch_rows(
            """
            select
              code,
              title,
              dept,
              campus,
              term,
              delivery,
              status,
              description as desc
            from courses
            where $1 = ''
              or code ilike '%' || $1 || '%'
              or title ilike '%' || $1 || '%'
              or dept ilike '%' || $1 || '%'
            order by code
            limit $2
            """,
            needle,
            limit,
        )
    except Exception:
        rows = None

    if rows is not None:
        return {"items": [Course(**dict(row)) for row in rows]}

    matches = [
        course
        for course in SEED_COURSES
        if not needle
        or needle in f"{course.code} {course.title} {course.dept}".lower()
    ]
    return {"items": matches[:limit]}


@app.get("/recommendations/posts")
async def recommended_posts(limit: int = Query(default=5, ge=1, le=20)) -> dict[str, list[dict[str, Any]]]:
    rows = None
    try:
        rows = await fetch_rows(
            """
            select
              p.id,
              p.title,
              p.board_slug as board,
              coalesce(count(pl.user_id), 0)::int as likes,
              p.created_at
            from posts p
            left join post_likes pl on pl.post_id = p.id
            group by p.id
            order by likes desc, p.created_at desc
            limit $1
            """,
            limit,
        )
    except Exception:
        rows = None

    if rows is None:
        return {"items": []}
    return {"items": [dict(row) for row in rows]}
