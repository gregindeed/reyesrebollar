export function Footer() {
  return (
    <footer className="border-t bg-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Reyes Rebollar Properties LLC. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Committed to excellence in real estate holdings, development, and property management.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            <a
              href="mailto:info@reyesrebollar.com"
              className="hover:text-primary transition-colors"
            >
              info@reyesrebollar.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
