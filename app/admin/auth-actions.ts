"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function signOutAction() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) {
    console.error("Supabase sign-out failed:", {
      status: error.status,
      code: error.code,
    });
    throw new Error("Unable to sign out. Please try again.");
  }

  redirect("/admin/login");
}