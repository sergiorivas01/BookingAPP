"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationService = void 0;
const Reservation_1 = require("../models/Reservation");
const idGenerator_1 = require("../utils/idGenerator");
/**
 * Service for managing reservation operations
 * Contains business logic for reservation management
 */
class ReservationService {
    constructor(storage) {
        this.storage = storage;
    }
    /**
     * Create a new reservation
     */
    async createReservation(dto) {
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
        const reservation = {
            id: (0, idGenerator_1.generateId)(),
            clientId: dto.clientId,
            propertyId: dto.propertyId,
            date: dto.date,
            endDate: dto.endDate,
            time: dto.time,
            numberOfGuests: dto.numberOfGuests,
            status: Reservation_1.ReservationStatus.PENDING,
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
    async getReservation(id) {
        return this.storage.getReservation(id);
    }
    /**
     * Get all reservations
     */
    async getAllReservations() {
        return this.storage.getAllReservations();
    }
    /**
     * Get reservations by client ID
     */
    async getReservationsByClient(clientId) {
        return this.storage.getReservationsByClient(clientId);
    }
    /**
     * Get reservations by property ID
     */
    async getReservationsByProperty(propertyId) {
        return this.storage.getReservationsByProperty(propertyId);
    }
    /**
     * Get reservation details with client information
     * Returns reservation with associated client data
     */
    async getReservationWithClient(reservationId) {
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
    async getPropertyReservationsWithClients(propertyId) {
        const reservations = await this.storage.getReservationsByProperty(propertyId);
        const reservationsWithClients = await Promise.all(reservations.map(async (reservation) => {
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
        }));
        return reservationsWithClients;
    }
    /**
     * Update an existing reservation
     */
    async updateReservation(id, dto) {
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
        const updatedReservation = {
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
    async deleteReservation(id) {
        const reservation = await this.storage.getReservation(id);
        if (!reservation) {
            throw new Error(`Reservation with id ${id} not found`);
        }
        return this.storage.deleteReservation(id);
    }
    /**
     * Confirm a reservation
     */
    async confirmReservation(id) {
        return this.updateReservation(id, { status: Reservation_1.ReservationStatus.CONFIRMED });
    }
    /**
     * Cancel a reservation
     */
    async cancelReservation(id) {
        return this.updateReservation(id, { status: Reservation_1.ReservationStatus.CANCELLED });
    }
}
exports.ReservationService = ReservationService;
//# sourceMappingURL=ReservationService.js.map