import type { DisplayFlight } from '@/types'
import {
  formatTime,
  formatFlightNumber,
  formatFlightStatus,
  getStatusClasses,
  getAirportCity,
} from '@/utils'

interface FlightCardProps {
  flight: DisplayFlight
}

export function FlightCard({ flight }: FlightCardProps) {
  const isDeparture = flight.direction === 'departure'

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Header avec numéro de vol et statut */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex size-8 items-center justify-center rounded-full text-white ${
              isDeparture ? 'bg-aircalin-coral' : 'bg-aircalin-blue'
            }`}
          >
            {isDeparture ? (
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            ) : (
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            )}
          </span>
          <div>
            <span className="text-lg font-bold text-gray-900">
              {formatFlightNumber(flight.number)}
            </span>
            <span className="ml-2 text-sm text-gray-500">
              {isDeparture ? 'Départ' : 'Arrivée'}
            </span>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(flight.status)}`}
        >
          {formatFlightStatus(flight.status)}
        </span>
      </div>

      {/* Corps avec détails du vol */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Départ */}
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {formatTime(flight.departure.scheduledTimeLocal)}
            </p>
            <p className="text-lg font-semibold text-aircalin-blue">
              {flight.departure.airport.iata}
            </p>
            <p className="text-sm text-gray-500">
              {getAirportCity(flight.departure.airport.iata)}
            </p>
          </div>

          {/* Flèche et durée */}
          <div className="flex flex-1 flex-col items-center px-4">
            <div className="flex w-full items-center">
              <div className="h-px flex-1 bg-gray-300" />
              <svg
                className="mx-2 size-5 text-aircalin-blue"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              <div className="h-px flex-1 bg-gray-300" />
            </div>
            {flight.aircraft?.model && (
              <p className="mt-1 text-xs text-gray-400">{flight.aircraft.model}</p>
            )}
          </div>

          {/* Arrivée */}
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {formatTime(flight.arrival.scheduledTimeLocal)}
            </p>
            <p className="text-lg font-semibold text-aircalin-blue">
              {flight.arrival.airport.iata}
            </p>
            <p className="text-sm text-gray-500">
              {getAirportCity(flight.arrival.airport.iata)}
            </p>
          </div>
        </div>

        {/* Infos supplémentaires */}
        {(flight.departure.terminal || flight.departure.gate || flight.aircraft?.reg) && (
          <div className="mt-4 flex flex-wrap gap-3 border-t border-gray-100 pt-3 text-xs text-gray-500">
            {flight.departure.terminal && (
              <span>Terminal {flight.departure.terminal}</span>
            )}
            {flight.departure.gate && <span>Porte {flight.departure.gate}</span>}
            {flight.aircraft?.reg && <span>Immat. {flight.aircraft.reg}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
