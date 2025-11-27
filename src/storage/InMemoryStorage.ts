import { Client } from '../models/Client';
import { Reservation } from '../models/Reservation';
import { IStorage } from './Storage';

/**
 * In-memory storage implementation
 * Suitable for development and testing
 * Data is lost when the application restarts
 */
export class InMemoryStorage implements IStorage {
  private clients: Map<string, Client> = new Map();
  private reservations: Map<string, Reservation> = new Map();

  // Client operations
  async saveClient(client: Client): Promise<void> {
    this.clients.set(client.id, client);
  }

  async getClient(id: string): Promise<Client | null> {
    return this.clients.get(id) || null;
  }

  async getAllClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async updateClient(id: string, client: Client): Promise<void> {
    if (!this.clients.has(id)) {
      throw new Error(`Client with id ${id} not found`);
    }
    this.clients.set(id, client);
  }

  async deleteClient(id: string): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Reservation operations
  async saveReservation(reservation: Reservation): Promise<void> {
    this.reservations.set(reservation.id, reservation);
  }

  async getReservation(id: string): Promise<Reservation | null> {
    return this.reservations.get(id) || null;
  }

  async getAllReservations(): Promise<Reservation[]> {
    return Array.from(this.reservations.values());
  }

  async getReservationsByClient(clientId: string): Promise<Reservation[]> {
    return Array.from(this.reservations.values()).filter(
      (reservation) => reservation.clientId === clientId
    );
  }

  async updateReservation(id: string, reservation: Reservation): Promise<void> {
    if (!this.reservations.has(id)) {
      throw new Error(`Reservation with id ${id} not found`);
    }
    this.reservations.set(id, reservation);
  }

  async deleteReservation(id: string): Promise<boolean> {
    return this.reservations.delete(id);
  }
}

