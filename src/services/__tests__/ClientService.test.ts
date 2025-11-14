import { ClientService } from '../ClientService';
import { CreateClientDTO, UpdateClientDTO } from '../../models/Client';
import { IStorage } from '../../storage/Storage';
import { Client } from '../../models/Client';

describe('ClientService', () => {
  let service: ClientService;
  let mockStorage: jest.Mocked<IStorage>;

  beforeEach(() => {
    mockStorage = {
      saveClient: jest.fn(),
      getClient: jest.fn(),
      getAllClients: jest.fn(),
      updateClient: jest.fn(),
      deleteClient: jest.fn(),
      saveReservation: jest.fn(),
      getReservation: jest.fn(),
      getAllReservations: jest.fn(),
      getReservationsByClient: jest.fn(),
      getReservationsByProperty: jest.fn(),
      updateReservation: jest.fn(),
      deleteReservation: jest.fn(),
    };

    service = new ClientService(mockStorage);
  });

  describe('createClient', () => {
    const validDTO: CreateClientDTO = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
    };

    it('should create a client with valid data', async () => {
      mockStorage.getAllClients.mockResolvedValue([]);
      mockStorage.saveClient.mockResolvedValue();

      const client = await service.createClient(validDTO);

      expect(client).toMatchObject({
        name: validDTO.name,
        email: validDTO.email,
        phone: validDTO.phone,
      });
      expect(client.id).toBeDefined();
      expect(client.createdAt).toBeInstanceOf(Date);
      expect(client.updatedAt).toBeInstanceOf(Date);
      expect(mockStorage.saveClient).toHaveBeenCalledWith(client);
    });

    it('should throw error for invalid email format', async () => {
      const invalidDTO: CreateClientDTO = {
        ...validDTO,
        email: 'invalid-email',
      };

      await expect(service.createClient(invalidDTO)).rejects.toThrow(
        'Invalid email format'
      );
      expect(mockStorage.saveClient).not.toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      const existingClient: Client = {
        id: 'existing-id',
        name: 'Existing User',
        email: validDTO.email,
        phone: '000-000-0000',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStorage.getAllClients.mockResolvedValue([existingClient]);

      await expect(service.createClient(validDTO)).rejects.toThrow(
        'Client with this email already exists'
      );
      expect(mockStorage.saveClient).not.toHaveBeenCalled();
    });

    it('should accept valid email formats', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
      ];

      for (const email of validEmails) {
        mockStorage.getAllClients.mockResolvedValue([]);
        mockStorage.saveClient.mockResolvedValue();

        const dto = { ...validDTO, email };
        const client = await service.createClient(dto);

        expect(client.email).toBe(email);
      }
    });
  });

  describe('getClient', () => {
    it('should return a client by id', async () => {
      const mockClient: Client = {
        id: 'client-1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStorage.getClient.mockResolvedValue(mockClient);

      const client = await service.getClient('client-1');

      expect(client).toEqual(mockClient);
      expect(mockStorage.getClient).toHaveBeenCalledWith('client-1');
    });

    it('should return null when client not found', async () => {
      mockStorage.getClient.mockResolvedValue(null);

      const client = await service.getClient('non-existent');

      expect(client).toBeNull();
    });
  });

  describe('getAllClients', () => {
    it('should return all clients', async () => {
      const clients: Client[] = [
        {
          id: 'client-1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'client-2',
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '098-765-4321',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockStorage.getAllClients.mockResolvedValue(clients);

      const result = await service.getAllClients();

      expect(result).toEqual(clients);
      expect(mockStorage.getAllClients).toHaveBeenCalled();
    });
  });

  describe('updateClient', () => {
    const existingClient: Client = {
      id: 'client-1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update client with valid data', async () => {
      mockStorage.getClient.mockResolvedValue(existingClient);
      mockStorage.getAllClients.mockResolvedValue([existingClient]);
      mockStorage.updateClient.mockResolvedValue();

      const updateDTO: UpdateClientDTO = {
        name: 'Jane Doe',
        phone: '999-999-9999',
      };

      const updated = await service.updateClient('client-1', updateDTO);

      expect(updated.name).toBe('Jane Doe');
      expect(updated.phone).toBe('999-999-9999');
      expect(updated.email).toBe(existingClient.email);
      expect(updated.updatedAt.getTime()).toBeGreaterThan(
        existingClient.updatedAt.getTime()
      );
      expect(mockStorage.updateClient).toHaveBeenCalled();
    });

    it('should throw error when client not found', async () => {
      mockStorage.getClient.mockResolvedValue(null);

      await expect(
        service.updateClient('non-existent', { name: 'New Name' })
      ).rejects.toThrow('Client with id non-existent not found');

      expect(mockStorage.updateClient).not.toHaveBeenCalled();
    });

    it('should throw error for invalid email format', async () => {
      mockStorage.getClient.mockResolvedValue(existingClient);

      await expect(
        service.updateClient('client-1', { email: 'invalid-email' })
      ).rejects.toThrow('Invalid email format');

      expect(mockStorage.updateClient).not.toHaveBeenCalled();
    });

    it('should throw error if new email already exists', async () => {
      const otherClient: Client = {
        id: 'client-2',
        name: 'Other User',
        email: 'other@example.com',
        phone: '000-000-0000',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStorage.getClient.mockResolvedValue(existingClient);
      mockStorage.getAllClients.mockResolvedValue([existingClient, otherClient]);

      await expect(
        service.updateClient('client-1', { email: 'other@example.com' })
      ).rejects.toThrow('Client with this email already exists');

      expect(mockStorage.updateClient).not.toHaveBeenCalled();
    });

    it('should allow updating to same email', async () => {
      mockStorage.getClient.mockResolvedValue(existingClient);
      mockStorage.getAllClients.mockResolvedValue([existingClient]);
      mockStorage.updateClient.mockResolvedValue();

      const updated = await service.updateClient('client-1', {
        email: existingClient.email,
      });

      expect(updated.email).toBe(existingClient.email);
      expect(mockStorage.updateClient).toHaveBeenCalled();
    });
  });

  describe('deleteClient', () => {
    it('should delete an existing client', async () => {
      const mockClient: Client = {
        id: 'client-1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStorage.getClient.mockResolvedValue(mockClient);
      mockStorage.deleteClient.mockResolvedValue(true);

    });
  });
});

