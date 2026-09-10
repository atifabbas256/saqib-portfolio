"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Login failed");
      }
      const next = searchParams.get("next") || "/admin";
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
      <form
        onSubmit={(e) => void onSubmit(e)}
        className="w-full max-w-sm space-y-5 rounded-lg border border-[#3a342e] bg-[#1c1814] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9a9288]">
            Portfolio
          </p>
          <h1 className="mt-1 text-xl font-medium text-white">Admin login</h1>
        </div>

        <label className="block space-y-2">
          <span className="block text-xs uppercase tracking-wider text-[#9a9288]">
            Username
          </span>
          <input
            type="text"
            name="username"
            autoComplete="username"
            required
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            className="box-border h-11 w-full rounded border border-[#4a433c] bg-[#0f0d0b] px-3 text-sm text-white outline-none placeholder:text-[#6b645c] focus:border-[#00e200]"
          />
        </label>

        <label className="block space-y-2">
          <span className="block text-xs uppercase tracking-wider text-[#9a9288]">
            Password
          </span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="box-border h-11 w-full rounded border border-[#4a433c] bg-[#0f0d0b] px-3 text-sm text-white outline-none placeholder:text-[#6b645c] focus:border-[#00e200]"
          />
        </label>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded bg-white text-sm font-medium text-[#181411] transition-opacity disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
