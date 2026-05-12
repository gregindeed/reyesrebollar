"use client";

import { useState } from "react";
import { siteConfig } from "@/site.config";

// ─────────────────────────────────────────────────────────────────────────────
// Brand Assets Page
// Route: /assets
// Purpose: Central hub for all publicly-hosted brand images.
//   Add files to /public/assets/* and register them in the ASSETS array below.
//   The page displays each asset with its live HTTPS URL and a copy button —
//   useful for email signatures, social media, and other external references.
// ─────────────────────────────────────────────────────────────────────────────

const BASE = siteConfig.siteUrl; // "https://reyesrebollar.com"

interface Asset {
  label:       string;
  description: string;
  path:        string;   // relative to /public — becomes the URL path
  category:    string;
  width?:      number;
  height?:     number;
}

const ASSETS: Asset[] = [
  // ── Logos ────────────────────────────────────────────────────────────────
  {
    label:       "RR Crown Logo",
    description: "Primary mark — crown with lemon motif, olive gold on transparent background. Use for email signatures and official documents.",
    path:        "/assets/brand/rr-logo.png",
    category:    "Logo",
  },
  {
    label:       "Site Logo",
    description: "Logo variant used in the website header.",
    path:        "/logo.png",
    category:    "Logo",
  },
  {
    label:       "Reyes Rebollar Wordmark",
    description: "Full wordmark logo variant.",
    path:        "/reyesrebollar_logo.png",
    category:    "Logo",
  },
  // ── Photography ──────────────────────────────────────────────────────────
  {
    label:       "El Cajon Aerial",
    description: "Aerial photography of El Cajon — used as hero or section background.",
    path:        "/el-cajon-aerial.jpg",
    category:    "Photography",
  },
  {
    label:       "San Diego Hero",
    description: "San Diego cityscape — secondary hero option.",
    path:        "/san-diego-hero.jpg",
    category:    "Photography",
  },
];

const CATEGORIES = ["All", ...Array.from(new Set(ASSETS.map((a) => a.category)))];

// ─── Copy-to-clipboard hook ───────────────────────────────────────────────────

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    });
  };
  return { copied, copy };
}

// ─── Asset card ───────────────────────────────────────────────────────────────

