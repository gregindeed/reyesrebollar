"use client";
// app/manager/login/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Manager authentication — multi-tenant aware.
//
// Access control is enforced via the `company_members` table in Supabase.
// After a successful sign-in, we verify the user has an active membership
// for NEXT_PUBLIC_COMPANY_ID.  If not, they are signed out immediately.
//
// Self-signup ("Set up account") creates the auth.users row only.
// The company owner must then run the Step 10 SQL from the multitenant
// migration to insert the new user into company_members before they can log in.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { COMPANY_ID, siteConfig } from "@/site.config";
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

  /** After a successful auth sign-in, verify company_members membership. */
  async function verifyCompanyMembership(userId: string): Promise<boolean> {
    if (!COMPANY_ID) {
      setError(
        "This deployment is missing NEXT_PUBLIC_COMPANY_ID. " +
        "Contact your administrator."
      );
      await supabase.auth.signOut();
      return false;
    }

    const { data, error: queryError } = await supabase
      .from("company_members")
      .select("id, status")
      .eq("user_id", userId)
      .eq("company_id", COMPANY_ID)
      .single();

    if (queryError || !data) {
      await supabase.auth.signOut();
      setError(
        "Your account is not authorized for this portal. " +
        "Contact your company administrator."
      );
      return false;
    }

    if (data.status !== "active") {
      await supabase.auth.signOut();
      setError(
        `Your account status is "${data.status}". ` +
        "Contact your administrator to activate it."
      );
      return false;
    }

    return true;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : authError.message
      );
      setLoading(false);
      return;
    }

    const authorized = await verifyCompanyMembership(data.user.id);
    if (authorized) router.replace("/manager/dashboard");
    setLoading(false);
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return; }

    setLoading(true); setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      // Email confirmation required — user exists but isn't confirmed yet
      setSuccess(
        "Account created! An administrator must add you to company_members before you can log in. " +
        "Once that's done, return here to sign in."
      );
      setMode("signin");
      setLoading(false);
      return;
    }

    // Account created and auto-confirmed — try signing in, then check membership
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !signInData) {
      setSuccess("Account created! An administrator must add you to company_members before you can log in.");
      setMode("signin");
      setLoading(false);
      return;
    }

    const authorized = await verifyCompanyMembership(signInData.user.id);
    if (authorized) {
      router.replace("/manager/dashboard");
    } else {
      // verifyCompanyMembership already set the error and signed out
      setMode("signin");
    }
    setLoading(false);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteConfig.siteUrl}/manager/reset-password`,
    });
    if (resetError) setError(resetError.message);
    else setSuccess("Password reset link sent. Check your email.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-10 text-center">
        <Image
          src={siteConfig.logoPath}
          alt={siteConfig.companyShort}
          width={48}
          height={48}
          className="object-contain mx-auto mb-4 opacity-85"
        />
        <p className="text-xl font-light tracking-wide text-foreground">
          {siteConfig.companyName}
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
            {success && (
              <p className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg mb-4">
                {success}
              </p>
            )}
            <form onSubmit={handleSignIn} className="space-y-4">
              <Field label="Email address" type="email" value={email}
                onChange={setEmail} placeholder={siteConfig.email} />
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

        {/* First-time account setup */}
        {mode === "setup" && (
          <>
            <h1 className="text-sm font-semibold text-foreground mb-1">Create your account</h1>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Create your login credentials. Your administrator must also add you
              to the company member list before you can access the dashboard.
            </p>
            <form onSubmit={handleSetup} className="space-y-4">
              <Field label="Email address" type="email" value={email}
                onChange={setEmail} placeholder={siteConfig.email} />
              <Field label="New password" type="password" value={password}
                onChange={setPassword} placeholder="Min. 8 characters" />
              <Field label="Confirm password" type="password" value={confirm}
                onChange={setConfirm} placeholder="••••••••" />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <Btn loading={loading} disabled={!email || !password || !confirm}>
                Create Account
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
                    onChange={setEmail} placeholder={siteConfig.email} />
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

// ─── Sub-components ───────────────────────────────────────────────────────────

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
