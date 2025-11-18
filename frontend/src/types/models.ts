/**
 * Type definitions matching the backend models
 * These types should stay in sync with src/models/Client.ts and src/models/Reservation.ts
 */

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateClientDTO {
  name: string;
  email: string;
  phone: string;
}

export interface UpdateClientDTO {
  name?: string;
  email?: string;
  phone?: string;
}

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export interface Reservation {
  id: string;
  clientId: string;
  propertyId?: string;
  date: Date | string;
  endDate: Date | string;
  time: string;
  numberOfGuests: number;
  status: ReservationStatus;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateReservationDTO {
  clientId: string;
  propertyId?: string;
  date: Date | string;
  endDate: Date | string;
  time: string;
  numberOfGuests: number;
  notes?: string;
}

export interface UpdateReservationDTO {
  propertyId?: string;
  date?: Date | string;
  endDate?: Date | string;
  time?: string;
  numberOfGuests?: number;
  status?: ReservationStatus;
  notes?: string;
}

export interface Property {
  id: string;
  name: string;
  description?: string;
  specifications?: {
    type?: string;
    area?: number;
    capacity?: number;
    bedrooms?: number;
    bathrooms?: number;
    amenities?: string[];
  };
  price: number;
  availability: string;
  availabilityInfo?: any;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ReservationWithClient {
  reservation: Reservation;
  client: Client | null;
}