function AssetCard({ asset, onCopy, justCopied }: {
  asset: Asset;
  onCopy: (text: string) => void;
  justCopied: string | null;
}) {
  const url = `${BASE}${asset.path}`;
  const isCopied = justCopied === url;

  return (
    <div style={{
      background:   "var(--card)",
      border:       "1px solid var(--border)",
      borderRadius: "var(--radius)",
      overflow:     "hidden",
      display:      "flex",
      flexDirection:"column",
    }}>

      {/* Preview */}
      <div style={{
        background:     "oklch(0.90 0.018 78)",
        borderBottom:   "1px solid var(--border)",
        height:         "160px",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        overflow:       "hidden",
        position:       "relative",
      }}>
        {/* Checkerboard for transparent images */}
        <div style={{
          position:   "absolute",
          inset:      0,
          backgroundImage: `
            linear-gradient(45deg, oklch(0.85 0.015 78) 25%, transparent 25%),
            linear-gradient(-45deg, oklch(0.85 0.015 78) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, oklch(0.85 0.015 78) 75%),
            linear-gradient(-45deg, transparent 75%, oklch(0.85 0.015 78) 75%)
          `,
          backgroundSize:     "16px 16px",
          backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
          opacity: 0.5,
        }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset.path}
          alt={asset.label}
          style={{
            maxWidth:   "80%",
            maxHeight:  "130px",
            objectFit:  "contain",
            position:   "relative",
            zIndex:     1,
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            const parent = (e.target as HTMLImageElement).parentElement;
            if (parent) {
              const placeholder = document.createElement("div");
              placeholder.style.cssText = "position:relative;z-index:1;font-size:12px;color:oklch(0.55 0.022 65);text-align:center;padding:16px;";
              placeholder.textContent = "File not yet uploaded";
              parent.appendChild(placeholder);
            }
          }}
        />
      </div>

      {/* Info */}
      <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: "14px", color: "var(--foreground)" }}>
              {asset.label}
            </p>
            <span style={{
              display:      "inline-block",
              fontSize:     "10px",
              fontWeight:   500,
              letterSpacing:"0.06em",
              textTransform:"uppercase",
              color:        "var(--terracotta)",
              marginTop:    "2px",
            }}>
              {asset.category}
            </span>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: "12px", color: "var(--muted-fg)", lineHeight: 1.5, flex: 1 }}>
          {asset.description}
        </p>

        {/* URL row */}
        <div style={{
          display:      "flex",
          alignItems:   "center",
          gap:          "6px",
          background:   "var(--muted)",
          border:       "1px solid var(--border)",
          borderRadius: "calc(var(--radius) * 0.75)",
          padding:      "6px 8px",
          marginTop:    "4px",
        }}>
          <code style={{
            flex:       1,
            fontSize:   "10.5px",
            color:      "var(--muted-fg)",
            overflow:   "hidden",
            textOverflow:"ellipsis",
            whiteSpace: "nowrap",
            fontFamily: "monospace",
          }}>
            {url}
          </code>

          <button
            onClick={() => onCopy(url)}
            title="Copy URL"
            style={{
              flexShrink:   0,
              background:   isCopied ? "oklch(0.35 0.055 45)" : "transparent",
              border:       `1px solid ${isCopied ? "oklch(0.35 0.055 45)" : "var(--border)"}`,
              borderRadius: "calc(var(--radius) * 0.5)",
              cursor:       "pointer",
              padding:      "3px 8px",
              fontSize:     "10px",
              fontWeight:   500,
              color:        isCopied ? "oklch(0.95 0.015 78)" : "var(--muted-fg)",
              transition:   "all 0.15s ease",
              whiteSpace:   "nowrap",
            }}
          >
            {isCopied ? "✓ Copied" : "Copy URL"}
          </button>
        </div>

        {/* Direct link */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize:       "11px",
            color:          "var(--terracotta)",
            textDecoration: "none",
            display:        "flex",
            alignItems:     "center",
            gap:            "3px",
          }}
        >
          Open in browser ↗
        </a>

      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AssetsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { copied, copy } = useCopy();

  const filtered = ASSETS.filter(
    (a) => activeCategory === "All" || a.category === activeCategory
  );

  return (
    <main style={{
      maxWidth:  "1080px",
      margin:    "0 auto",
      padding:   "48px 24px 80px",
    }}>

      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <p style={{
          margin:        0,
          fontSize:      "11px",
          fontWeight:    500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color:         "var(--terracotta)",
          marginBottom:  "8px",
        }}>
          Reyes Rebollar Properties LLC
        </p>
        <h1 style={{
          margin:      0,
          fontSize:    "clamp(24px, 4vw, 36px)",
          fontWeight:  700,
          color:       "var(--foreground)",
          lineHeight:  1.15,
          marginBottom:"12px",
        }}>
          Brand Assets
        </h1>
        <p style={{
          margin:     0,
          fontSize:   "15px",
          color:      "var(--muted-fg)",
          maxWidth:   "560px",
          lineHeight: 1.6,
        }}>
          Hosted brand images for use in email signatures, documents, and external references.
          Copy any URL below — all assets are served over HTTPS from{" "}
          <strong style={{ color: "var(--foreground)" }}>reyesrebollar.com</strong>.
        </p>
      </div>

      {/* Category filter */}
      <div style={{
        display:      "flex",
        gap:          "8px",
        flexWrap:     "wrap",
        marginBottom: "28px",
      }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding:      "6px 16px",
              borderRadius: "100px",
              border:       `1px solid ${activeCategory === cat ? "oklch(0.35 0.055 45)" : "var(--border)"}`,
              background:   activeCategory === cat ? "oklch(0.35 0.055 45)" : "var(--card)",
              color:        activeCategory === cat ? "oklch(0.95 0.015 78)" : "var(--muted-fg)",
              fontSize:     "13px",
              fontWeight:   500,
              cursor:       "pointer",
              transition:   "all 0.15s ease",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap:                 "20px",
      }}>
        {filtered.map((asset) => (
          <AssetCard
            key={asset.path}
            asset={asset}
            onCopy={copy}
            justCopied={copied}
          />
        ))}
      </div>

      {/* Footer note */}
      <div style={{
        marginTop:    "48px",
        padding:      "20px 24px",
        background:   "var(--muted)",
        border:       "1px solid var(--border)",
        borderRadius: "var(--radius)",
        fontSize:     "12px",
        color:        "var(--muted-fg)",
        lineHeight:   1.6,
      }}>
        <strong style={{ color: "var(--foreground)" }}>Adding new assets:</strong>{" "}
        Drop files into <code style={{ fontFamily: "monospace" }}>/public/assets/brand/</code> and
        register them in the <code style={{ fontFamily: "monospace" }}>ASSETS</code> array
        at the top of <code style={{ fontFamily: "monospace" }}>app/assets/page.tsx</code>.
        After deploying, the file will be live at{" "}
        <code style={{ fontFamily: "monospace" }}>https://reyesrebollar.com/assets/brand/&lt;filename&gt;</code>.
      </div>

    </main>
  );
}
