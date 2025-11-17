import {
  Reservation,
  CreateReservationDTO,
  UpdateReservationDTO,
  ReservationStatus,
} from '../models/Reservation';
import { IStorage } from '../storage/Storage';
import { generateId } from '../utils/idGenerator';

/**
 * Service for managing reservation operations
 * Contains business logic for reservation management
 */
export class ReservationService {
  constructor(private storage: IStorage) {}

  /**
   * Create a new reservation
   */
  async createReservation(dto: CreateReservationDTO): Promise<Reservation> {
    // Validate that client exists
    const client = await this.storage.getClient(dto.clientId);
    if (!client) {
      throw new Error(`Client with id ${dto.clientId} not found`);
    }

    // Validate date is not in the past
    const now = new Date();
    if (dto.date < now) {
      throw new Error('Cannot create reservation for a past date');
    }

    // Validate endDate is not in the past
    if (dto.endDate < now) {
      throw new Error('Cannot create reservation with end date in the past');
    }

    // Validate endDate is after start date
    if (dto.endDate <= dto.date) {
      throw new Error('End date must be after start date');
    }

    // Validate number of guests
    if (dto.numberOfGuests <= 0) {
      throw new Error('Number of guests must be greater than 0');
    }

    const reservation: Reservation = {
      id: generateId(),
      clientId: dto.clientId,
      propertyId: dto.propertyId,
      date: dto.date,
      endDate: dto.endDate,
      time: dto.time,
      numberOfGuests: dto.numberOfGuests,
      status: ReservationStatus.PENDING,
      notes: dto.notes,
      createdAt: now,
      updatedAt: now,
    };

    await this.storage.saveReservation(reservation);
    return reservation;
  }

  /**
   * Get a reservation by ID
   */
  async getReservation(id: string): Promise<Reservation | null> {
    return this.storage.getReservation(id);
  }

  /**
   * Get all reservations
   */
  async getAllReservations(): Promise<Reservation[]> {
    return this.storage.getAllReservations();
  }

  /**
   * Get reservations by client ID
   */
  async getReservationsByClient(clientId: string): Promise<Reservation[]> {
    return this.storage.getReservationsByClient(clientId);
  }

  /**
   * Get reservations by property ID
   */
  async getReservationsByProperty(propertyId: string): Promise<Reservation[]> {
    return this.storage.getReservationsByProperty(propertyId);
  }

  /**
   * Get reservation details with client information
   * Returns reservation with associated client data
   */
  async getReservationWithClient(reservationId: string): Promise<{
    reservation: Reservation;
    client: { id: string; name: string; email: string; phone: string } | null;
  }> {
    const reservation = await this.storage.getReservation(reservationId);
    if (!reservation) {
      throw new Error(`Reservation with id ${reservationId} not found`);
    }

    const client = await this.storage.getClient(reservation.clientId);
    
    return {
      reservation,
      client: client
        ? {
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone,
          }
        : null,
    };
  }

  /**
   * Get all property reservations with client information
   * Shows which clients have reservations for a specific property
   */
  async getPropertyReservationsWithClients(propertyId: string): Promise<
    Array<{
      reservation: Reservation;
      client: { id: string; name: string; email: string; phone: string } | null;
    }>
  > {
    const reservations = await this.storage.getReservationsByProperty(propertyId);
    
    const reservationsWithClients = await Promise.all(
      reservations.map(async (reservation) => {
        const client = await this.storage.getClient(reservation.clientId);
        return {
          reservation,
          client: client
            ? {
                id: client.id,
                name: client.name,
                email: client.email,
                phone: client.phone,
              }
            : null,
        };
      })
    );

    return reservationsWithClients;
  }

  /**
   * Update an existing reservation
   */
  async updateReservation(
    id: string,
    dto: UpdateReservationDTO
  ): Promise<Reservation> {
    const reservation = await this.storage.getReservation(id);
    if (!reservation) {
      throw new Error(`Reservation with id ${id} not found`);
    }

    // Validate date if provided
    if (dto.date && dto.date < new Date()) {
      throw new Error('Cannot update reservation to a past date');
    }

    // Validate endDate if provided
    if (dto.endDate) {
      if (dto.endDate < new Date()) {
        throw new Error('Cannot update reservation with end date in the past');
      }
      
      // If both dates are provided, validate endDate is after start date
      const startDate = dto.date || reservation.date;
      if (dto.endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
    }

    // Validate number of guests if provided
    if (dto.numberOfGuests !== undefined && dto.numberOfGuests <= 0) {
      throw new Error('Number of guests must be greater than 0');
    }

    const updatedReservation: Reservation = {
      ...reservation,
      ...dto,
      updatedAt: new Date(),
    };

    await this.storage.updateReservation(id, updatedReservation);
    return updatedReservation;
  }

  /**
   * Delete a reservation
   */
  async deleteReservation(id: string): Promise<boolean> {
    const reservation = await this.storage.getReservation(id);
    if (!reservation) {
      throw new Error(`Reservation with id ${id} not found`);
    }

    return this.storage.deleteReservation(id);
  }

  /**
   * Confirm a reservation
   */
  async confirmReservation(id: string): Promise<Reservation> {
    return this.updateReservation(id, { status: ReservationStatus.CONFIRMED });
  }

  /**
   * Cancel a reservation
   */
  async cancelReservation(id: string): Promise<Reservation> {
    return this.updateReservation(id, { status: ReservationStatus.CANCELLED });
  }
}

