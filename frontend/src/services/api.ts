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
import { trackDependency, trackException } from './applicationInsights';

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

/**
 * Safely track dependency without blocking the API call
 */
function safeTrackDependency(
  name: string,
  command: string,
  elapsed: number,
  success: boolean,
  dependencyTypeName: string,
  properties?: { [key: string]: string },
  responseCode?: number
): void {
  try {
    trackDependency(name, command, elapsed, success, dependencyTypeName, properties, responseCode);
  } catch (error) {
    // Silently fail - don't let telemetry errors affect API calls
    console.warn('Failed to track dependency (non-blocking):', error);
  }
}

/**
 * Safely track exception without blocking the API call
 */
function safeTrackException(
  exception: Error,
  properties?: { [key: string]: string }
): void {
  try {
    trackException(exception, properties);
  } catch (error) {
    // Silently fail - don't let telemetry errors affect API calls
    console.warn('Failed to track exception (non-blocking):', error);
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = options?.method || 'GET';
  const startTime = performance.now();
  
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: options?.signal || controller.signal,
      credentials: 'include', // Include cookies for session management
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    clearTimeout(timeoutId);

    const elapsed = performance.now() - startTime;
    const success = response.ok;

    // Track API call as dependency (non-blocking)
    safeTrackDependency(
      `${method} ${endpoint}`,
      url,
      Math.round(elapsed),
      success,
      'HTTP',
      {
        method,
        statusCode: response.status.toString(),
        endpoint,
      },
      response.status
    );

    if (!response.ok) {
      const error = new ApiError(
        `API Error: ${response.statusText}`,
        response.status,
        response.statusText
      );
      
      // Track failed API calls as exceptions (non-blocking)
      safeTrackException(error, {
        endpoint,
        method,
        statusCode: response.status.toString(),
        url,
      });
      
      throw error;
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    const elapsed = performance.now() - startTime;
    
    // Check if it's an abort error (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = new ApiError('Request timeout: The server did not respond in time');
      setTimeout(() => {
        safeTrackDependency(
          `${method} ${endpoint}`,
          url,
          Math.round(elapsed),
          false,
          'HTTP',
          {
            method,
            endpoint,
            error: 'Timeout',
          }
        );
        safeTrackException(timeoutError, {
          endpoint,
          method,
          url,
          errorType: 'Timeout',
        });
      }, 0);
      throw timeoutError;
    }
    
    // Track failed network calls (non-blocking)
    if (!(error instanceof ApiError)) {
      const networkError = new ApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      
      // Track dependency and exception asynchronously to not block error propagation
      setTimeout(() => {
        safeTrackDependency(
          `${method} ${endpoint}`,
          url,
          Math.round(elapsed),
          false,
          'HTTP',
          {
            method,
            endpoint,
            error: error instanceof Error ? error.message : 'Unknown error',
          }
        );
        
        safeTrackException(networkError, {
          endpoint,
          method,
          url,
          errorType: 'NetworkError',
        });
      }, 0);
      
      throw networkError;
    }
    
    throw error;
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

// Auth API
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: string;
}

export interface AuthStatus {
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
}

// Helper to get backend base URL
const getBackendBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.trim();
    // Remove /api suffix if present
    return url.replace(/\/api\/?$/, '');
  }
  // In development, use proxy (relative URL)
  // In production or when VITE_API_URL is set, use absolute URL
  return import.meta.env.PROD ? 'http://localhost:8006' : '';
};

export const authApi = {
  /**
   * Initiate OAuth 2.0 login
   * Redirects to backend /auth/login which then redirects to OAuth provider
   * Uses absolute URL for full page redirect
   */
  login(): void {
    // Always use absolute URL for OAuth redirect to ensure cookies work correctly
    const backendUrl = getBackendBaseUrl();
    const loginUrl = backendUrl 
      ? `${backendUrl}/auth/login`
      : 'http://localhost:8006/auth/login'; // Default to backend URL in development
    window.location.href = loginUrl;
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    const backendUrl = getBackendBaseUrl();
    const logoutUrl = backendUrl 
      ? `${backendUrl}/auth/logout`
      : '/auth/logout'; // Use proxy in development
    
    const response = await fetch(logoutUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiError(
        `API Error: ${response.statusText}`,
        response.status,
        response.statusText
      );
    }
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const backendUrl = getBackendBaseUrl();
    const meUrl = backendUrl 
      ? `${backendUrl}/auth/me`
      : '/auth/me'; // Use proxy in development
    
    const response = await fetch(meUrl, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
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
  },

  /**
   * Check authentication status
   */
  async checkStatus(): Promise<AuthStatus> {
    const backendUrl = getBackendBaseUrl();
    const statusUrl = backendUrl 
      ? `${backendUrl}/auth/status`
      : '/auth/status'; // Use proxy in development
    
    const response = await fetch(statusUrl, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
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
  },
};

export { ApiError };

