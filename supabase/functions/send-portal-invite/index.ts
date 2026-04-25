import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL   = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

Deno.serve(async (req) => {
  try {
    const { tenant_id, tenant_name, tenant_email } = await req.json();

    // Generate magic link via Supabase Admin API
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: tenant_email,
      options: { redirectTo: "https://reyesrebollar.com/portal/dashboard" },
    });

    if (linkError || !linkData?.properties?.action_link) {
      return new Response(
        JSON.stringify({ success: false, error: linkError?.message ?? "Failed to generate link" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const magicLink = linkData.properties.action_link;

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
              Tenant Portal Access
            </p>
          </div>
          <div style="padding: 36px;">
            <h2 style="font-size: 20px; color: #1a1208; margin: 0 0 16px; font-weight: 400;">
              Welcome to your tenant portal, ${tenant_name ?? tenant_email}
            </h2>
            <p style="font-size: 14px; color: #4a3a2a; line-height: 1.7; margin: 0 0 24px;">
              Your property manager has set up your account. Through your portal you can view your lease,
              check your balance, pay rent, submit maintenance requests, and receive notices.
            </p>
            <a href="${magicLink}"
               style="display: inline-block; background: #3d2a1a; color: #f5f0e8; font-size: 11px;
                      letter-spacing: 0.14em; text-transform: uppercase; text-decoration: none;
                      padding: 12px 24px; border-radius: 6px; margin-bottom: 20px;">
              Access Your Portal
            </a>
            <p style="font-size: 12px; color: #8a7a6a; margin: 0;">
              This link expires in 24 hours. If you didn't expect this email, contact
              <a href="mailto:reyes@reyesrebollar.com" style="color: #5a4a3a;">reyes@reyesrebollar.com</a>.
            </p>
          </div>
          <div style="background: #f5f0e8; padding: 20px 36px; border-top: 1px solid #e8dfd0;">
            <p style="font-size: 11px; color: #8a7a6a; margin: 0;">
              Reyes Rebollar Properties LLC &nbsp;·&nbsp; El Cajon, California
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
        to: tenant_email,
        subject: "Your Tenant Portal Access — Reyes Rebollar Properties",
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ success: false, error: err }), { status: 500 });
    }

    // Update portal_invited_at
    await supabase.from("tenants")
      .update({ portal_invited_at: new Date().toISOString() })
      .eq("id", tenant_id);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
