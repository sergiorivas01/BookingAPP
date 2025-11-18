import { Client } from '../models/Client';
import { Reservation } from '../models/Reservation';
import { Property } from '../Properties/Property';

/**
 * Interface for data storage operations
 * This abstraction allows for different storage implementations
 * (in-memory, file-based, database, etc.)
 */
export interface IStorage {
  // Client operations
  saveClient(client: Client): Promise<void>;
  getClient(id: string): Promise<Client | null>;
  getAllClients(): Promise<Client[]>;
  updateClient(id: string, client: Client): Promise<void>;
  deleteClient(id: string): Promise<boolean>;

  // Reservation operations
  saveReservation(reservation: Reservation): Promise<void>;
  getReservation(id: string): Promise<Reservation | null>;
  getAllReservations(): Promise<Reservation[]>;
  getReservationsByClient(clientId: string): Promise<Reservation[]>;
  getReservationsByProperty(propertyId: string): Promise<Reservation[]>;
  updateReservation(id: string, reservation: Reservation): Promise<void>;
  deleteReservation(id: string): Promise<boolean>;

  // Property operations
  saveProperty(property: Property): Promise<void>;
  getProperty(id: string): Promise<Property | null>;
  getAllProperties(): Promise<Property[]>;
  updateProperty(id: string, property: Property): Promise<void>;
  deleteProperty(id: string): Promise<boolean>;
}

