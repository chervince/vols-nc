import { useQuery } from '@tanstack/react-query'
import { fetchFlights } from '@/api/flights'
import { useFiltersStore } from '@/stores/filters'
import type { DisplayFlight } from '@/types'

export function useFlights() {
  const { selectedDate, flightFilter } = useFiltersStore()

  const query = useQuery({
    queryKey: ['flights', selectedDate],
    queryFn: () => fetchFlights(selectedDate),
    select: (data): DisplayFlight[] => {
      // Tous les vols (toutes compagnies)
      const departures = data.departures.map((f) => ({
        ...f,
        direction: 'departure' as const,
      }))

      const arrivals = data.arrivals.map((f) => ({
        ...f,
        direction: 'arrival' as const,
      }))

      let flights = [...departures, ...arrivals]

      // Appliquer le filtre par type
      if (flightFilter === 'departures') {
        flights = flights.filter((f) => f.direction === 'departure')
      } else if (flightFilter === 'arrivals') {
        flights = flights.filter((f) => f.direction === 'arrival')
      }

      // Trier par heure de départ
      return flights.sort(
        (a, b) =>
          new Date(a.departure.scheduledTimeLocal).getTime() -
          new Date(b.departure.scheduledTimeLocal).getTime()
      )
    },
  })

  return {
    flights: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
