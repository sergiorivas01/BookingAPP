/**
 * Reservation model representing a booking in the system
 */
export interface Reservation {
    id: string;
    clientId: string;
    propertyId?: string;
    date: Date;
    endDate: Date;
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
export declare enum ReservationStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    CANCELLED = "cancelled",
    COMPLETED = "completed"
}
/**
 * Data transfer object for creating a new reservation
 */
export interface CreateReservationDTO {
    clientId: string;
    propertyId?: string;
    date: Date;
    endDate: Date;
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
//# sourceMappingURL=Reservation.d.ts.map