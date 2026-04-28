"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:4000";

type AuthMode = "login" | "register";

export function LoginPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setMessage("");
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = (await response.json()) as { token?: string; error?: string };
      if (!response.ok || !payload.token) {
        throw new Error(payload.error ?? "Authentication failed");
      }
      localStorage.setItem("campustalk_token", payload.token);
      router.push("/");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-panel">
      <div className="segmented-control" aria-label="Authentication mode">
        <button
          className={mode === "login" ? "active" : ""}
          type="button"
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          className={mode === "register" ? "active" : ""}
          type="button"
          onClick={() => setMode("register")}
        >
          Sign up
        </button>
      </div>

      <form action={submit} className="stack-form">
        {mode === "register" && (
          <>
            <label>
              Name
              <input name="name" required placeholder="Your name" />
            </label>
            <label>
              Student ID
              <input name="studentId" required placeholder="1000000000" />
            </label>
            <label>
              University
              <input name="university" required placeholder="University of Toronto" />
            </label>
            <label>
              Major
              <input name="major" required placeholder="Computer Science" />
            </label>
          </>
        )}

        <label>
          Email
          <input name="email" required type="email" placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input name="password" required type="password" minLength={8} />
        </label>

        {message && <p className="form-error">{message}</p>}
        <button className="button full" type="submit" disabled={pending}>
          {pending ? "Working..." : mode === "login" ? "Login" : "Create account"}
        </button>
      </form>
    </div>
  );
}
