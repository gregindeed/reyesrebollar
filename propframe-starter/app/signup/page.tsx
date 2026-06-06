"use client";
// app/signup/page.tsx — self-serve onboarding for new real estate agents

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Step = "company" | "account" | "loading";

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function SignupPage() {
  const router = useRouter();
  const [step,        setStep]        = useState<Step>("company");
  const [companyName, setCompanyName] = useState("");
  const [slug,        setSlug]        = useState("");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [error,       setError]       = useState<string | null>(null);

  const handleCompanyNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) { setError("Company name is required."); return; }
    if (!slug.trim())        { setError("URL slug is required."); return; }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError("Slug can only contain lowercase letters, numbers, and hyphens."); return;
    }
    setError(null);
    setStep("account");
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return; }

    setError(null);
    setStep("loading");

    // 1. Create auth user
    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({ email, password });

    if (signUpError || !signUpData.user) {
      setError(signUpError?.message ?? "Failed to create account.");
      setStep("account");
      return;
    }

    // 2. Sign in immediately (works when email confirmation is disabled)
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !signInData.user) {
      // Account created but needs email confirmation
      router.push(`/signup/success?confirm=true&email=${encodeURIComponent(email)}`);
      return;
    }

    // 3. Create the company record
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({ name: companyName.trim(), slug: slug.trim(), status: "active" })
      .select("id")
      .single();

    if (companyError || !company) {
      setError(
        companyError?.code === "23505"
          ? "That URL slug is already taken. Go back and choose a different one."
          : (companyError?.message ?? "Failed to create company.")
      );
      setStep("account");
      return;
    }

    // 4. Link user as owner in company_members
    const { error: memberError } = await supabase
      .from("company_members")
      .insert({
        user_id:    signInData.user.id,
        company_id: company.id,
        role:       "owner",
        status:     "active",
      });

    if (memberError) {
      setError(memberError.message);
      setStep("account");
      return;
    }

    // 5. Success
    router.push(`/signup/success?company=${encodeURIComponent(companyName)}&id=${company.id}`);
  };

  if (step === "loading") {
    return (
      <Wrapper>
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Setting up your account...</p>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        <Step active={step === "company"} done={step === "account"} label="Company" />
        <div className="flex-1 h-px bg-border/50" />
        <Step active={step === "account"} done={false} label="Account" />
      </div>

      {/* Step 1 — Company */}
      {step === "company" && (
        <>
          <h1 className="text-xl font-semibold text-foreground mb-1">Your company</h1>
          <p className="text-sm text-muted-foreground mb-7">
            This is how your business will appear on the platform.
          </p>
          <form onSubmit={handleCompanyNext} className="space-y-5">
            <Field label="Company name" placeholder="Reyes Rebollar Properties LLC">
              <input
                type="text" value={companyName} required
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  if (!slug) setSlug(slugify(e.target.value));
                }}
                placeholder="Reyes Rebollar Properties LLC"
                className={inputClass}
              />
            </Field>
            <Field
              label="URL slug"
              hint={`propframe.drkm.io/${slug || "your-company"}`}
            >
              <input
                type="text" value={slug} required
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="reyes-rebollar"
                className={inputClass}
              />
            </Field>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <Btn>Continue →</Btn>
          </form>
        </>
      )}

      {/* Step 2 — Account */}
      {step === "account" && (
        <>
          <h1 className="text-xl font-semibold text-foreground mb-1">Create your account</h1>
          <p className="text-sm text-muted-foreground mb-7">
            This will be your login for <span className="text-foreground">{companyName}</span>.
          </p>
          <form onSubmit={handleAccountSubmit} className="space-y-5">
            <Field label="Email address">
              <input
                type="email" value={email} required
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourcompany.com"
                className={inputClass}
              />
            </Field>
            <Field label="Password">
              <input
                type="password" value={password} required
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className={inputClass}
              />
            </Field>
            <Field label="Confirm password">
              <input
                type="password" value={confirm} required
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </Field>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <Btn>Create account</Btn>
          </form>
          <button
            onClick={() => { setStep("company"); setError(null); }}
            className="mt-5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
        </>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/signin" className="text-primary hover:underline">Sign in</Link>
      </p>
    </Wrapper>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

const inputClass =
  "w-full bg-muted border border-border/60 rounded-lg px-4 py-2.5 text-sm text-foreground " +
  "placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 transition-colors";

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <p className="font-semibold text-foreground tracking-tight">propframe</p>
        <p className="text-xs text-muted-foreground mt-1">by Drk Matter Labs</p>
      </div>
      <div className="w-full max-w-md bg-card border border-border/50 rounded-xl p-8">
        {children}
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs tracking-[0.12em] uppercase text-muted-foreground">{label}</label>
        {hint && <span className="text-xs text-muted-foreground font-mono">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Step({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-medium
        ${active ? "bg-primary text-primary-foreground" : done ? "bg-primary/30 text-primary" : "bg-muted text-muted-foreground"}`}>
        {done ? "✓" : ""}
      </div>
      <span className={`text-xs ${active ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
    </div>
  );
}

function Btn({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
    >
      {children}
    </button>
  );
}
