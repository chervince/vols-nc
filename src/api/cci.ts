import type { Airline, Airport, Flight, FlightDirection, FlightStatus } from "@/types";

const NOUMEA_AIRPORT: Airport = {
  iata: "NOU",
  icao: "NWWW",
  name: "Nouméa La Tontouta",
};

// Libellé de ville tel qu'affiché par la CCI (parfois en capitales) → code IATA.
// Construit depuis le menu déroulant du formulaire de recherche CCI.
const CITY_TO_IATA: Record<string, string> = {
  APIA: "APW",
  AUCKLAND: "AKL",
  BANGKOK: "BKK",
  BRISBANE: "BNE",
  CAIRNS: "CNS",
  HONOLULU: "HIK",
  "ILE DES PINS": "ILP",
  LIFOU: "LIF",
  MAGENTA: "MGA",
  MARE: "MEE",
  MELBOURNE: "MEL",
  NANDI: "NAN",
  NOUMEA: "NOU",
  OUVEA: "UVE",
  PAPEETE: "PPT",
  "PARIS CDG": "CDG",
  "PORT-VILA": "VLI",
  SINGAPOUR: "SIN",
  SYDNEY: "SYD",
  WALLIS: "WLS",
};

// Majuscules sans accents, pour un appariement robuste des libellés.
function deburrUpper(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase()
    .trim();
}

function toAirport(city: string): Airport {
  const key = deburrUpper(city);
  return {
    iata: CITY_TO_IATA[key] ?? key.slice(0, 3),
    name: city.trim(),
  };
}

// Colonne « Observations » de la CCI (texte libre) → statut normalisé.
function toStatus(raw: string): FlightStatus {
  const s = deburrUpper(raw);
  if (s === "") return "Scheduled";
  if (s.includes("ANNUL")) return "Cancelled";
  if (s.includes("DECOLL") || s.includes("PARTI")) return "Departed";
  if (s.includes("ATTERR") || s.includes("ARRIV")) return "Landed";
  if (s.includes("RETARD")) return "Delayed";
  if (s.includes("EMBARQU") || s.includes("ENREGISTR")) return "Expected";
  return "Unknown";
}

// "SB140 / QF8692" → on garde le vol opérant (premier numéro).
function primaryNumber(raw: string): string {
  return raw.split("/")[0]?.trim() ?? raw.trim();
}

function toAirline(name: string, flightNumber: string): Airline {
  return {
    name: name.trim(),
    iata: flightNumber.slice(0, 2).toUpperCase(),
  };
}

// "18/07/2026" + "07:00" → ISO local Nouméa "2026-07-18T07:00:00+11:00".
// Les horaires CCI sont déjà exprimés en heure locale de Nouméa (UTC+11).
function toIsoLocal(dmy: string, hm: string): string {
  const [d, m, y] = dmy.split("/");
  if (d === undefined || m === undefined || y === undefined) return "";
  if (!/^\d{1,2}:\d{2}$/.test(hm)) return "";
  const [h, min] = hm.split(":");
  return `${y}-${m}-${d}T${(h ?? "").padStart(2, "0")}:${min}:00+11:00`;
}

interface CciRow {
  date: string;
  time: string;
  city: string;
  airline: string;
  flight: string;
  status: string;
}

// Extrait les lignes de données du tableau `table.cci-aeroport-flights`.
// Parseur volontairement simple sur un HTML régulier et server-rendered ; la
// fragilité inhérente au scraping est assumée dans l'ADR-0004 et couverte par
// des tests sur HTML réel.
function extractRows(html: string): CciRow[] {
  const table = html.match(
    /<table[^>]*class="[^"]*cci-aeroport-flights[^"]*"[\s\S]*?<\/table>/,
  )?.[0];
  if (table === undefined) return [];

  const rows: CciRow[] = [];
  for (const tr of table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
    const cells = [...(tr[1] ?? "").matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map((cell) =>
      (cell[1] ?? "")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    );
    const date = cells[0] ?? "";
    // Ignore l'en-tête et toute ligne non conforme : une ligne de données
    // commence par une date JJ/MM/AAAA.
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date)) continue;
    rows.push({
      date,
      time: cells[1] ?? "",
      city: cells[2] ?? "",
      airline: cells[3] ?? "",
      flight: cells[4] ?? "",
      status: cells[5] ?? "",
    });
  }
  return rows;
}

// Transforme une page CCI (départs ou arrivées) en vols normalisés. Le côté
// Nouméa porte l'heure connue ; le côté distant n'a pas d'heure — la CCI ne
// donne qu'un seul horaire par vol et par sens.
export function parseCciFlights(html: string, direction: FlightDirection): Flight[] {
  return extractRows(html).map((row) => {
    const remote = toAirport(row.city);
    const noumea = {
      airport: NOUMEA_AIRPORT,
      scheduledTimeLocal: toIsoLocal(row.date, row.time),
    };
    const distant = { airport: remote, scheduledTimeLocal: "" };
    const number = primaryNumber(row.flight);
    return {
      number,
      status: toStatus(row.status),
      airline: toAirline(row.airline, number),
      departure: direction === "departure" ? noumea : distant,
      arrival: direction === "departure" ? distant : noumea,
    };
  });
}
