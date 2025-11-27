/**
 * Reservation model representing a booking in the system
 */
export interface Reservation {
  id: string;
  clientId: string;
  propertyId?: string; // Optional: link reservation to a property
  date: Date; // Check-in date or start date
  endDate: Date; // Check-out date or end date (required for calculating duration)
  time: string;
  numberOfGuests: number;
  status: ReservationStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Reservation status enum
 */
export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

/**
 * Data transfer object for creating a new reservation
 */
export interface CreateReservationDTO {
  clientId: string;
  propertyId?: string; // Optional: link reservation to a property
  date: Date; // Check-in date or start date
  endDate: Date; // Check-out date or end date (required)
  time: string;
  numberOfGuests: number;
  notes?: string;
}

/**
 * Data transfer object for updating an existing reservation
 */
export interface UpdateReservationDTO {
  propertyId?: string;
  date?: Date;
  endDate?: Date;
  time?: string;
  numberOfGuests?: number;
  status?: ReservationStatus;
  notes?: string;
}

