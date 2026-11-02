import { CarFront, CircleAlert, MessageCircle } from "lucide-react";
import { buildGenericWhatsAppUrl } from "@/lib/config";

type VehicleAvailabilityStateProps = {
  status: "empty" | "error";
};

export function VehicleAvailabilityState({ status }: VehicleAvailabilityStateProps) {
  const isEmpty = status === "empty";

  return (
    <div className="bg-[#141414] border border-[#262626] rounded-2xl p-8 sm:p-12 text-center space-y-4">
      {isEmpty ? (
        <CarFront className="w-12 h-12 text-gray-500 mx-auto" aria-hidden="true" />
      ) : (
        <CircleAlert className="w-12 h-12 text-gray-500 mx-auto" aria-hidden="true" />
      )}
      <p className="text-sm sm:text-base text-gray-300">
        {isEmpty
          ? "Aucune voiture disponible pour le moment. Contactez-nous sur WhatsApp."
          : "Impossible de charger les véhicules pour le moment. Veuillez réessayer plus tard."}
      </p>
      {isEmpty && (
        <a
          href={buildGenericWhatsAppUrl()}
          target="_blank"
          rel="noreferrer"
          className="whatsapp-button inline-flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" aria-hidden="true" />
          WhatsApp
        </a>
      )}
    </div>
  );
}
