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
  heroImagePath:    "/images/herigate_img.png",
  heroImageAlt:     "Michoacán countryside at dawn — the roots of the family",
  heroImageCaption: "Los Limones, Michoacán",

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
    "From Michoacán to Southern California — " +
    "we carry the values our family has always known.",

  originSectionLabel: "From Los Limones, Michoacán",
  originHeading:      "Roots that run deep",
  originParagraphs: [
    "The Reyes Rebollar family story begins in the fertile lands of Los Limones — a town named for the lime groves that generations of our family cultivated. Every season brought rich harvests, but more importantly, it planted values that would outlast any crop.",
    "When the family crossed into California, they left the soil behind but carried the spirit whole and intact. The landscape changed. The principles never did.",
    "Reyes Rebollar Properties LLC was founded on that understanding. Each property in our portfolio is not just an asset — it is a commitment, a piece of something we are building to last.",
  ],
  originImagePath: "/images/loslimon_img.png",
  originImageAlt:  "The lime groves of Los Limones, Michoacán",

  closingQuote:
    "\"From the soil of Michoacán to the streets of California — " +
    "our roots run deep, and our future grows bright.\"",

  // ── Pillars (the spirit the family carries) ───────────────────────────────
  pillarsLabel:   "The Spirit We Carry",
  pillarsHeading: "Three roots. One legacy.",
  pillarsIntro:
    "From the lime groves of Los Limones, the family brought more than memory — " +
    "they brought a way of living. Three principles, never set down, never strayed from.",

  values: [
    {
      title: "Hard Work",
      body:  "Long before the first property, there were the groves — and work that began before sunrise and ended well after dark. That same tireless effort is poured into everything we hold today. We have never feared the long road, because we have always known it is the only one that leads somewhere worth going.",
    },
    {
      title: "Resilience",
      body:  "Seasons fail. Markets turn. The family has weathered both and never once let go of the path. What began in Los Limones did not survive by luck — it survived by refusing to quit. We carry that same resolve: steady through every storm, never tiring of the call.",
    },
    {
      title: "Integrity",
      body:  "A handshake in the grove meant something — and it still does. We do what we say, and we say only what is true. Every tenant, partner, and neighbor is owed the same honesty our family was raised on, because a legacy built on anything less is no legacy at all.",
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
    "pillars",
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
    background:  "oklch(0.987 0.002 200)", // clean cool white
    foreground:  "oklch(0.25 0.008 250)",  // charcoal
    card:        "oklch(0.965 0.004 200)", // soft panel
    primary:     "oklch(0.27 0.010 255)",  // charcoal ink (CTAs)
    primaryFg:   "oklch(0.98 0.003 200)",
    secondary:   "oklch(0.95 0.004 200)",
    muted:       "oklch(0.95 0.004 200)",
    mutedFg:     "oklch(0.49 0.012 250)",  // cool gray
    accent:      "oklch(0.94 0.018 150)",  // faint sage wash
    accentFg:    "oklch(0.34 0.045 150)",
    border:      "oklch(0.905 0.005 220)", // cool hairline
    ring:        "oklch(0.52 0.05 150)",   // sage focus
    terracotta:  "oklch(0.52 0.052 150)",  // muted sage accent (overlines)
    sageLight:   "oklch(0.74 0.058 150)",  // sage for dark backgrounds
    ink:         "oklch(0.205 0.012 255)", // cool charcoal (dark sections)
    inkFg:       "oklch(0.95 0.004 200)",  // light text on ink
    radius:      "0.45rem",
    radixAccent: "grass",
    radixGray:   "sage",
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
