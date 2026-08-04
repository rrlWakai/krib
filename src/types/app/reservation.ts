import type { Tables, TablesInsert } from '../generated/database'

export type Reservation = Tables<'reservations'>
export type ReservationInsert = Omit<TablesInsert<'reservations'>, 'reference_code'>
