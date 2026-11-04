import { CarFront, CircleAlert, MessageCircle } from "lucide-react";
import { buildGenericWhatsAppUrl } from "@/lib/config";

type VehicleAvailabilityStateProps = {
  status: "empty" | "error";
};

export function VehicleAvailabilityState({ status }: VehicleAvailabilityStateProps) {
  const isEmpty = status === "empty";

  return (
    <div className="empty-state" role={isEmpty ? undefined : "alert"}>
      {isEmpty ? (
        <CarFront className="h-10 w-10" aria-hidden="true" />
      ) : (
        <CircleAlert className="h-10 w-10" aria-hidden="true" />
      )}
      <p>
        {isEmpty
          ? "Aucune voiture disponible pour le moment. Contactez-nous sur WhatsApp."
          : "Impossible de charger les véhicules pour le moment. Veuillez réessayer plus tard."}
      </p>
      {isEmpty && (
        <a href={buildGenericWhatsAppUrl()} target="_blank" rel="noreferrer" className="whatsapp-button is-small">
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          WhatsApp
        </a>
      )}
    </div>
  );
}
