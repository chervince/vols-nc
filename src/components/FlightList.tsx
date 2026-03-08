import type { DisplayFlight } from '@/types'
import { FlightCard } from './FlightCard'
import { LoadingSpinner } from './LoadingSpinner'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'

interface FlightListProps {
  flights: DisplayFlight[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  onRetry: () => void
}

export function FlightList({
  flights,
  isLoading,
  isError,
  error,
  onRetry,
}: FlightListProps) {
  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError) {
    return (
      <ErrorState
        message={error?.message ?? 'Une erreur est survenue'}
        onRetry={onRetry}
      />
    )
  }

  if (flights.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        {flights.length} vol{flights.length > 1 ? 's' : ''} trouvé
        {flights.length > 1 ? 's' : ''}
      </p>
      <div className="grid gap-4">
        {flights.map((flight) => (
          <FlightCard key={`${flight.number}-${flight.direction}`} flight={flight} />
        ))}
      </div>
    </div>
  )
}
