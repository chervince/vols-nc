import type { FlightStatus } from '@/types'

/**
 * Formate une heure ISO en format HH:MM
 * @example formatTime("2025-01-15T08:30+11:00") → "08:30"
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Pacific/Noumea',
  })
}

/**
 * Formate une date ISO en format lisible
 * @example formatDate("2025-01-15") → "Mer. 15 janvier 2025"
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00')
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Formate une date ISO en format court
 * @example formatDateShort("2025-01-15") → "15 janv."
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00')
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })
}

/**
 * Traduit le statut du vol en français
 */
export function formatFlightStatus(status: FlightStatus): string {
  const statusMap: Record<FlightStatus, string> = {
    Scheduled: 'Prévu',
    Expected: 'Attendu',
    Departed: 'Parti',
    EnRoute: 'En vol',
    Landed: 'Atterri',
    Cancelled: 'Annulé',
    Delayed: 'Retardé',
    Unknown: 'Inconnu',
  }
  return statusMap[status] ?? status
}

/**
 * Retourne les classes Tailwind pour le badge de statut
 */
export function getStatusClasses(status: FlightStatus): string {
  const classMap: Record<FlightStatus, string> = {
    Scheduled: 'bg-blue-100 text-blue-800',
    Expected: 'bg-blue-100 text-blue-800',
    Departed: 'bg-green-100 text-green-800',
    EnRoute: 'bg-sky-100 text-sky-800',
    Landed: 'bg-emerald-100 text-emerald-800',
    Cancelled: 'bg-red-100 text-red-800',
    Delayed: 'bg-amber-100 text-amber-800',
    Unknown: 'bg-gray-100 text-gray-800',
  }
  return classMap[status] ?? 'bg-gray-100 text-gray-800'
}

/**
 * Formate le numéro de vol (enlève l'espace si présent)
 * @example formatFlightNumber("SB 140") → "SB140"
 */
export function formatFlightNumber(flightNumber: string): string {
  return flightNumber.replace(/\s+/g, '')
}

/**
 * Dictionnaire des noms d'aéroports courants
 */
const airportNames: Record<string, string> = {
  NOU: 'Nouméa',
  SYD: 'Sydney',
  BNE: 'Brisbane',
  MEL: 'Melbourne',
  AKL: 'Auckland',
  NAN: 'Nadi',
  VLI: 'Port-Vila',
  WLS: 'Wallis',
  PPT: 'Papeete',
  SIN: 'Singapour',
  NRT: 'Tokyo Narita',
  TYO: 'Tokyo',
  KIX: 'Osaka',
  CDG: 'Paris',
  BKK: 'Bangkok',
  ICN: 'Séoul',
  HKG: 'Hong Kong',
}

/**
 * Retourne le nom de la ville pour un code IATA
 */
export function getAirportCity(iataCode: string): string {
  return airportNames[iataCode] ?? iataCode
}
