import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RAPIDAPI_KEY  = Deno.env.get("RAPIDAPI_KEY")!;
const GOOGLE_KEY    = Deno.env.get("GOOGLE_MAPS_KEY")!;
const SUPABASE_URL  = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const RAPID_HEADERS = {
  "Content-Type": "application/json",
  "X-RapidAPI-Key": RAPIDAPI_KEY,
};

async function fetchWithFallback(urls: string[], headers: Record<string, string>) {
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === "object") return data;
      }
    } catch (_) { /* try next */ }
  }
  return null;
}

function extractPropertyData(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  // Handle nested structures from different APIs
  const d = (raw.data ?? raw.property ?? raw.home ?? raw.result ?? raw) as Record<string, unknown>;

  const get = (...keys: string[]) => {
    for (const k of keys) {
      if (d[k] !== undefined && d[k] !== null) return d[k];
      // Search one level deep
      for (const v of Object.values(d)) {
        if (v && typeof v === "object" && !Array.isArray(v)) {
          const vv = v as Record<string, unknown>;
          if (vv[k] !== undefined && vv[k] !== null) return vv[k];
        }
      }
    }
    return null;
  };

  out.beds        = get("beds", "bedrooms", "bedroom", "bed_num");
  out.baths       = get("baths", "bathrooms", "bath_num", "fullbaths");
  out.sqft        = get("sqft", "living_sqft", "building_sqft", "sqft_number");
  out.lot_sqft    = get("lot_sqft", "lot_size_sqft", "lotSize", "lot_size");
  out.year_built  = get("year_built", "yearBuilt", "built_year");
  out.zestimate   = get("zestimate", "estimatedValue", "estimate", "avm");
  out.last_sale_price = get("last_sold_price", "lastSalePrice", "price");
  out.last_sale_date  = get("last_sold_date", "lastSaleDate", "sold_date");
  out.apn         = get("apn", "parcel_number", "parcelId");
  out.property_type = get("property_type", "type", "home_type");

  // Photos
  const photos =
    d.photos ?? d.images ?? (d.media as Record<string, unknown>)?.photos ?? [];
  if (Array.isArray(photos) && photos.length > 0) {
    out.photos = (photos as Record<string, unknown>[])
      .slice(0, 6)
      .map((p) => p.href ?? p.url ?? p.image_url ?? p)
      .filter(Boolean);
  }

  // Sale history
  const hist =
    d.price_history ?? d.saleHistory ?? d.priceHistory ?? d.sale_history ?? [];
  if (Array.isArray(hist) && hist.length > 0) {
    out.sale_history = (hist as Record<string, unknown>[]).slice(0, 5).map((h) => ({
      date:  h.date ?? h.sold_date,
      price: h.price ?? h.sale_price,
      event: h.event ?? h.type ?? "Sale",
    }));
  }

  // Remove nulls
  return Object.fromEntries(Object.entries(out).filter(([_, v]) => v !== null));
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { property_id } = await req.json();

    const { data: property, error } = await supabase
      .from("properties")
      .select("*")
      .eq("id", property_id)
      .single();

    if (error || !property) {
      return new Response(JSON.stringify({ error: "Property not found" }), { status: 404, headers: CORS });
    }

    const { address, city, state, zip_code } = property;
    const fullAddress = `${address}, ${city}, ${state} ${zip_code}`;
    const encodedAddress = encodeURIComponent(fullAddress);

    // Google Street View URL (always works)
    const streetViewUrl = GOOGLE_KEY
      ? `https://maps.googleapis.com/maps/api/streetview?size=800x500&location=${encodedAddress}&fov=80&pitch=5&key=${GOOGLE_KEY}`
      : null;

    // Try multiple RapidAPI real estate endpoints
    const rawData = await fetchWithFallback([
      // US Real Estate Listings — property details by address
      `https://us-real-estate-listings.p.rapidapi.com/propertyDetail?address=${encodeURIComponent(address)}&city=${encodeURIComponent(city)}&state_code=${state}&zip=${zip_code}`,
      // ZLLW — Zillow by address
      `https://zllw-working-api.p.rapidapi.com/property/detail?address=${encodedAddress}`,
      `https://zllw-working-api.p.rapidapi.com/property?address=${encodeURIComponent(address)}&zipcode=${zip_code}`,
      // Realty US fallback
      `https://realty-us.p.rapidapi.com/properties/search-address?address=${encodedAddress}`,
    ], {
      ...RAPID_HEADERS,
      "X-RapidAPI-Host": "us-real-estate-listings.p.rapidapi.com",
    });

    const extracted = rawData ? extractPropertyData(rawData as Record<string, unknown>) : {};

    const meta = {
      street_view_url: streetViewUrl,
      ...extracted,
      raw_source: rawData ? "rapidapi" : "street_view_only",
      fetched_at: new Date().toISOString(),
    };

    await supabase.from("properties")
      .update({ meta, meta_fetched_at: new Date().toISOString() })
      .eq("id", property_id);

    return new Response(JSON.stringify({ success: true, meta }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
