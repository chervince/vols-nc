import { Header, DatePicker, FilterBar, FlightList } from '@/components'
import { useFlights } from '@/hooks/useFlights'

function App() {
  const { flights, isLoading, isError, error, refetch } = useFlights()

  return (
    <div className="min-h-screen bg-aircalin-gray">
      <Header />

      <main className="container-app py-6">
        {/* Contrôles : Date + Filtres */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <DatePicker />
          <FilterBar />
        </div>

        {/* Liste des vols */}
        <FlightList
          flights={flights}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={refetch}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4 text-center text-sm text-gray-500">
        <p>
          Données fournies par{' '}
          <a
            href="https://www.aerodatabox.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-aircalin-blue hover:underline"
          >
            AeroDataBox
          </a>
        </p>
      </footer>
    </div>
  )
}

export default App
