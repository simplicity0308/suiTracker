"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Yuji_Syuku } from "next/font/google";
import { createClient } from "@/lib/supabase/client";
import { TokyoBackdrop } from "@/components/login/TokyoBackdrop";

const yujiSyuku = Yuji_Syuku({ weight: "400", subsets: ["latin"] });

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "signing-in" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("signing-in");
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus("error");
      setError(error.message);
      return;
    }

    router.push("/trip");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-full flex-1 items-center justify-center p-6">
      <TokyoBackdrop />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm space-y-4 rounded-lg border-t-4 border-t-[#e2703a] bg-[#f4f1ee] p-6 text-[#1b1a17] shadow-2xl shadow-black/40"
      >
        <div>
          <h1 className={`${yujiSyuku.className} text-4xl tracking-wide text-[#1b2a52]`}>
            SuiTracker
          </h1>
          <p className="mt-1 text-sm text-[#6b6558]">
            Sign in to view the itinerary.
          </p>
        </div>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-md border border-[#d8d2c4] bg-white px-3 py-2 text-sm text-[#1b1a17] placeholder:text-[#9c9585]"
        />
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-md border border-[#d8d2c4] bg-white px-3 py-2 text-sm text-[#1b1a17] placeholder:text-[#9c9585]"
        />
        {status === "error" && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={status === "signing-in"}
          className="w-full rounded-md bg-[#1b2a52] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {status === "signing-in" ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
