import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, fetchFlights } from "./flights";

const TABLE = (rows: string) =>
  `<table class="table cci-aeroport-flights is-responsive">${rows}</table>`;

const DEPARTURES = TABLE(
  `<tr><th>Date</th><th>Heure</th><th>Destination</th><th>Compagnie</th><th>Numéro</th><th>Obs</th></tr>
   <tr><td>16/07/2026</td><td>07:00</td><td>Lifou</td><td>Air Calédonie</td><td>TY203</td><td></td></tr>`,
);
const ARRIVALS = TABLE(
  `<tr><th>Date</th><th>Heure</th><th>Provenance</th><th>Compagnie</th><th>Numéro</th><th>Obs</th></tr>
   <tr><td>16/07/2026</td><td>14:55</td><td>Auckland</td><td>Aircalin</td><td>SB411</td><td>Atterri</td></tr>`,
);

function htmlResponse(body: string, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => body,
  } as unknown as Response;
}

function stubFetch(...responses: Response[]) {
  const fn = vi.fn();
  for (const r of responses) {
    fn.mockResolvedValueOnce(r);
  }
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchFlights (source CCI)", () => {
  it("récupère départs + arrivées et les normalise", async () => {
    stubFetch(htmlResponse(DEPARTURES), htmlResponse(ARRIVALS));

    const result = await fetchFlights("2026-07-16");

    expect(result.departures).toHaveLength(1);
    expect(result.departures[0]?.number).toBe("TY203");
    expect(result.departures[0]?.arrival.airport.iata).toBe("LIF");
    expect(result.arrivals).toHaveLength(1);
    expect(result.arrivals[0]?.arrival.airport.iata).toBe("NOU");
  });

  it("interroge la CCI dans les deux sens, à la date au format JJ/MM/AAAA", async () => {
    const fn = stubFetch(htmlResponse(DEPARTURES), htmlResponse(ARRIVALS));

    await fetchFlights("2026-07-16");

    const urls = fn.mock.calls.map((call) => String(call[0]));
    expect(urls.some((u) => u.includes("way=departures"))).toBe(true);
    expect(urls.some((u) => u.includes("way=arrivals"))).toBe(true);
    expect(urls.every((u) => u.includes("16%2F07%2F2026"))).toBe(true);
  });

  it("lève une ApiError si la CCI répond en erreur", async () => {
    stubFetch(htmlResponse("", 502), htmlResponse("", 502));

    await expect(fetchFlights("2026-07-16")).rejects.toBeInstanceOf(ApiError);
  });
});
