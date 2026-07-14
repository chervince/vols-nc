import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FlightFilter } from "@/types";

// Date du jour à Nouméa (fuseau des vols suivis), au format AAAA-MM-JJ.
// Surtout pas l'UTC : à UTC+11, chaque matin jusqu'à 11 h l'UTC est encore
// sur la veille — l'app s'ouvrait sur les vols d'hier (story-001).
function getTodayDate(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Noumea" }).format(new Date());
}

interface FiltersState {
  selectedDate: string;
  flightFilter: FlightFilter;
  selectedAirport: string | null;

  setSelectedDate: (date: string) => void;
  setFlightFilter: (filter: FlightFilter) => void;
  setSelectedAirport: (airport: string | null) => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  resetFilters: () => void;
}

export const useFiltersStore = create<FiltersState>()(
  persist(
    (set, get) => ({
      selectedDate: getTodayDate(),
      flightFilter: "all",
      selectedAirport: null,

      setSelectedDate: (date) => set({ selectedDate: date }),
      setFlightFilter: (filter) => set({ flightFilter: filter }),
      setSelectedAirport: (airport) => set({ selectedAirport: airport }),

      goToPreviousDay: () => {
        const current = new Date(get().selectedDate);
        current.setDate(current.getDate() - 1);
        set({ selectedDate: current.toISOString().slice(0, 10) });
      },

      goToNextDay: () => {
        const current = new Date(get().selectedDate);
        current.setDate(current.getDate() + 1);
        set({ selectedDate: current.toISOString().slice(0, 10) });
      },

      resetFilters: () =>
        set({
          selectedDate: getTodayDate(),
          flightFilter: "all",
          selectedAirport: null,
        }),
    }),
    {
      name: "aircalin-filters",
      partialize: (state) => ({
        // Ne persister que le filtre, pas la date (toujours commencer par aujourd'hui)
        flightFilter: state.flightFilter,
      }),
    },
  ),
);
