import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/40 mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          <div>
            <p className="font-display text-lg text-foreground mb-1">
              Reyes Rebollar Properties LLC
            </p>
            <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
              El Cajon, California
            </p>
            <p className="text-xs text-muted-foreground mt-5">
              © {new Date().getFullYear()} Reyes Rebollar Properties LLC
            </p>
          </div>

          <div className="flex gap-14">
            <div>
              <p className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground mb-4">
                Navigate
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
                <Link href="/properties" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Properties
                </Link>
              </div>
            </div>
            <div>
              <p className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground mb-4">
                Contact
              </p>
              <a
                href="mailto:reyes@reyesrebollar.com"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                reyes@reyesrebollar.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
