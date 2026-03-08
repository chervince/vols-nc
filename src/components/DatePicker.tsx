import { useFiltersStore } from '@/stores/filters'
import { formatDate } from '@/utils'

export function DatePicker() {
  const { selectedDate, setSelectedDate, goToPreviousDay, goToNextDay } =
    useFiltersStore()

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={goToPreviousDay}
        className="flex size-10 items-center justify-center rounded-lg bg-white text-aircalin-blue shadow-sm transition-colors hover:bg-aircalin-light"
        aria-label="Jour précédent"
      >
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="relative">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label="Sélectionner une date"
        />
        <div className="flex min-w-[200px] items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-gray-800 shadow-sm">
          <svg className="size-5 text-aircalin-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{formatDate(selectedDate)}</span>
        </div>
      </div>

      <button
        onClick={goToNextDay}
        className="flex size-10 items-center justify-center rounded-lg bg-white text-aircalin-blue shadow-sm transition-colors hover:bg-aircalin-light"
        aria-label="Jour suivant"
      >
        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
