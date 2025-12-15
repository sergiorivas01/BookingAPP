/**
 * Authentication types and interfaces
 */

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: string;
  provider_id: string;
  client_id?: string | null; // Reference to clients table
  created_at: Date;
  updated_at: Date;
}

export interface OAuth2Profile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  [key: string]: unknown;
}

