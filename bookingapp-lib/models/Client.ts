/**
 * Client model representing a customer in the system
 */
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data transfer object for creating a new client
 */
export interface CreateClientDTO {
  name: string;
  email: string;
  phone: string;
}

/**
 * Data transfer object for updating an existing client
 */
export interface UpdateClientDTO {
  name?: string;
  email?: string;
  phone?: string;
}

