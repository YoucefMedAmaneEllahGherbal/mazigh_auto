import { connection } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  // Forces request-time execution, so the result is never prerendered or cached
  await connection();

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("cars").select("id").limit(1);

    if (error) {
      console.error("Health check failed:", { code: error.code, message: error.message });
      return Response.json({ ok: false }, { status: 500, headers: { "Cache-Control": "no-store" } });
    }

    return Response.json(
      { ok: true, time: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    console.error("Health check error:", e);
    return Response.json({ ok: false }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
