import Image from "next/image";
import Link from "next/link";
import { Building2 } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/reyesrebollar_logo.png"
            alt="Reyes Rebollar Properties"
            width={120}
            height={60}
            className="object-contain"
          />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Reyes Rebollar Properties LLC
            </h1>
            <p className="text-sm text-muted-foreground">Portfolio Management</p>
          </div>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Portfolio
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            About
          </Link>
          <Link
            href="/properties"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Properties
          </Link>
          <Link
            href="/analytics"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Analytics
          </Link>
        </nav>
      </div>
    </header>
  );
}
