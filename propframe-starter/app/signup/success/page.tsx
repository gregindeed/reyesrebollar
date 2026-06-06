// app/signup/success/page.tsx — post-signup confirmation screen
import Link from "next/link";

export default function SignupSuccessPage({
  searchParams,
}: {
  searchParams: { company?: string; id?: string; confirm?: string; email?: string };
}) {
  const needsConfirmation = searchParams.confirm === "true";
  const companyName       = searchParams.company ?? "your company";
  const companyId         = searchParams.id;

  if (needsConfirmation) {
    return (
      <Wrapper>
        <div className="text-4xl mb-6">✉️</div>
        <h1 className="text-xl font-semibold text-foreground mb-2">Check your email</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          We sent a confirmation link to{" "}
          <span className="text-foreground">{searchParams.email}</span>.
          Click it to activate your account.
        </p>
        <p className="text-xs text-muted-foreground">
          Once confirmed, come back and{" "}
          <Link href="/signin" className="text-primary hover:underline">sign in</Link>.
        </p>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="text-4xl mb-6">🎉</div>
      <h1 className="text-xl font-semibold text-foreground mb-2">
        You&apos;re all set!
      </h1>
      <p className="text-sm text-muted-foreground leading-relaxed mb-8">
        <span className="text-foreground">{companyName}</span> is live on propframe.
        Here&apos;s what to do next.
      </p>

      <div className="space-y-4 mb-8">
        <NextStep
          n="1"
          title="Deploy your client site"
          body="Fork the propframe template repo, fill in site.config.ts with your branding, and deploy to Cloudflare Pages."
        />
        <NextStep
          n="2"
          title="Set your company ID"
          body={`Add NEXT_PUBLIC_COMPANY_ID = ${companyId ?? "your-uuid"} to your Cloudflare Pages environment variables.`}
          mono
        />
        <NextStep
          n="3"
          title="Add your properties"
          body="Sign into your manager portal and start adding properties, units, and tenants."
        />
      </div>

      {companyId && (
        <div className="bg-muted border border-border/50 rounded-lg px-4 py-3 mb-6">
          <p className="text-xs text-muted-foreground mb-1">Your Company ID</p>
          <p className="text-xs font-mono text-foreground break-all">{companyId}</p>
        </div>
      )}

      <Link
        href="/signin"
        className="block w-full text-center bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Go to your dashboard
      </Link>
    </Wrapper>
  );
}

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

function NextStep({ n, title, body, mono }: { n: string; title: string; body: string; mono?: boolean }) {
  return (
    <div className="flex gap-4">
      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
        {n}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground mb-0.5">{title}</p>
        <p className={`text-xs leading-relaxed ${mono ? "font-mono text-primary" : "text-muted-foreground"}`}>
          {body}
        </p>
      </div>
    </div>
  );
}
