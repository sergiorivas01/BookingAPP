import { IStorage } from '../../src/storage/Storage';
import { Client } from '../../src/models/Client';
import { Reservation, ReservationStatus } from '../../src/models/Reservation';
import { Property, AvailabilityStatus } from '../../src/Properties/Property';
import { query, transaction } from './connection';

/**
 * PostgreSQL storage implementation
 * Stores all data in a local PostgreSQL database
 */
export class PostgreSQLStorage implements IStorage {
  // Client operations
  async saveClient(client: Client): Promise<void> {
    try {
      await query(
        `INSERT INTO clients (id, name, email, phone, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           email = EXCLUDED.email,
           phone = EXCLUDED.phone,
           updated_at = EXCLUDED.updated_at`,
        [
          client.id,
          client.name,
          client.email,
          client.phone,
          client.createdAt,
          client.updatedAt,
        ]
      );
    } catch (error) {
      console.error('Error saving client to database:', error);
      throw error;
    }
  }

  async getClient(id: string): Promise<Client | null> {
    const rows = await query<{
      id: string;
      name: string;
      email: string;
      phone: string;
      created_at: Date;
      updated_at: Date;
    }>('SELECT * FROM clients WHERE id = $1', [id]);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async getAllClients(): Promise<Client[]> {
    const rows = await query<{
      id: string;
      name: string;
      email: string;
      phone: string;
      created_at: Date;
      updated_at: Date;
    }>('SELECT * FROM clients ORDER BY created_at DESC');

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async updateClient(id: string, client: Client): Promise<void> {
    const result = await query(
      `UPDATE clients 
       SET name = $1, email = $2, phone = $3, updated_at = $4
       WHERE id = $5`,
      [client.name, client.email, client.phone, client.updatedAt, id]
    );

    if (result.length === 0) {
      throw new Error(`Client with id ${id} not found`);
    }
  }

  async deleteClient(id: string): Promise<boolean> {
    const result = await query('DELETE FROM clients WHERE id = $1', [id]);
    return true; // PostgreSQL returns affected rows, but we'll return true if no error
  }

  // Reservation operations
  async saveReservation(reservation: Reservation): Promise<void> {
    await query(
      `INSERT INTO reservations (
        id, client_id, property_id, date, end_date, time, 
        number_of_guests, status, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        client_id = EXCLUDED.client_id,
        property_id = EXCLUDED.property_id,
        date = EXCLUDED.date,
        end_date = EXCLUDED.end_date,
        time = EXCLUDED.time,
        number_of_guests = EXCLUDED.number_of_guests,
        status = EXCLUDED.status,
        notes = EXCLUDED.notes,
        updated_at = EXCLUDED.updated_at`,
      [
        reservation.id,
        reservation.clientId,
        reservation.propertyId || null,
        reservation.date,
        reservation.endDate,
        reservation.time,
        reservation.numberOfGuests,
        reservation.status,
        reservation.notes || null,
        reservation.createdAt,
        reservation.updatedAt,
      ]
    );
  }

  async getReservation(id: string): Promise<Reservation | null> {
    const rows = await query<{
      id: string;
      client_id: string;
      property_id: string | null;
      date: Date;
      end_date: Date;
      time: string;
      number_of_guests: number;
      status: string;
      notes: string | null;
      created_at: Date;
      updated_at: Date;
    }>('SELECT * FROM reservations WHERE id = $1', [id]);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      clientId: row.client_id,
      propertyId: row.property_id || undefined,
      date: new Date(row.date),
      endDate: new Date(row.end_date),
      time: row.time,
      numberOfGuests: row.number_of_guests,
      status: row.status as ReservationStatus,
      notes: row.notes || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async getAllReservations(): Promise<Reservation[]> {
    const rows = await query<{
      id: string;
      client_id: string;
      property_id: string | null;
      date: Date;
      end_date: Date;
      time: string;
      number_of_guests: number;
      status: string;
      notes: string | null;
      created_at: Date;
      updated_at: Date;
    }>('SELECT * FROM reservations ORDER BY date DESC');

    return rows.map((row) => ({
      id: row.id,
      clientId: row.client_id,
      propertyId: row.property_id || undefined,
      date: new Date(row.date),
      endDate: new Date(row.end_date),
      time: row.time,
      numberOfGuests: row.number_of_guests,
      status: row.status as ReservationStatus,
      notes: row.notes || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async getReservationsByClient(clientId: string): Promise<Reservation[]> {
    const rows = await query<{
      id: string;
      client_id: string;
      property_id: string | null;
      date: Date;
      end_date: Date;
      time: string;
      number_of_guests: number;
      status: string;
      notes: string | null;
      created_at: Date;
      updated_at: Date;
    }>('SELECT * FROM reservations WHERE client_id = $1 ORDER BY date DESC', [
      clientId,
    ]);

    return rows.map((row) => ({
      id: row.id,
      clientId: row.client_id,
      propertyId: row.property_id || undefined,
      date: new Date(row.date),
      endDate: new Date(row.end_date),
      time: row.time,
      numberOfGuests: row.number_of_guests,
      status: row.status as ReservationStatus,
      notes: row.notes || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async getReservationsByProperty(propertyId: string): Promise<Reservation[]> {
    const rows = await query<{
      id: string;
      client_id: string;
      property_id: string | null;
      date: Date;
      end_date: Date;
      time: string;
      number_of_guests: number;
      status: string;
      notes: string | null;
      created_at: Date;
      updated_at: Date;
    }>(
      'SELECT * FROM reservations WHERE property_id = $1 ORDER BY date DESC',
      [propertyId]
    );

    return rows.map((row) => ({
      id: row.id,
      clientId: row.client_id,
      propertyId: row.property_id || undefined,
      date: new Date(row.date),
      endDate: new Date(row.end_date),
      time: row.time,
      numberOfGuests: row.number_of_guests,
      status: row.status as ReservationStatus,
      notes: row.notes || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async updateReservation(
    id: string,
    reservation: Reservation
  ): Promise<void> {
    const result = await query(
      `UPDATE reservations 
       SET client_id = $1, property_id = $2, date = $3, end_date = $4,
           time = $5, number_of_guests = $6, status = $7, notes = $8, updated_at = $9
       WHERE id = $10`,
      [
        reservation.clientId,
        reservation.propertyId || null,
        reservation.date,
        reservation.endDate,
        reservation.time,
        reservation.numberOfGuests,
        reservation.status,
        reservation.notes || null,
        reservation.updatedAt,
        id,
      ]
    );
  }

  async deleteReservation(id: string): Promise<boolean> {
    await query('DELETE FROM reservations WHERE id = $1', [id]);
    return true;
  }
}

