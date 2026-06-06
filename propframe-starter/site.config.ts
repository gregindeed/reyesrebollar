// site.config.ts — propframe platform identity
// This is the neutral platform shell, NOT a client deployment.
// Client-specific config lives in each client's own repo.

export const platformConfig = {
  name:        "propframe",
  tagline:     "Real estate management, built for agents.",
  description: "A modern platform for real estate agents to manage properties, tenants, leases, and clients — all in one place.",
  domain:      "propframe.drkm.io",
  supportEmail:"hello@drkm.io",
  company:     "Drk Matter Labs",
  logomark:    "PF",   // text fallback until logo asset is ready

  // Admin access — only these emails can access /admin
  adminEmails: [
    "rovelo.ga@gmail.com",
    "reyes@reyesrebollar.com",
  ],
} as const;
