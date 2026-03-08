import { useFiltersStore } from '@/stores/filters'
import type { FlightFilter } from '@/types'

const filterOptions: { value: FlightFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'departures', label: 'Départs' },
  { value: 'arrivals', label: 'Arrivées' },
]

export function FilterBar() {
  const { flightFilter, setFlightFilter } = useFiltersStore()

  return (
    <div className="flex rounded-lg bg-white p-1 shadow-sm">
      {filterOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => setFlightFilter(option.value)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            flightFilter === option.value
              ? 'bg-aircalin-blue text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
