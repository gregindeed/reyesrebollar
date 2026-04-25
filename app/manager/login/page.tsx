"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

type Mode = "signin" | "setup" | "forgot";

export default function ManagerLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = () => { setError(null); setSuccess(null); setPassword(""); setConfirm(""); };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message === "Invalid login credentials"
        ? "Incorrect email or password. First time? Use 'Set up account' below."
        : error.message);
    } else {
      router.replace("/manager/dashboard");
    }
    setLoading(false);
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (!email.endsWith("@reyesrebollar.com")) {
      setError("Only @reyesrebollar.com emails can access this portal.");
      return;
    }
    setLoading(true); setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      // Try signing in immediately (works when email confirmation is off)
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setSuccess("Account created! You can now sign in.");
        setMode("signin");
      } else {
        router.replace("/manager/dashboard");
      }
    }
    setLoading(false);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://reyesrebollar.com/manager/reset-password",
    });
    if (error) setError(error.message);
    else setSuccess("Password reset link sent. Check your email.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-10 text-center">
        <Image
          src="/reyesrebollar_logo.png"
          alt="RRP"
          width={48}
          height={48}
          className="object-contain mx-auto mb-4 opacity-85"
        />
        <p className="text-xl font-light tracking-wide text-foreground">
          Reyes Rebollar Properties
        </p>
        <p className="text-[0.62rem] tracking-[0.18em] uppercase text-terracotta mt-1">
          Manager Portal
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-card border border-border/50 rounded-xl p-8">

        {/* Sign In */}
        {mode === "signin" && (
          <>
            <h1 className="text-sm font-semibold text-foreground mb-1">Manager sign in</h1>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Sign in with your email and password.
            </p>
            {success && <p className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg mb-4">{success}</p>}
            <form onSubmit={handleSignIn} className="space-y-4">
              <Field label="Email address" type="email" value={email}
                onChange={setEmail} placeholder="reyes@reyesrebollar.com" />
              <Field label="Password" type="password" value={password}
                onChange={setPassword} placeholder="••••••••" />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <Btn loading={loading} disabled={!email || !password}>Sign In</Btn>
            </form>
            <div className="flex items-center justify-between mt-5">
              <button onClick={() => { setMode("setup"); reset(); }}
                className="text-[0.65rem] tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors">
                First time? Set up account
              </button>
              <button onClick={() => { setMode("forgot"); reset(); }}
                className="text-[0.65rem] tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors">
                Forgot password
              </button>
            </div>
          </>
        )}

        {/* First-time setup */}
        {mode === "setup" && (
          <>
            <h1 className="text-sm font-semibold text-foreground mb-1">Create your account</h1>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Set up your manager account — no email confirmation needed.
            </p>
            <form onSubmit={handleSetup} className="space-y-4">
              <Field label="Email address" type="email" value={email}
                onChange={setEmail} placeholder="reyes@reyesrebollar.com" />
              <Field label="New password" type="password" value={password}
                onChange={setPassword} placeholder="Min. 8 characters" />
              <Field label="Confirm password" type="password" value={confirm}
                onChange={setConfirm} placeholder="••••••••" />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <Btn loading={loading} disabled={!email || !password || !confirm}>
                Create Account &amp; Sign In
              </Btn>
            </form>
            <button onClick={() => { setMode("signin"); reset(); }}
              className="mt-5 text-[0.65rem] tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors">
              ← Back to sign in
            </button>
          </>
        )}

        {/* Forgot password */}
        {mode === "forgot" && (
          <>
            <h1 className="text-sm font-semibold text-foreground mb-1">Reset password</h1>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Enter your email and we'll send a password reset link.
            </p>
            {success
              ? <p className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">{success}</p>
              : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <Field label="Email address" type="email" value={email}
                    onChange={setEmail} placeholder="reyes@reyesrebollar.com" />
                  {error && <p className="text-xs text-red-600">{error}</p>}
                  <Btn loading={loading} disabled={!email}>Send Reset Link</Btn>
                </form>
              )
            }
            <button onClick={() => { setMode("signin"); reset(); }}
              className="mt-5 text-[0.65rem] tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors">
              ← Back to sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder }: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div>
      <label className="text-[0.62rem] tracking-[0.14em] uppercase text-muted-foreground block mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full bg-background border border-border/60 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 transition-colors"
      />
    </div>
  );
}

function Btn({ children, loading, disabled }: {
  children: React.ReactNode; loading: boolean; disabled: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-xs tracking-[0.12em] uppercase font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
