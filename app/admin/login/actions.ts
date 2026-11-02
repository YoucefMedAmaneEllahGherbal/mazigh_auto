"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { hasShowroomOwnerMembership } from "@/app/data/admin-auth.server";

export type SignInState = { error: string } | null;

export async function signInAction(
  _previousState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");

  if (
    typeof emailValue !== "string" ||
    typeof passwordValue !== "string" ||
    !emailValue.trim() ||
    !passwordValue
  ) {
    return { error: "Saisissez votre adresse e-mail et votre mot de passe." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailValue.trim(),
    password: passwordValue,
  });

  if (error || !data.user) {
    return { error: "Adresse e-mail ou mot de passe incorrect." };
  }

  try {
    const isOwner = await hasShowroomOwnerMembership(supabase, data.user.id);

    if (!isOwner) {
      await supabase.auth.signOut();
      return { error: "Ce compte n’est pas autorisé à accéder au showroom." };
    }
  } catch {
    await supabase.auth.signOut();
    return {
      error: "Impossible de vérifier les accès pour le moment. Réessayez.",
    };
  }

  redirect("/admin");
}