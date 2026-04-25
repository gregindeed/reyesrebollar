import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL   = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function sendEmail(to: string, subject: string, body: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Georgia, serif; background: #f5f0e8; margin: 0; padding: 40px 20px;">
      <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden;">
        <div style="background: #3d2a1a; padding: 28px 36px;">
          <p style="color: #c9a87a; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 6px;">
            Reyes Rebollar Properties LLC
          </p>
          <p style="color: #f5f0e8; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; margin: 0;">
            Tenant Notice
          </p>
        </div>
        <div style="padding: 36px;">
          <h2 style="font-size: 20px; color: #1a1208; margin: 0 0 20px; font-weight: 400;">
            ${subject}
          </h2>
          <p style="font-size: 14px; color: #4a3a2a; line-height: 1.7; white-space: pre-wrap; margin: 0 0 28px;">
            ${body}
          </p>
          <a href="https://reyesrebollar.com/portal/notices"
             style="display: inline-block; background: #3d2a1a; color: #f5f0e8; font-size: 11px;
                    letter-spacing: 0.14em; text-transform: uppercase; text-decoration: none;
                    padding: 10px 20px; border-radius: 6px;">
            View in Portal
          </a>
        </div>
        <div style="background: #f5f0e8; padding: 20px 36px; border-top: 1px solid #e8dfd0;">
          <p style="font-size: 11px; color: #8a7a6a; margin: 0;">
            Reyes Rebollar Properties LLC &nbsp;·&nbsp; El Cajon, California<br>
            <a href="mailto:reyes@reyesrebollar.com" style="color: #8a7a6a;">reyes@reyesrebollar.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Reyes Rebollar Properties <reyes@reyesrebollar.com>",
      to,
      subject,
      html,
    }),
  });

  return res.ok;
}

Deno.serve(async (req) => {
  try {
    const { record } = await req.json();
    const { subject, body, sent_to_type, tenant_id, property_id } = record;

    let emails: string[] = [];

    if (sent_to_type === "all") {
      const { data } = await supabase
        .from("tenants")
        .select("email")
        .eq("status", "active");
      emails = data?.map((t: { email: string }) => t.email) ?? [];

    } else if (sent_to_type === "tenant" && tenant_id) {
      const { data } = await supabase
        .from("tenants")
        .select("email")
        .eq("id", tenant_id)
        .single();
      if (data?.email) emails = [data.email];

    } else if (sent_to_type === "property" && property_id) {
      // Get units at this property, then active leases, then tenants
      const { data: units } = await supabase
        .from("units")
        .select("id")
        .eq("property_id", property_id);

      const unitIds = units?.map((u: { id: string }) => u.id) ?? [];

      if (unitIds.length > 0) {
        const { data: leases } = await supabase
          .from("leases")
          .select("tenants(email)")
          .eq("status", "active")
          .in("unit_id", unitIds);

        emails = (leases ?? [])
          .map((l: { tenants: { email: string } | null }) => l.tenants?.email)
          .filter(Boolean) as string[];
      }
    }

    // Remove duplicates
    emails = [...new Set(emails)];

    // Send to all recipients
    const results = await Promise.allSettled(
      emails.map((email) => sendEmail(email, subject, body))
    );

    const sent  = results.filter((r) => r.status === "fulfilled" && r.value).length;
    const failed = results.length - sent;

    console.log(`Notice "${subject}" — sent: ${sent}, failed: ${failed}`);

    return new Response(
      JSON.stringify({ success: true, sent, failed, total: emails.length }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("send-notice-email error:", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
