/**
 * API service layer
 * This will be used to communicate with the backend API
 * For now, this is a placeholder structure that will be connected
 * to the actual backend services once the API is implemented
 */

import type {
  Client,
  CreateClientDTO,
  UpdateClientDTO,
  Reservation,
  CreateReservationDTO,
  UpdateReservationDTO,
  Property,
} from '@azucar_1/bookingapp';
import type { ReservationWithClient } from '../types/auxiliary';

// If VITE_API_URL is set, use it directly (should include /api)
// Otherwise, use /api which will be proxied by Vite
const getApiBaseUrl = (): string => {
  const viteApiUrl = import.meta.env.VITE_API_URL;
  
  if (!viteApiUrl) {
    return '/api';
  }
  
  // Ensure the URL is absolute (starts with http:// or https://)
  let baseUrl = viteApiUrl.trim();
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = `https://${baseUrl}`;
  }
  
  // Remove trailing slash if present
  baseUrl = baseUrl.replace(/\/$/, '');
  
  // Add /api if not already present
  if (!baseUrl.endsWith('/api')) {
    baseUrl = `${baseUrl}/api`;
  }
  
  return baseUrl;
};

const API_BASE_URL = getApiBaseUrl();

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new ApiError(
        `API Error: ${response.statusText}`,
        response.status,
        response.statusText
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Client API
export const clientApi = {
  async getAll(): Promise<Client[]> {
    return fetchApi<Client[]>('/clients');
  },

  async getById(id: string): Promise<Client> {
    return fetchApi<Client>(`/clients/${id}`);
  },

  async create(dto: CreateClientDTO): Promise<Client> {
    return fetchApi<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  async update(id: string, dto: UpdateClientDTO): Promise<Client> {
    return fetchApi<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  },

  async delete(id: string): Promise<void> {
    return fetchApi<void>(`/clients/${id}`, {
      method: 'DELETE',
    });
  },
};

// Reservation API
export const reservationApi = {
  async getAll(): Promise<Reservation[]> {
    return fetchApi<Reservation[]>('/reservations');
  },

  async getById(id: string): Promise<Reservation> {
    return fetchApi<Reservation>(`/reservations/${id}`);
  },

  async getWithClient(id: string): Promise<ReservationWithClient> {
    return fetchApi<ReservationWithClient>(`/reservations/${id}/with-client`);
  },

  async getByClient(clientId: string): Promise<Reservation[]> {
    return fetchApi<Reservation[]>(`/reservations/client/${clientId}`);
  },

  async getByProperty(propertyId: string): Promise<Reservation[]> {
    return fetchApi<Reservation[]>(`/reservations/property/${propertyId}`);
  },

  async getPropertyReservationsWithClients(
    propertyId: string
  ): Promise<ReservationWithClient[]> {
    return fetchApi<ReservationWithClient[]>(
      `/reservations/property/${propertyId}/with-clients`
    );
  },

  async create(dto: CreateReservationDTO): Promise<Reservation> {
    return fetchApi<Reservation>('/reservations', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  async update(id: string, dto: UpdateReservationDTO): Promise<Reservation> {
    return fetchApi<Reservation>(`/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  },

  async confirm(id: string): Promise<Reservation> {
    return fetchApi<Reservation>(`/reservations/${id}/confirm`, {
      method: 'POST',
    });
  },

  async cancel(id: string): Promise<Reservation> {
    return fetchApi<Reservation>(`/reservations/${id}/cancel`, {
      method: 'POST',
    });
  },

  async delete(id: string): Promise<void> {
    return fetchApi<void>(`/reservations/${id}`, {
      method: 'DELETE',
    });
  },
};

// Property API
export const propertyApi = {
  async getAll(): Promise<Property[]> {
    return fetchApi<Property[]>('/properties');
  },

  async getById(id: string): Promise<Property> {
    return fetchApi<Property>(`/properties/${id}`);
  },
};

export { ApiError };

