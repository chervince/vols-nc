export interface Airport {
  iata: string
  icao?: string
  name: string
  timeZone?: string
}

export interface ScheduledTime {
  utc: string
  local: string
}

export interface Movement {
  airport: Airport
  scheduledTime: ScheduledTime
  actualTime?: ScheduledTime
  terminal?: string
  gate?: string
  quality?: string[]
}

export interface Airline {
  name: string
  iata: string
  icao?: string
}

export interface Aircraft {
  model?: string
  reg?: string
  modeS?: string
}

export type FlightStatus =
  | 'Scheduled'
  | 'Expected'
  | 'Departed'
  | 'EnRoute'
  | 'Landed'
  | 'Cancelled'
  | 'Delayed'
  | 'Unknown'

// Structure réelle de l'API AeroDataBox
export interface ApiFlight {
  movement: Movement
  number: string
  callSign?: string
  status: FlightStatus
  codeshareStatus?: string
  isCargo: boolean
  airline: Airline
  aircraft?: Aircraft
}

export interface ApiFlightsResponse {
  departures: ApiFlight[]
  arrivals: ApiFlight[]
}

// Structure normalisée pour l'affichage
export interface FlightTime {
  airport: Airport
  scheduledTimeLocal: string
  scheduledTimeUtc?: string
  actualTimeLocal?: string
  actualTimeUtc?: string
  terminal?: string
  gate?: string
}

export interface Flight {
  departure: FlightTime
  arrival: FlightTime
  number: string
  callSign?: string
  status: FlightStatus
  airline: Airline
  aircraft?: Aircraft
}

export interface FlightsResponse {
  departures: Flight[]
  arrivals: Flight[]
}

export type FlightDirection = 'departure' | 'arrival'

export interface DisplayFlight extends Flight {
  direction: FlightDirection
}

export type FlightFilter = 'all' | 'departures' | 'arrivals'
