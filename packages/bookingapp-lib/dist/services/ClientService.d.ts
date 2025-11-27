import { Client, CreateClientDTO, UpdateClientDTO } from '../models/Client';
import { IStorage } from '../storage/Storage';
/**
 * Service for managing client operations
 * Contains business logic for client management
 */
export declare class ClientService {
    private storage;
    constructor(storage: IStorage);
    /**
     * Create a new client
     */
    createClient(dto: CreateClientDTO): Promise<Client>;
    /**
     * Get a client by ID
     */
    getClient(id: string): Promise<Client | null>;
    /**
     * Get all clients
     */
    getAllClients(): Promise<Client[]>;
    /**
     * Update an existing client
     */
    updateClient(id: string, dto: UpdateClientDTO): Promise<Client>;
    /**
     * Delete a client
     */
    deleteClient(id: string): Promise<boolean>;
    /**
     * Validate email format
     */
    private isValidEmail;
}
//# sourceMappingURL=ClientService.d.ts.map