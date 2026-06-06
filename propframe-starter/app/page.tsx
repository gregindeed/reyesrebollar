// app/page.tsx — propframe marketing landing page
import Link from "next/link";
import { platformConfig } from "@/site.config";

const features = [
  {
    icon: "⬡",
    title: "One platform, every client",
    body:  "Manage multiple properties and clients under one login. Each client gets their own branded portal.",
  },
  {
    icon: "⬡",
    title: "Tenants, leases & invoices",
    body:  "Everything in one place — maintenance requests, rent tracking, documents, and notices.",
  },
  {
    icon: "⬡",
    title: "Your brand, your domain",
    body:  "Each client deployment is fully branded. Your clients see your colors, your logo, your domain.",
  },
];

const steps = [
  { n: "01", title: "Create your account",   body: "Sign up with your company name and email. Takes 60 seconds." },
  { n: "02", title: "Add your properties",   body: "Import or manually add your properties and units." },
  { n: "03", title: "Invite your tenants",   body: "Send portal invites — tenants can view invoices, submit requests, and sign documents." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Nav */}
      <header className="border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-semibold tracking-tight text-foreground">
            {platformConfig.name}
          </span>
          <div className="flex items-center gap-6">
            <Link href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it works
            </Link>
            <Link href="/signin"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link href="/signup"
              className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-primary mb-5">
            {platformConfig.company}
          </p>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-foreground leading-tight mb-6">
            Real estate management,<br />built for agents.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            {platformConfig.description}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup"
              className="bg-primary text-primary-foreground px-7 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Start for free
            </Link>
            <Link href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              See how it works →
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border/40 bg-card">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <div className="grid md:grid-cols-3 gap-10">
              {features.map((f) => (
                <div key={f.title}>
                  <p className="text-2xl mb-4 text-primary">{f.icon}</p>
                  <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-t border-border/40">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <p className="text-xs tracking-[0.2em] uppercase text-primary mb-12 text-center">
              How it works
            </p>
            <div className="grid md:grid-cols-3 gap-10">
              {steps.map((s) => (
                <div key={s.n} className="border-t border-border/50 pt-6">
                  <p className="text-xs font-mono text-muted-foreground mb-3">{s.n}</p>
                  <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA banner */}
        <section className="border-t border-border/40 bg-card">
          <div className="max-w-6xl mx-auto px-6 py-20 text-center">
            <h2 className="text-3xl font-semibold text-foreground mb-4">
              Ready to get started?
            </h2>
            <p className="text-muted-foreground mb-8">
              Set up your account in under a minute. No credit card required.
            </p>
            <Link href="/signup"
              className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Create your account
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border/40">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {platformConfig.company}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            {platformConfig.domain}
          </p>
        </div>
      </footer>

    </div>
  );
}
