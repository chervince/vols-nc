import { describe, expect, it } from "vitest";
import { parseCciFlights } from "./cci";

// Markup fidèle à la vraie page CCI (en-tête <th> + lignes <td data-label>).
const DEPARTURES_HTML = `
<table class="table cci-aeroport-flights is-responsive">
  <tr>
    <th>Date départ</th><th>Heure départ</th><th>Destination</th>
    <th>Compagnie</th><th>Numéro de vol</th><th>Observations</th>
  </tr>
  <tr>
    <td data-label="Date">16/07/2026</td>
    <td data-label="Heure">07:00</td>
    <td class="airport" data-label="Destination">Lifou</td>
    <td data-label="Compagnie">Air Calédonie</td>
    <td data-label="Numéro de vol">TY203</td>
    <td data-label="Observation">Décollé, Enreg fermé</td>
  </tr>
  <tr>
    <td data-label="Date">16/07/2026</td>
    <td data-label="Heure">09:40</td>
    <td class="airport" data-label="Destination">Mare</td>
    <td data-label="Compagnie">Air Calédonie</td>
    <td data-label="Numéro de vol">TY107</td>
    <td data-label="Observation">Annulé</td>
  </tr>
  <tr>
    <td data-label="Date">16/07/2026</td>
    <td data-label="Heure">16:20</td>
    <td class="airport" data-label="Destination">Sydney</td>
    <td data-label="Compagnie">Aircalin</td>
    <td data-label="Numéro de vol">SB140 / QF8692</td>
    <td data-label="Observation"></td>
  </tr>
  <tr>
    <td data-label="Date">16/07/2026</td>
    <td data-label="Heure">10:00</td>
    <td class="airport" data-label="Destination">Nandi</td>
    <td data-label="Compagnie">ZZ</td>
    <td data-label="Numéro de vol">ZZZKSUY</td>
    <td data-label="Observation">Parti</td>
  </tr>
</table>`;

const ARRIVALS_HTML = `
<table class="table cci-aeroport-flights is-responsive">
  <tr>
    <th>Date arrivée</th><th>Heure arrivée</th><th>Provenance</th>
    <th>Compagnie</th><th>Numéro de vol</th><th>Observations</th>
  </tr>
  <tr>
    <td data-label="Date">16/07/2026</td>
    <td data-label="Heure">14:55</td>
    <td class="airport" data-label="Provenance">Auckland</td>
    <td data-label="Compagnie">Aircalin</td>
    <td data-label="Numéro de vol">SB411</td>
    <td data-label="Observation">Atterri</td>
  </tr>
</table>`;

describe("parseCciFlights — départs", () => {
  const flights = parseCciFlights(DEPARTURES_HTML, "departure");

  it("ignore l'en-tête et parse les lignes de données", () => {
    expect(flights).toHaveLength(3);
  });

  it("écarte les entrées masquées (compagnie ZZ, numéro sans chiffre)", () => {
    expect(flights.some((f) => f.number === "ZZZKSUY")).toBe(false);
  });

  it("normalise un vol domestique Air Calédonie (NOU → Lifou)", () => {
    const ty = flights.find((f) => f.number === "TY203");
    expect(ty?.airline).toEqual({ name: "Air Calédonie", iata: "TY" });
    expect(ty?.departure.airport.iata).toBe("NOU");
    expect(ty?.arrival.airport.iata).toBe("LIF");
    expect(ty?.departure.scheduledTimeLocal).toBe("2026-07-16T07:00:00+11:00");
    // La CCI ne donne pas l'heure d'arrivée à destination.
    expect(ty?.arrival.scheduledTimeLocal).toBe("");
    expect(ty?.status).toBe("Departed");
  });

  it("mappe « Annulé » sur le statut Cancelled", () => {
    expect(flights.find((f) => f.number === "TY107")?.status).toBe("Cancelled");
  });

  it("ne garde que le vol opérant d'un partage de code", () => {
    const sb = flights.find((f) => f.number === "SB140");
    expect(sb?.arrival.airport.iata).toBe("SYD");
    expect(sb?.status).toBe("Scheduled");
  });
});

describe("parseCciFlights — arrivées", () => {
  it("place Nouméa côté arrivée et porte l'heure d'arrivée", () => {
    const [arr] = parseCciFlights(ARRIVALS_HTML, "arrival");
    expect(arr?.number).toBe("SB411");
    expect(arr?.arrival.airport.iata).toBe("NOU");
    expect(arr?.departure.airport.iata).toBe("AKL");
    expect(arr?.arrival.scheduledTimeLocal).toBe("2026-07-16T14:55:00+11:00");
    expect(arr?.departure.scheduledTimeLocal).toBe("");
    expect(arr?.status).toBe("Landed");
  });
});

describe("parseCciFlights — robustesse", () => {
  it("retourne un tableau vide si la table est absente", () => {
    expect(parseCciFlights("<html><body>rien</body></html>", "departure")).toEqual([]);
  });
});
