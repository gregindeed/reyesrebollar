// site.config.ts
// ─────────────────────────────────────────────────────────────────────────────
// All identity-specific values for this deployment live here.
// To onboard a new client: duplicate the repo, fill in this file,
// swap public/brand/ assets, and point .env.local to their Supabase project.
//
// Project:  propframe — config-driven real estate website template
// Client:   Reyes Rebollar Properties LLC
// Domain:   reyesrebollar.com  |  reyesrebollar.propframe.drkm.io
// ─────────────────────────────────────────────────────────────────────────────

export const siteConfig = {

  // ── Identity ──────────────────────────────────────────────────────────────
  companyName:   "Reyes Rebollar Properties LLC",
  companyShort:  "Reyes Rebollar",
  subtitle:      "Real Estate Holdings",
  logoPath:      "/reyesrebollar_logo.png",
  heroImagePath: "/el-cajon-aerial.jpg",
  heroImageAlt:  "El Cajon, California",

  // ── URLs ──────────────────────────────────────────────────────────────────
  siteUrl:          "https://reyesrebollar.com",
  adminEmailDomain: "@reyesrebollar.com",  // restricts manager account setup

  // ── Contact ───────────────────────────────────────────────────────────────
  email: "reyes@reyesrebollar.com",

  // ── Location ──────────────────────────────────────────────────────────────
  city:            "El Cajon, California",
  locationTagline: "Los Limones, Michoacán · El Cajon, California",

  // ── Hero pillars (animated list on the homepage) ──────────────────────────
  pillars: [
    "Residential Holdings",
    "Commercial Properties",
    "El Cajon, California",
    "Family Partnership",
    "Est. 2023",
  ],

  // ── Homepage copy ─────────────────────────────────────────────────────────
  heroDescription:
    "A family real estate holding company building lasting value in " +
    "Southern California — rooted in legacy, guided by integrity.",

  openingStatement:
    "From the lime groves of Los Limones to the hills of El Cajon — " +
    "we carry the same values our family has always known.",

  originSectionLabel: "From Los Limones, Michoacán",
  originHeading:      "Roots that run deep",
  originParagraphs: [
    "The Reyes Rebollar family story begins in the fertile lands of Los Limones — a town named for the lime groves that generations of our family cultivated. Every season brought rich harvests, but more importantly, it planted values that would outlast any crop.",
    "Hard work. Integrity. Family. These weren't lessons taught in a classroom — they were lived in the fields, passed quietly from one generation to the next. When the family came to California, they brought those values with them, whole and intact. The landscape changed. The principles didn't.",
    "Reyes Rebollar Properties LLC was founded on that understanding. Each property in our portfolio is not just an asset — it is a commitment, a piece of something we are building to last.",
  ],

  closingQuote:
    "\"From the soil of Michoacán to the streets of California — " +
    "our roots run deep, and our future grows bright.\"",

  // ── Values ────────────────────────────────────────────────────────────────
  values: [
    {
      title: "Honesty & Integrity",
      body:  "Our word is our bond — every transaction and relationship conducted with the same straightforward honesty our family has always lived by.",
    },
    {
      title: "Hard Work",
      body:  "From the lime groves at dawn to managing properties today, what you build is only as strong as the effort you put in.",
    },
    {
      title: "Long-Term Vision",
      body:  "Like farmers who plant for future harvests, we build for generations — with patience, foresight, and a commitment to lasting value.",
    },
    {
      title: "Family First",
      body:  "Every decision is made with the collective good in mind. Our strength comes from unity, just as a grove is stronger than a single tree.",
    },
  ],

  // ── Team members (used by TeamSection — leave empty to hide) ─────────────
  team: [
    // Example shape — populate to enable the team section:
    // { name: "Greg Reyes", role: "Principal", bio: "...", photo: "/brand/team/greg.jpg" },
  ] as Array<{ name: string; role: string; bio: string; photo: string }>,

  // ── Testimonials (used by TestimonialsSection — leave empty to hide) ──────
  testimonials: [
    // Example shape:
    // { quote: "Working with Reyes Rebollar was seamless...", author: "Jane D.", role: "Tenant" },
  ] as Array<{ quote: string; author: string; role: string }>,

  // ── Contact CTA (used by ContactCTASection) ───────────────────────────────
  contactCTA: {
    heading:    "Ready to find your next property?",
    subheading: "Get in touch and we'll respond within one business day.",
    buttonText: "Contact Us",
  },

  // ── Page sections ─────────────────────────────────────────────────────────
  // Controls which sections appear on the public homepage, and in what order.
  // Remove a key to hide that section. Reorder to change page flow.
  //
  // Available sections:
  //   "hero"               — full hero with image, pillars, and CTA
  //   "opening-statement"  — large pull-quote intro paragraph
  //   "origin-story"       — brand narrative + values grid
  //   "holdings"           — live property listings from Supabase
  //   "team"               — team member cards (requires siteConfig.team)
  //   "testimonials"       — client quotes (requires siteConfig.testimonials)
  //   "contact-cta"        — contact call-to-action banner
  //   "closing-quote"      — full-width closing quote
  //
  sections: [
    "hero",
    "opening-statement",
    "origin-story",
    "holdings",
    "closing-quote",
  ] as string[],

  // ── SEO metadata ──────────────────────────────────────────────────────────
  metaTitle:       "Reyes Rebollar Properties LLC",
  metaDescription: "A family real estate holding company building lasting value in El Cajon, California. Rooted in Los Limones, Michoacán.",

  // ── Theme tokens ──────────────────────────────────────────────────────────
  // All colors use OKLCH. Swap these values to fully retheme a deployment.
  // Radix accent/gray must match a valid Radix UI Themes color name.
  theme: {
    background:  "oklch(0.93 0.02 80)",    // warm sand
    foreground:  "oklch(0.17 0.025 48)",   // dark warm clay
    card:        "oklch(0.97 0.012 78)",
    primary:     "oklch(0.35 0.055 45)",   // deep umber
    primaryFg:   "oklch(0.95 0.015 78)",
    secondary:   "oklch(0.88 0.02 78)",
    muted:       "oklch(0.88 0.02 78)",
    mutedFg:     "oklch(0.50 0.022 65)",
    accent:      "oklch(0.88 0.02 78)",
    accentFg:    "oklch(0.17 0.025 48)",
    border:      "oklch(0.83 0.024 75)",   // warm tan
    ring:        "oklch(0.35 0.055 45)",
    terracotta:  "oklch(0.52 0.11 42)",    // decorative overline color
    radius:      "0.25rem",
    radixAccent: "bronze",
    radixGray:   "sand",
  },

} as const;

export type SiteConfig = typeof siteConfig;

// ─────────────────────────────────────────────────────────────────────────────
// Runtime company identity — driven by NEXT_PUBLIC_COMPANY_ID env var.
//
// Each Cloudflare Pages deployment sets this to the UUID of the company row
// in the shared Supabase `companies` table.  All Supabase queries that need
// a company scope should use this value.
//
// If this is empty at runtime, manager auth will fail with a clear error so
// misconfigured deployments fail loudly rather than silently cross-pollinating
// data across companies.
// ─────────────────────────────────────────────────────────────────────────────
export const COMPANY_ID: string =
  process.env.NEXT_PUBLIC_COMPANY_ID ?? "";
