import { Client } from '../models/Client';
import { Reservation } from '../models/Reservation';
import { Property } from '../Properties/Property';
import { IStorage } from './Storage';
/**
 * In-memory storage implementation
 * Suitable for development and testing
 * Data is lost when the application restarts
 */
export declare class InMemoryStorage implements IStorage {
    private clients;
    private reservations;
    private properties;
    saveClient(client: Client): Promise<void>;
    getClient(id: string): Promise<Client | null>;
    getAllClients(): Promise<Client[]>;
    updateClient(id: string, client: Client): Promise<void>;
    deleteClient(id: string): Promise<boolean>;
    saveReservation(reservation: Reservation): Promise<void>;
    getReservation(id: string): Promise<Reservation | null>;
    getAllReservations(): Promise<Reservation[]>;
    getReservationsByClient(clientId: string): Promise<Reservation[]>;
    getReservationsByProperty(propertyId: string): Promise<Reservation[]>;
    updateReservation(id: string, reservation: Reservation): Promise<void>;
    deleteReservation(id: string): Promise<boolean>;
    saveProperty(property: Property): Promise<void>;
    getProperty(id: string): Promise<Property | null>;
    getAllProperties(): Promise<Property[]>;
    updateProperty(id: string, property: Property): Promise<void>;
    deleteProperty(id: string): Promise<boolean>;
}
//# sourceMappingURL=InMemoryStorage.d.ts.map