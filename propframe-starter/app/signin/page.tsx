"use client";
// app/signin/page.tsx — platform sign in (redirects to admin or shows portal links)

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { platformConfig } from "@/site.config";

export default function SignInPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Incorrect email or password.");
      setLoading(false);
      return;
    }

    // Admins go to the admin dashboard
    if (platformConfig.adminEmails.includes(data.user.email ?? "")) {
      router.replace("/admin");
    } else {
      // Regular agents — show their company portal links
      router.replace("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <p className="font-semibold text-foreground tracking-tight">propframe</p>
        <p className="text-xs text-muted-foreground mt-1">by Drk Matter Labs</p>
      </div>

      <div className="w-full max-w-sm bg-card border border-border/50 rounded-xl p-8">
        <h1 className="text-lg font-semibold text-foreground mb-1">Sign in</h1>
        <p className="text-sm text-muted-foreground mb-7">Welcome back.</p>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="text-xs tracking-[0.12em] uppercase text-muted-foreground block mb-2">
              Email address
            </label>
            <input
              type="email" value={email} required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourcompany.com"
              className="w-full bg-muted border border-border/60 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs tracking-[0.12em] uppercase text-muted-foreground block mb-2">
              Password
            </label>
            <input
              type="password" value={password} required
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-muted border border-border/60 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">Get started</Link>
        </p>
      </div>
    </div>
  );
}
