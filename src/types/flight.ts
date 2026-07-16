export interface Airport {
  iata: string;
  name: string;
}

export interface Airline {
  name: string;
  iata: string;
  icao?: string;
}

export type FlightStatus =
  | "Scheduled"
  | "Expected"
  | "Departed"
  | "Landed"
  | "Cancelled"
  | "Delayed"
  | "Unknown";

// Structure normalisée pour l'affichage
export interface FlightTime {
  airport: Airport;
  scheduledTimeLocal: string;
  scheduledTimeUtc?: string;
  actualTimeLocal?: string;
  actualTimeUtc?: string;
}

export interface Flight {
  departure: FlightTime;
  arrival: FlightTime;
  number: string;
  callSign?: string;
  status: FlightStatus;
  airline: Airline;
}

export interface FlightsResponse {
  departures: Flight[];
  arrivals: Flight[];
}

export type FlightDirection = "departure" | "arrival";

export interface DisplayFlight extends Flight {
  direction: FlightDirection;
}

export type FlightFilter = "all" | "departures" | "arrivals";
