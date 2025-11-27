"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryStorage = void 0;
/**
 * In-memory storage implementation
 * Suitable for development and testing
 * Data is lost when the application restarts
 */
class InMemoryStorage {
    constructor() {
        this.clients = new Map();
        this.reservations = new Map();
        this.properties = new Map();
    }
    // Client operations
    async saveClient(client) {
        this.clients.set(client.id, client);
    }
    async getClient(id) {
        return this.clients.get(id) || null;
    }
    async getAllClients() {
        return Array.from(this.clients.values());
    }
    async updateClient(id, client) {
        if (!this.clients.has(id)) {
            throw new Error(`Client with id ${id} not found`);
        }
        this.clients.set(id, client);
    }
    async deleteClient(id) {
        return this.clients.delete(id);
    }
    // Reservation operations
    async saveReservation(reservation) {
        this.reservations.set(reservation.id, reservation);
    }
    async getReservation(id) {
        return this.reservations.get(id) || null;
    }
    async getAllReservations() {
        return Array.from(this.reservations.values());
    }
    async getReservationsByClient(clientId) {
        return Array.from(this.reservations.values()).filter((reservation) => reservation.clientId === clientId);
    }
    async getReservationsByProperty(propertyId) {
        return Array.from(this.reservations.values()).filter((reservation) => reservation.propertyId === propertyId);
    }
    async updateReservation(id, reservation) {
        if (!this.reservations.has(id)) {
            throw new Error(`Reservation with id ${id} not found`);
        }
        this.reservations.set(id, reservation);
    }
    async deleteReservation(id) {
        return this.reservations.delete(id);
    }
    // Property operations
    async saveProperty(property) {
        this.properties.set(property.id, property);
    }
    async getProperty(id) {
        return this.properties.get(id) || null;
    }
    async getAllProperties() {
        return Array.from(this.properties.values());
    }
    async updateProperty(id, property) {
        if (!this.properties.has(id)) {
            throw new Error(`Property with id ${id} not found`);
        }
        this.properties.set(id, property);
    }
    async deleteProperty(id) {
        return this.properties.delete(id);
    }
}
exports.InMemoryStorage = InMemoryStorage;
//# sourceMappingURL=InMemoryStorage.js.map