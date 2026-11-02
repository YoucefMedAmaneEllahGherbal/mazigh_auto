import { redirect } from "next/navigation";

export default function LegacyAdminVehiculesRedirect() {
  redirect("/admin/voitures/nouveau");
}
