import type { ApiFlightsResponse, FlightsResponse, Flight, ApiFlight } from '@/types'

const API_BASE = '/api'
const AIRPORT_CODE = 'NOU' // Nouméa La Tontouta
const NOUMEA_AIRPORT = {
  iata: 'NOU',
  icao: 'NWWW',
  name: 'Nouméa La Tontouta',
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Transforme un vol départ API en vol normalisé
function transformDeparture(apiFlight: ApiFlight): Flight {
  return {
    number: apiFlight.number,
    callSign: apiFlight.callSign,
    status: apiFlight.status,
    airline: apiFlight.airline,
    aircraft: apiFlight.aircraft,
    departure: {
      airport: NOUMEA_AIRPORT,
      scheduledTimeLocal: apiFlight.movement.scheduledTime.local,
      scheduledTimeUtc: apiFlight.movement.scheduledTime.utc,
      terminal: apiFlight.movement.terminal,
      gate: apiFlight.movement.gate,
    },
    arrival: {
      airport: apiFlight.movement.airport,
      scheduledTimeLocal: apiFlight.movement.scheduledTime.local,
      scheduledTimeUtc: apiFlight.movement.scheduledTime.utc,
    },
  }
}

// Transforme un vol arrivée API en vol normalisé
function transformArrival(apiFlight: ApiFlight): Flight {
  return {
    number: apiFlight.number,
    callSign: apiFlight.callSign,
    status: apiFlight.status,
    airline: apiFlight.airline,
    aircraft: apiFlight.aircraft,
    departure: {
      airport: apiFlight.movement.airport,
      scheduledTimeLocal: apiFlight.movement.scheduledTime.local,
      scheduledTimeUtc: apiFlight.movement.scheduledTime.utc,
    },
    arrival: {
      airport: NOUMEA_AIRPORT,
      scheduledTimeLocal: apiFlight.movement.scheduledTime.local,
      scheduledTimeUtc: apiFlight.movement.scheduledTime.utc,
      terminal: apiFlight.movement.terminal,
      gate: apiFlight.movement.gate,
    },
  }
}

async function fetchFlightsPeriod(
  from: string,
  to: string
): Promise<ApiFlightsResponse> {
  const url = `${API_BASE}/flights/airports/iata/${AIRPORT_CODE}/${from}/${to}?direction=Both&withCancelled=true&withCodeshared=false&withPrivate=false&withCargo=false`

  const response = await fetch(url)

  if (!response.ok) {
    if (response.status === 404) {
      return { departures: [], arrivals: [] }
    }
    if (response.status === 429) {
      throw new ApiError(
        'Limite API atteinte. Réessayez dans quelques minutes.',
        429
      )
    }
    if (response.status === 401 || response.status === 403) {
      throw new ApiError('Clé API invalide ou expirée.', response.status)
    }
    throw new ApiError(`Erreur serveur (${response.status})`, response.status)
  }

  return response.json()
}

export async function fetchFlights(date: string): Promise<FlightsResponse> {
  // L'API AeroDataBox limite les requêtes à 12h maximum
  // On fait donc 2 requêtes : matin (00:00-11:59) et après-midi (12:00-23:59)
  const [morning, afternoon] = await Promise.all([
    fetchFlightsPeriod(`${date}T00:00`, `${date}T11:59`),
    fetchFlightsPeriod(`${date}T12:00`, `${date}T23:59`),
  ])

  const apiDepartures = [...morning.departures, ...afternoon.departures]
  const apiArrivals = [...morning.arrivals, ...afternoon.arrivals]

  return {
    departures: apiDepartures.map(transformDeparture),
    arrivals: apiArrivals.map(transformArrival),
  }
}
