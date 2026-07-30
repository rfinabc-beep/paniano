"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setLoading(false);
      setError(signInError?.message ?? "Login failed");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    setLoading(false);

    const next = searchParams.get("next");
    if (next) {
      router.push(next);
    } else if (profile?.role === "admin") {
      router.push("/admin");
    } else if (profile?.role === "rider") {
      router.push("/rider");
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 font-display text-2xl uppercase tracking-wide text-ink">
        Logi<span className="text-rust">Express</span>
      </Link>
      <h1 className="font-display text-3xl uppercase tracking-wide text-ink">Log in</h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="input-field"
        />
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="input-field"
        />

        {error && <p className="text-sm text-rust">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary mt-2 disabled:opacity-50">
          {loading ? "Please wait..." : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-ink/60">
        Don't have an account?{" "}
        <Link href="/signup" className="text-route underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
