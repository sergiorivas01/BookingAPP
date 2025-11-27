/**
 * Auxiliary types specific to the frontend
 * These types extend or combine types from @azucar_1/bookingapp
 */

import type { Reservation, Client } from '@azucar_1/bookingapp';

/**
 * Reservation with associated client information
 * Used for displaying reservations with client details
 */
export interface ReservationWithClient {
  reservation: Reservation;
  client: Client | null;
}

