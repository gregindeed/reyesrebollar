// components/ThemeInjector.tsx
// Server Component — injects brand color tokens as CSS variables into <head>.
// This is what allows each propframe deployment to have a distinct visual
// identity without touching globals.css.

import { siteConfig } from "@/site.config";

export function ThemeInjector() {
  const t = siteConfig.theme;
  return (
    <style>{`
      :root {
        --radius: ${t.radius};

        --background: ${t.background};
        --foreground: ${t.foreground};

        --card: ${t.card};
        --card-foreground: ${t.foreground};

        --popover: ${t.card};
        --popover-foreground: ${t.foreground};

        --primary: ${t.primary};
        --primary-foreground: ${t.primaryFg};

        --secondary: ${t.secondary};
        --secondary-foreground: ${t.foreground};

        --muted: ${t.muted};
        --muted-foreground: ${t.mutedFg};

        --accent: ${t.accent};
        --accent-foreground: ${t.accentFg};

        --destructive: oklch(0.577 0.245 27.325);

        --border: ${t.border};
        --input: ${t.border};
        --ring: ${t.ring};

        --sidebar: ${t.background};
        --sidebar-foreground: ${t.foreground};
        --sidebar-primary: ${t.primary};
        --sidebar-primary-foreground: ${t.primaryFg};
        --sidebar-accent: ${t.accent};
        --sidebar-accent-foreground: ${t.accentFg};
        --sidebar-border: ${t.border};
        --sidebar-ring: ${t.ring};

        --ink: ${t.ink};
        --ink-foreground: ${t.inkFg};
        --accent-brass: ${t.terracotta};
        --accent-sage-light: ${t.sageLight};
      }

      .text-terracotta { color: ${t.terracotta}; }
      .text-brass { color: var(--accent-brass); }
      .text-sage-light { color: var(--accent-sage-light); }
      .bg-sage-light { background-color: var(--accent-sage-light); }

      /* Premium dark sections */
      .bg-ink { background-color: var(--ink); }
      .text-on-ink { color: var(--ink-foreground); }
      .bg-ink .text-foreground { color: var(--ink-foreground); }
      .bg-ink .text-muted-foreground { color: color-mix(in oklab, var(--ink-foreground) 60%, transparent); }
    `}</style>
  );
}
