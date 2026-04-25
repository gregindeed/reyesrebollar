"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase puts the session in the URL hash after a password reset click
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true); setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else setDone(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="mb-10 text-center">
        <Image src="/reyesrebollar_logo.png" alt="RRP" width={48} height={48}
          className="object-contain mx-auto mb-4 opacity-85" />
        <p className="text-xl font-light tracking-wide text-foreground">
          Reyes Rebollar Properties
        </p>
        <p className="text-[0.62rem] tracking-[0.18em] uppercase text-terracotta mt-1">
          Manager Portal
        </p>
      </div>

      <div className="w-full max-w-sm bg-card border border-border/50 rounded-xl p-8">
        {done ? (
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground mb-2">Password updated</p>
            <p className="text-xs text-muted-foreground mb-6">You can now sign in with your new password.</p>
            <button onClick={() => router.replace("/manager/login")}
              className="text-xs tracking-[0.12em] uppercase text-primary border-b border-primary/30 pb-0.5 hover:opacity-70 transition-opacity">
              Go to sign in →
            </button>
          </div>
        ) : !ready ? (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Verifying reset link…</p>
            <p className="text-xs text-muted-foreground mt-2">
              If nothing happens, your link may have expired.{" "}
              <button onClick={() => router.replace("/manager/login")}
                className="underline hover:opacity-70 transition-opacity">
                Go back
              </button>
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-sm font-semibold text-foreground mb-1">Set new password</h1>
            <p className="text-xs text-muted-foreground mb-6">Choose a strong password for your account.</p>
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="text-[0.62rem] tracking-[0.14em] uppercase text-muted-foreground block mb-2">
                  New password
                </label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters" required
                  className="w-full bg-background border border-border/60 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 transition-colors" />
              </div>
              <div>
                <label className="text-[0.62rem] tracking-[0.14em] uppercase text-muted-foreground block mb-2">
                  Confirm password
                </label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full bg-background border border-border/60 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 transition-colors" />
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button type="submit" disabled={loading || !password || !confirm}
                className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-xs tracking-[0.12em] uppercase font-medium hover:opacity-90 transition-opacity disabled:opacity-40">
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
