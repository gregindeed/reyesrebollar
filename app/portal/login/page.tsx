"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "https://reyesrebollar.com/portal/dashboard",
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-10 text-center">
        <Image
          src="/reyesrebollar_logo.png"
          alt="Reyes Rebollar Properties"
          width={52}
          height={52}
          className="object-contain mx-auto mb-4 opacity-85"
        />
        <p className="font-display text-xl text-foreground">
          Reyes Rebollar Properties
        </p>
        <p className="text-[0.65rem] tracking-[0.18em] uppercase text-muted-foreground mt-1">
          Tenant Portal
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-card border border-border/50 rounded-xl p-8">
        {!sent ? (
          <>
            <h1 className="text-base font-semibold text-foreground mb-1">
              Sign in to your portal
            </h1>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Enter your email and we'll send you a magic link — no password needed.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[0.65rem] tracking-[0.14em] uppercase text-muted-foreground block mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-background border border-border/60 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-xs tracking-[0.12em] uppercase font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {loading ? "Sending..." : "Send Magic Link"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-lg">✉</span>
            </div>
            <h2 className="text-sm font-semibold text-foreground mb-2">
              Check your email
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We sent a magic link to{" "}
              <span className="font-medium text-foreground">{email}</span>.
              Click it to sign in — no password needed.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="mt-6 text-[0.65rem] tracking-[0.14em] uppercase text-muted-foreground hover:text-foreground transition-colors border-b border-border/50 pb-0.5"
            >
              Use a different email
            </button>
          </div>
        )}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Questions?{" "}
        <a href="mailto:reyes@reyesrebollar.com" className="hover:text-foreground transition-colors underline underline-offset-2">
          reyes@reyesrebollar.com
        </a>
      </p>
    </div>
  );
}
