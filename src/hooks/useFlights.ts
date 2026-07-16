import { useQuery } from "@tanstack/react-query";
import { fetchFlights } from "@/api/flights";
import { useFiltersStore } from "@/stores/filters";
import type { DisplayFlight } from "@/types";

export function useFlights() {
  const { selectedDate, flightFilter } = useFiltersStore();

  const query = useQuery({
    queryKey: ["flights", selectedDate],
    queryFn: () => fetchFlights(selectedDate),
    select: (data): DisplayFlight[] => {
      // Tous les vols (toutes compagnies)
      const departures = data.departures.map((f) => ({
        ...f,
        direction: "departure" as const,
      }));

      const arrivals = data.arrivals.map((f) => ({
        ...f,
        direction: "arrival" as const,
      }));

      let flights = [...departures, ...arrivals];

      // Appliquer le filtre par type
      if (flightFilter === "departures") {
        flights = flights.filter((f) => f.direction === "departure");
      } else if (flightFilter === "arrivals") {
        flights = flights.filter((f) => f.direction === "arrival");
      }

      // Trier par l'heure connue du vol : départ pour un départ, arrivée pour
      // une arrivée (la source ne donne qu'un horaire par sens).
      const timeOf = (f: DisplayFlight) =>
        f.direction === "departure" ? f.departure.scheduledTimeLocal : f.arrival.scheduledTimeLocal;
      return flights.sort((a, b) => new Date(timeOf(a)).getTime() - new Date(timeOf(b)).getTime());
    },
  });

  return {
    flights: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
