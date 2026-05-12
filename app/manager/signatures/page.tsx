"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { COMPANY_ID } from "@/site.config";

// ─────────────────────────────────────────────────────────────────────────────
// Email Signatures vault — /manager/signatures
// Gated behind manager auth. Add new signatures to the SIGNATURES array below.
// ─────────────────────────────────────────────────────────────────────────────

interface Signature {
  id:          string;
  label:       string;
  description: string;
  html:        string;
}

const SIGNATURES: Signature[] = [
  {
    id:          "reyes-ops",
    label:       "Reyes Rebollar — Operations",
    description: "General operational email · reyes@reyesrebollar.com · Greg Anthony, Managing Principal",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Signature – Reyes Rebollar</title>
</head>
<body style="margin:0;padding:0;background:transparent;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0"
  style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica Neue,Arial,sans-serif;font-size:12px;color:#374151;max-width:480px;width:100%;border-collapse:collapse;">
  <tr>
    <td valign="middle" style="padding:0 18px 0 0;vertical-align:middle;width:96px;">
      <img src="https://reyesrebollar.com/assets/brand/rr-logo.png" alt="Reyes Rebollar Logo"
        width="96" height="auto"
        style="display:block;border:0;outline:none;text-decoration:none;max-width:96px;height:auto;" />
    </td>
    <td valign="middle" style="padding:0;vertical-align:middle;">
      <p style="margin:0 0 1px 0;font-size:14px;font-weight:600;color:#111827;letter-spacing:-0.01em;">Reyes Rebollar Properties LLC</p>
      <p style="margin:0 0 9px 0;font-size:12px;color:#374151;font-weight:400;">
        Greg Anthony <span style="color:#C9A84C;margin:0 4px;">·</span><span style="font-size:10.5px;color:#9CA3AF;letter-spacing:0.05em;text-transform:uppercase;"> Managing Principal</span>
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
        <tr><td style="background:#C9A84C;height:1px;width:160px;font-size:0;line-height:0;">&nbsp;</td></tr>
      </table>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:0 24px 5px 0;vertical-align:top;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="padding-right:6px;font-size:10px;color:#C9A84C;">&#9990;</td>
              <td style="font-size:11.5px;color:#4B5563;white-space:nowrap;">(619) 991-9982</td>
            </tr></table>
          </td>
          <td style="padding:0 0 5px 0;vertical-align:top;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="padding-right:6px;font-size:10px;color:#C9A84C;">&#9993;</td>
              <td style="font-size:11.5px;white-space:nowrap;">
                <a href="mailto:reyes@reyesrebollar.com" style="color:#4B5563;text-decoration:none;">reyes@reyesrebollar.com</a>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 24px 0 0;vertical-align:top;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="padding-right:6px;font-size:10px;color:#C9A84C;">&#127760;</td>
              <td style="font-size:11.5px;white-space:nowrap;">
                <a href="https://www.reyesrebollar.com" style="color:#C9A84C;text-decoration:none;font-weight:500;">www.reyesrebollar.com</a>
              </td>
            </tr></table>
          </td>
          <td style="padding:0;vertical-align:top;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="padding-right:6px;font-size:10px;color:#C9A84C;">&#9873;</td>
              <td style="font-size:11.5px;color:#6B7280;white-space:nowrap;">El Cajon, California</td>
            </tr></table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr><td colspan="2" style="padding:10px 0 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>
  <tr><td colspan="2" style="border-top:1px solid #F3F4F6;font-size:0;line-height:0;padding:0;">&nbsp;</td></tr>
  <tr>
    <td colspan="2" style="padding:7px 0 0 0;font-size:9.5px;color:#9CA3AF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica Neue,Arial,sans-serif;line-height:1.5;">
      <strong style="color:#6B7280;font-weight:500;">Confidentiality Notice:</strong>
      This email and any attachments are intended solely for the named recipient and may contain confidential or privileged information.
      If you have received this message in error, please notify the sender immediately and delete all copies.
      Unauthorized review, use, or distribution is strictly prohibited.
    </td>
  </tr>
</table>

</body>
</html>`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function SignaturesPage() {
  const router  = useRouter();
  const [ready, setReady]   = useState(false);
  const [unauth, setUnauth] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [active, setActive] = useState<string>(SIGNATURES[0].id);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/manager/login"); return; }
      const { data: m } = await supabase.from("company_members")
        .select("id, status").eq("user_id", session.user.id).eq("company_id", COMPANY_ID).single();
      if (!m || m.status !== "active") { setUnauth(true); setReady(true); return; }
      setReady(true);
    };
    init();
  }, [router]);

  const handleCopy = (html: string, id: string) => {
    navigator.clipboard.writeText(html).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2500);
    });
  };

  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (unauth) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <p className="text-sm font-medium text-foreground">Access denied</p>
      <p className="text-xs text-muted-foreground">This account is not authorized.</p>
    </div>
  );

  const current = SIGNATURES.find((s) => s.id === active) ?? SIGNATURES[0];

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-10 max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[0.62rem] tracking-[0.2em] uppercase text-terracotta mb-1">Manager Portal</p>
          <h1 className="font-display text-foreground" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)" }}>
            Email Signatures
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Copy the HTML source and paste it into your email client's signature editor.
          </p>
        </div>

        <div className="grid md:grid-cols-[220px_1fr] gap-6">

          {/* Sidebar — signature list */}
          <div className="space-y-1">
            <p className="text-[0.58rem] tracking-[0.16em] uppercase text-muted-foreground/60 px-3 mb-2">
              Available
            </p>
            {SIGNATURES.map((sig) => (
              <button
                key={sig.id}
                onClick={() => setActive(sig.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active === sig.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {sig.label}
              </button>
            ))}
          </div>

          {/* Main panel */}
          <div className="space-y-5">

            {/* Meta */}
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{current.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{current.description}</p>
                </div>
                <button
                  onClick={() => handleCopy(current.html, current.id)}
                  className={`shrink-0 text-[0.65rem] tracking-[0.1em] uppercase px-4 py-2 rounded-lg border transition-colors ${
                    copied === current.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  {copied === current.id ? "✓ Copied" : "Copy HTML"}
                </button>
              </div>
            </div>

            {/* Live preview */}
            <div>
              <p className="text-[0.58rem] tracking-[0.16em] uppercase text-muted-foreground/60 mb-2 px-1">
                Preview
              </p>
              <div className="bg-white border border-border/50 rounded-xl p-6 overflow-x-auto">
                <div dangerouslySetInnerHTML={{ __html: current.html }} />
              </div>
            </div>

            {/* Raw HTML */}
            <div>
              <p className="text-[0.58rem] tracking-[0.16em] uppercase text-muted-foreground/60 mb-2 px-1">
                HTML Source
              </p>
              <div className="bg-muted border border-border/50 rounded-xl p-5 overflow-x-auto">
                <pre className="text-[0.65rem] text-muted-foreground leading-relaxed whitespace-pre-wrap break-all font-mono">
                  {current.html}
                </pre>
              </div>
            </div>

            {/* Install instructions */}
            <div className="bg-card border border-border/50 rounded-xl p-5">
              <p className="text-[0.58rem] tracking-[0.16em] uppercase text-muted-foreground/60 mb-3">
                Installing in eM Client
              </p>
              <ol className="space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
                <li>Open eM Client → Preferences (⌘,) → Mail → Templates and Signatures</li>
                <li>Click <strong className="text-foreground font-medium">New</strong>, give it a name</li>
                <li>Click the <strong className="text-foreground font-medium">&lt;&nbsp;&gt;</strong> HTML source button in the editor</li>
                <li>Paste the copied HTML and click OK</li>
                <li>Assign as default for <strong className="text-foreground font-medium">reyes@reyesrebollar.com</strong> under Default Signatures</li>
              </ol>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
