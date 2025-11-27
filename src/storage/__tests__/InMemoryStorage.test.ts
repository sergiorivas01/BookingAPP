import { InMemoryStorage } from '../InMemoryStorage';
import { Client } from '../../models/Client';
import { Reservation, ReservationStatus } from '../../models/Reservation';

describe('InMemoryStorage', () => {
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
  });

  describe('Client operations', () => {
    const mockClient: Client = {
      id: 'client-1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should save a client', async () => {
      await storage.saveClient(mockClient);
      const retrieved = await storage.getClient('client-1');
      expect(retrieved).toEqual(mockClient);
    });

    it('should get a client by id', async () => {
      await storage.saveClient(mockClient);
      const client = await storage.getClient('client-1');
      expect(client).toEqual(mockClient);
    });

    it('should return null when client not found', async () => {
      const client = await storage.getClient('non-existent');
      expect(client).toBeNull();
    });

    it('should get all clients', async () => {
      const client1: Client = {
        ...mockClient,
        id: 'client-1',
        email: 'client1@example.com',
      };
      const client2: Client = {
        ...mockClient,
        id: 'client-2',
        email: 'client2@example.com',
      };

      await storage.saveClient(client1);
      await storage.saveClient(client2);

      const allClients = await storage.getAllClients();
      expect(allClients).toHaveLength(2);
      expect(allClients).toContainEqual(client1);
      expect(allClients).toContainEqual(client2);
    });

    it('should update an existing client', async () => {
      await storage.saveClient(mockClient);
      const updatedClient: Client = {
        ...mockClient,
        name: 'Jane Doe',
        updatedAt: new Date(),
      };

      await storage.updateClient('client-1', updatedClient);
      const retrieved = await storage.getClient('client-1');
      expect(retrieved?.name).toBe('Jane Doe');
    });

    it('should throw error when updating non-existent client', async () => {
      const updatedClient: Client = {
        ...mockClient,
        id: 'non-existent',
      };

      await expect(
        storage.updateClient('non-existent', updatedClient)
      ).rejects.toThrow('Client with id non-existent not found');
    });

    it('should delete a client', async () => {
      await storage.saveClient(mockClient);
      const deleted = await storage.deleteClient('client-1');
      expect(deleted).toBe(true);

      const retrieved = await storage.getClient('client-1');
      expect(retrieved).toBeNull();
    });

    it('should return false when deleting non-existent client', async () => {
      const deleted = await storage.deleteClient('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('Reservation operations', () => {
    const mockReservation: Reservation = {
      id: 'reservation-1',
      clientId: 'client-1',
      date: new Date('2024-12-31'),
      endDate: new Date('2025-01-05'),
      time: '18:00',
      numberOfGuests: 4,
      status: ReservationStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should save a reservation', async () => {
      await storage.saveReservation(mockReservation);
      const retrieved = await storage.getReservation('reservation-1');
      expect(retrieved).toEqual(mockReservation);
    });

    it('should get a reservation by id', async () => {
      await storage.saveReservation(mockReservation);
      const reservation = await storage.getReservation('reservation-1');
      expect(reservation).toEqual(mockReservation);
    });

    it('should return null when reservation not found', async () => {
      const reservation = await storage.getReservation('non-existent');
      expect(reservation).toBeNull();
    });

    it('should get all reservations', async () => {
      const reservation1: Reservation = {
        ...mockReservation,
        id: 'reservation-1',
      };
      const reservation2: Reservation = {
        ...mockReservation,
        id: 'reservation-2',
      };

      await storage.saveReservation(reservation1);
      await storage.saveReservation(reservation2);

      const allReservations = await storage.getAllReservations();
      expect(allReservations).toHaveLength(2);
      expect(allReservations).toContainEqual(reservation1);
      expect(allReservations).toContainEqual(reservation2);
    });

    it('should get reservations by client id', async () => {
      const reservation1: Reservation = {
        ...mockReservation,
        id: 'reservation-1',
        clientId: 'client-1',
      };
      const reservation2: Reservation = {
        ...mockReservation,
        id: 'reservation-2',
        clientId: 'client-1',
      };
      const reservation3: Reservation = {
        ...mockReservation,
        id: 'reservation-3',
        clientId: 'client-2',
      };

      await storage.saveReservation(reservation1);
      await storage.saveReservation(reservation2);
      await storage.saveReservation(reservation3);

      const clientReservations = await storage.getReservationsByClient('client-1');
      expect(clientReservations).toHaveLength(2);
      expect(clientReservations).toContainEqual(reservation1);
      expect(clientReservations).toContainEqual(reservation2);
      expect(clientReservations).not.toContainEqual(reservation3);
    });

    it('should return empty array when client has no reservations', async () => {
      const reservations = await storage.getReservationsByClient('client-1');
      expect(reservations).toHaveLength(0);
    });

    it('should update an existing reservation', async () => {
      await storage.saveReservation(mockReservation);
      const updatedReservation: Reservation = {
        ...mockReservation,
        status: ReservationStatus.CONFIRMED,
        updatedAt: new Date(),
      };

      await storage.updateReservation('reservation-1', updatedReservation);
      const retrieved = await storage.getReservation('reservation-1');
      expect(retrieved?.status).toBe(ReservationStatus.CONFIRMED);
    });

    it('should throw error when updating non-existent reservation', async () => {
      const updatedReservation: Reservation = {
        ...mockReservation,
        id: 'non-existent',
      };

      await expect(
        storage.updateReservation('non-existent', updatedReservation)
      ).rejects.toThrow('Reservation with id non-existent not found');
    });

    it('should delete a reservation', async () => {
      await storage.saveReservation(mockReservation);
      const deleted = await storage.deleteReservation('reservation-1');
      expect(deleted).toBe(true);

      const retrieved = await storage.getReservation('reservation-1');
      expect(retrieved).toBeNull();
    });

    it('should return false when deleting non-existent reservation', async () => {
      const deleted = await storage.deleteReservation('non-existent');
      expect(deleted).toBe(false);
    });
  });
});

