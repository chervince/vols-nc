import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FlightFilter } from '@/types'

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

interface FiltersState {
  selectedDate: string
  flightFilter: FlightFilter
  selectedAirport: string | null

  setSelectedDate: (date: string) => void
  setFlightFilter: (filter: FlightFilter) => void
  setSelectedAirport: (airport: string | null) => void
  goToPreviousDay: () => void
  goToNextDay: () => void
  resetFilters: () => void
}

export const useFiltersStore = create<FiltersState>()(
  persist(
    (set, get) => ({
      selectedDate: getTodayDate(),
      flightFilter: 'all',
      selectedAirport: null,

      setSelectedDate: (date) => set({ selectedDate: date }),
      setFlightFilter: (filter) => set({ flightFilter: filter }),
      setSelectedAirport: (airport) => set({ selectedAirport: airport }),

      goToPreviousDay: () => {
        const current = new Date(get().selectedDate)
        current.setDate(current.getDate() - 1)
        set({ selectedDate: current.toISOString().split('T')[0] })
      },

      goToNextDay: () => {
        const current = new Date(get().selectedDate)
        current.setDate(current.getDate() + 1)
        set({ selectedDate: current.toISOString().split('T')[0] })
      },

      resetFilters: () =>
        set({
          selectedDate: getTodayDate(),
          flightFilter: 'all',
          selectedAirport: null,
        }),
    }),
    {
      name: 'aircalin-filters',
      partialize: (state) => ({
        // Ne persister que le filtre, pas la date (toujours commencer par aujourd'hui)
        flightFilter: state.flightFilter,
      }),
    }
  )
)
