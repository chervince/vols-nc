import type { FlightsResponse } from "@/types";
import { parseCciFlights } from "./cci";

// Le proxy (nginx en prod, Vite en dev) réécrit /cci vers aeroports.cci.nc.
const CCI_ENDPOINT = "/cci/fr/tontouta/vols/recherche";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// AAAA-MM-JJ → JJ/MM/AAAA (format attendu par le formulaire CCI).
function toFrenchDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d ?? ""}/${m ?? ""}/${y ?? ""}`;
}

async function fetchWay(date: string, way: "departures" | "arrivals"): Promise<string> {
  const url = `${CCI_ENDPOINT}?way=${way}&date=${encodeURIComponent(toFrenchDate(date))}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new ApiError(
      `Erreur lors de la récupération des vols (${response.status})`,
      response.status,
    );
  }
  return response.text();
}

// Récupère tous les vols commerciaux de Nouméa - La Tontouta pour une date,
// depuis le tableau officiel de l'aéroport (CCI-NC). Voir ADR-0004.
export async function fetchFlights(date: string): Promise<FlightsResponse> {
  const [departuresHtml, arrivalsHtml] = await Promise.all([
    fetchWay(date, "departures"),
    fetchWay(date, "arrivals"),
  ]);

  return {
    departures: parseCciFlights(departuresHtml, "departure"),
    arrivals: parseCciFlights(arrivalsHtml, "arrival"),
  };
}
