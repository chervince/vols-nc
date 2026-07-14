import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatDateShort,
  formatFlightNumber,
  formatFlightStatus,
  formatTime,
  getAirportCity,
  getStatusClasses,
} from "./formatters";

describe("formatTime", () => {
  it("formate une heure ISO avec fuseau en HH:MM", () => {
    expect(formatTime("2026-01-15T08:30+11:00")).toBe("08:30");
  });

  it("convertit une heure UTC vers l'heure de Nouméa (UTC+11)", () => {
    expect(formatTime("2026-01-15T21:30Z")).toBe("08:30");
  });
});

describe("formatDate", () => {
  it("formate une date ISO en français lisible", () => {
    expect(formatDate("2026-01-15")).toBe("jeu. 15 janvier 2026");
  });
});

describe("formatDateShort", () => {
  it("formate une date ISO en format court", () => {
    expect(formatDateShort("2026-01-15")).toBe("15 janv.");
  });
});

describe("formatFlightStatus", () => {
  it("traduit chaque statut en français", () => {
    expect(formatFlightStatus("Scheduled")).toBe("Prévu");
    expect(formatFlightStatus("EnRoute")).toBe("En vol");
    expect(formatFlightStatus("Cancelled")).toBe("Annulé");
    expect(formatFlightStatus("Unknown")).toBe("Inconnu");
  });
});

describe("getStatusClasses", () => {
  it("associe un style au statut", () => {
    expect(getStatusClasses("Delayed")).toContain("amber");
    expect(getStatusClasses("Cancelled")).toContain("red");
  });
});

describe("formatFlightNumber", () => {
  it("supprime les espaces du numéro de vol", () => {
    expect(formatFlightNumber("SB 140")).toBe("SB140");
  });

  it("laisse intact un numéro sans espace", () => {
    expect(formatFlightNumber("SB140")).toBe("SB140");
  });
});

describe("getAirportCity", () => {
  it("retourne la ville pour un code IATA connu", () => {
    expect(getAirportCity("SYD")).toBe("Sydney");
    expect(getAirportCity("NOU")).toBe("Nouméa");
  });

  it("retourne le code IATA tel quel s'il est inconnu", () => {
    expect(getAirportCity("XXX")).toBe("XXX");
  });
});
