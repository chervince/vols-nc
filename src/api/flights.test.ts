import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, fetchFlights } from "./flights";

// Fausse réponse fetch minimale. Reproduit le comportement réel, y compris le
// corps vide d'un 204 dont `.json()` échoue — le bug qu'on couvre ici.
function fakeResponse(status: number, body?: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      if (body === undefined) {
        throw new SyntaxError("Unexpected end of JSON input");
      }
      return body;
    },
  } as unknown as Response;
}

// `fetchFlights` fait deux requêtes (matin + après-midi) : on enfile donc deux
// réponses par scénario.
function stubFetch(...responses: Response[]): void {
  const fn = vi.fn();
  for (const r of responses) {
    fn.mockResolvedValueOnce(r);
  }
  vi.stubGlobal("fetch", fn);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchFlights", () => {
  it("traite un 204 No Content comme aucun vol (ne plante pas sur un corps vide)", async () => {
    stubFetch(fakeResponse(204), fakeResponse(204));

    await expect(fetchFlights("2026-07-17")).resolves.toEqual({
      departures: [],
      arrivals: [],
    });
  });

  it("traite un 404 comme aucun vol", async () => {
    stubFetch(fakeResponse(404), fakeResponse(404));

    await expect(fetchFlights("2026-07-17")).resolves.toEqual({
      departures: [],
      arrivals: [],
    });
  });

  it("lève une ApiError sur 429 (limite atteinte)", async () => {
    stubFetch(fakeResponse(429), fakeResponse(429));

    await expect(fetchFlights("2026-07-17")).rejects.toBeInstanceOf(ApiError);
  });

  it("normalise départs et arrivées autour de Nouméa (NOU)", async () => {
    const morning = {
      departures: [
        {
          movement: {
            airport: { iata: "AKL", name: "Auckland" },
            scheduledTime: { utc: "2026-07-16T21:00Z", local: "2026-07-17T08:00+11:00" },
          },
          number: "SB 410",
          status: "Expected",
          isCargo: false,
          airline: { name: "Aircalin", iata: "SB" },
        },
      ],
      arrivals: [
        {
          movement: {
            airport: { iata: "BNE", name: "Brisbane" },
            scheduledTime: { utc: "2026-07-17T11:30Z", local: "2026-07-17T22:30+11:00" },
          },
          number: "SB 151",
          status: "Expected",
          isCargo: false,
          airline: { name: "Aircalin", iata: "SB" },
        },
      ],
    };
    stubFetch(fakeResponse(200, morning), fakeResponse(200, { departures: [], arrivals: [] }));

    const result = await fetchFlights("2026-07-17");

    expect(result.departures).toHaveLength(1);
    expect(result.arrivals).toHaveLength(1);

    const dep = result.departures[0];
    expect(dep?.departure.airport.iata).toBe("NOU");
    expect(dep?.arrival.airport.iata).toBe("AKL");
    expect(dep?.number).toBe("SB 410");

    const arr = result.arrivals[0];
    expect(arr?.arrival.airport.iata).toBe("NOU");
    expect(arr?.departure.airport.iata).toBe("BNE");
  });
});
