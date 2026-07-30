"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 font-display text-2xl uppercase tracking-wide text-ink">
        Logi<span className="text-rust">Express</span>
      </Link>
      <h1 className="font-display text-3xl uppercase tracking-wide text-ink">Create your account</h1>
      <p className="mt-2 text-ink/60">Sign up as a customer to start booking parcels.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
          className="input-field"
        />
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Mobile number"
          className="input-field"
        />
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
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min. 6 characters)"
          className="input-field"
        />

        {error && <p className="text-sm text-rust">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary mt-2 disabled:opacity-50">
          {loading ? "Please wait..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-ink/60">
        Already have an account?{" "}
        <Link href="/login" className="text-route underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
