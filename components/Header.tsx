import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="bg-background/90 backdrop-blur-sm sticky top-0 z-50 border-b border-border/40">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/reyesrebollar_logo.png"
            alt="Reyes Rebollar Properties"
            width={36}
            height={36}
            className="object-contain opacity-90"
          />
          <div>
            <p className="text-sm font-medium tracking-wide leading-tight">
              Reyes Rebollar Properties LLC
            </p>
            <p className="text-[0.65rem] tracking-[0.18em] uppercase text-muted-foreground leading-tight">
              Real Estate Holdings
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-8">
          <Link
            href="/properties"
            className="text-xs tracking-[0.12em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            Properties
          </Link>
        </nav>
      </div>
    </header>
  );
}
