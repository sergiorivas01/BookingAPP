import { Reservation, CreateReservationDTO, UpdateReservationDTO } from '../models/Reservation';
import { IStorage } from '../storage/Storage';
/**
 * Service for managing reservation operations
 * Contains business logic for reservation management
 */
export declare class ReservationService {
    private storage;
    constructor(storage: IStorage);
    /**
     * Create a new reservation
     */
    createReservation(dto: CreateReservationDTO): Promise<Reservation>;
    /**
     * Get a reservation by ID
     */
    getReservation(id: string): Promise<Reservation | null>;
    /**
     * Get all reservations
     */
    getAllReservations(): Promise<Reservation[]>;
    /**
     * Get reservations by client ID
     */
    getReservationsByClient(clientId: string): Promise<Reservation[]>;
    /**
     * Get reservations by property ID
     */
    getReservationsByProperty(propertyId: string): Promise<Reservation[]>;
    /**
     * Get reservation details with client information
     * Returns reservation with associated client data
     */
    getReservationWithClient(reservationId: string): Promise<{
        reservation: Reservation;
        client: {
            id: string;
            name: string;
            email: string;
            phone: string;
        } | null;
    }>;
    /**
     * Get all property reservations with client information
     * Shows which clients have reservations for a specific property
     */
    getPropertyReservationsWithClients(propertyId: string): Promise<Array<{
        reservation: Reservation;
        client: {
            id: string;
            name: string;
            email: string;
            phone: string;
        } | null;
    }>>;
    /**
     * Update an existing reservation
     */
    updateReservation(id: string, dto: UpdateReservationDTO): Promise<Reservation>;
    /**
     * Delete a reservation
     */
    deleteReservation(id: string): Promise<boolean>;
    /**
     * Confirm a reservation
     */
    confirmReservation(id: string): Promise<Reservation>;
    /**
     * Cancel a reservation
     */
    cancelReservation(id: string): Promise<Reservation>;
}
//# sourceMappingURL=ReservationService.d.ts.map