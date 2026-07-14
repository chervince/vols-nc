import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Le store persiste via localStorage, absent en environnement node.
vi.stubGlobal("localStorage", {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
});

// Le store calcule sa date initiale à l'import : on le (re)charge après avoir
// fixé l'horloge, pour tester l'état initial de façon déterministe.
async function loadStore(nowUtc: string) {
  vi.setSystemTime(new Date(nowUtc));
  vi.resetModules();
  const { useFiltersStore } = await import("./filters");
  return useFiltersStore;
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("getTodayDate (via l'état initial du store)", () => {
  it("utilise la date de Nouméa, pas l'UTC : le matin, UTC est encore la veille", async () => {
    // 20:00 UTC le 14 → 07:00 le 15 à Nouméa (UTC+11)
    const store = await loadStore("2026-07-14T20:00:00Z");
    expect(store.getState().selectedDate).toBe("2026-07-15");
  });

  it("reste sur le même jour quand Nouméa et UTC sont d'accord", async () => {
    // 02:00 UTC le 14 → 13:00 le 14 à Nouméa
    const store = await loadStore("2026-07-14T02:00:00Z");
    expect(store.getState().selectedDate).toBe("2026-07-14");
  });
});

describe("navigation de dates", () => {
  it("goToNextDay passe au lendemain, y compris en fin de mois", async () => {
    const store = await loadStore("2026-07-14T02:00:00Z");
    store.getState().setSelectedDate("2026-07-31");
    store.getState().goToNextDay();
    expect(store.getState().selectedDate).toBe("2026-08-01");
  });

  it("goToPreviousDay revient à la veille, y compris en début de mois", async () => {
    const store = await loadStore("2026-07-14T02:00:00Z");
    store.getState().setSelectedDate("2026-03-01");
    store.getState().goToPreviousDay();
    expect(store.getState().selectedDate).toBe("2026-02-28");
  });
});

describe("filtres", () => {
  it("met à jour le filtre de vols et l'aéroport sélectionné", async () => {
    const store = await loadStore("2026-07-14T02:00:00Z");
    store.getState().setFlightFilter("departures");
    store.getState().setSelectedAirport("SYD");
    expect(store.getState().flightFilter).toBe("departures");
    expect(store.getState().selectedAirport).toBe("SYD");
  });

  it("resetFilters revient à aujourd'hui (Nouméa) et remet les filtres", async () => {
    const store = await loadStore("2026-07-14T20:00:00Z");
    store.getState().setSelectedDate("2026-01-01");
    store.getState().setFlightFilter("arrivals");
    store.getState().setSelectedAirport("SYD");
    store.getState().resetFilters();
    expect(store.getState().selectedDate).toBe("2026-07-15");
    expect(store.getState().flightFilter).toBe("all");
    expect(store.getState().selectedAirport).toBeNull();
  });
});
