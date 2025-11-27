"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientService = void 0;
const idGenerator_1 = require("../utils/idGenerator");
/**
 * Service for managing client operations
 * Contains business logic for client management
 */
class ClientService {
    constructor(storage) {
        this.storage = storage;
    }
    /**
     * Create a new client
     */
    async createClient(dto) {
        // Validate email format
        if (!this.isValidEmail(dto.email)) {
            throw new Error('Invalid email format');
        }
        // Check if email already exists
        const existingClients = await this.storage.getAllClients();
        if (existingClients.some((client) => client.email === dto.email)) {
            throw new Error('Client with this email already exists');
        }
        const now = new Date();
        const client = {
            id: (0, idGenerator_1.generateId)(),
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            createdAt: now,
            updatedAt: now,
        };
        console.log('Saving client to storage:', client.id);
        await this.storage.saveClient(client);
        console.log('Client saved successfully:', client.id);
        return client;
    }
    /**
     * Get a client by ID
     */
    async getClient(id) {
        return this.storage.getClient(id);
    }
    /**
     * Get all clients
     */
    async getAllClients() {
        return this.storage.getAllClients();
    }
    /**
     * Update an existing client
     */
    async updateClient(id, dto) {
        const client = await this.storage.getClient(id);
        if (!client) {
            throw new Error(`Client with id ${id} not found`);
        }
        // Validate email if provided
        if (dto.email && !this.isValidEmail(dto.email)) {
            throw new Error('Invalid email format');
        }
        // Check if new email already exists (if changed)
        if (dto.email && dto.email !== client.email) {
            const existingClients = await this.storage.getAllClients();
            if (existingClients.some((c) => c.email === dto.email && c.id !== id)) {
                throw new Error('Client with this email already exists');
            }
        }
        const updatedClient = {
            ...client,
            ...dto,
            updatedAt: new Date(),
        };
        await this.storage.updateClient(id, updatedClient);
        return updatedClient;
    }
    /**
     * Delete a client
     */
    async deleteClient(id) {
        const client = await this.storage.getClient(id);
        if (!client) {
            throw new Error(`Client with id ${id} not found`);
        }
        return this.storage.deleteClient(id);
    }
    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
exports.ClientService = ClientService;
//# sourceMappingURL=ClientService.js.map