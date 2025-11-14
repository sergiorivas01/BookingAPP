import { ReservationService } from '../ReservationService';
import {
  CreateReservationDTO,
  UpdateReservationDTO,
  ReservationStatus,
} from '../../models/Reservation';
import { IStorage } from '../../storage/Storage';
import { Client } from '../../models/Client';
import { Reservation } from '../../models/Reservation';

describe('ReservationService', () => {
  let service: ReservationService;
  let mockStorage: jest.Mocked<IStorage>;

  const mockClient: Client = {
    id: 'client-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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

    service = new ReservationService(mockStorage);
  });

  describe('createReservation', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const futureEndDate = new Date();
    futureEndDate.setDate(futureEndDate.getDate() + 10);

    const validDTO: CreateReservationDTO = {
      clientId: 'client-1',
      date: futureDate,
      endDate: futureEndDate,
      time: '18:00',
      numberOfGuests: 4,
      notes: 'Window seat preferred',
    };

    it('should create a reservation with valid data', async () => {
      mockStorage.getClient.mockResolvedValue(mockClient);
      mockStorage.saveReservation.mockResolvedValue();

      const reservation = await service.createReservation(validDTO);

      expect(reservation).toMatchObject({
        clientId: validDTO.clientId,
        date: validDTO.date,
        endDate: validDTO.endDate,
        time: validDTO.time,
        numberOfGuests: validDTO.numberOfGuests,
        notes: validDTO.notes,
        status: ReservationStatus.PENDING,
      });
      expect(reservation.id).toBeDefined();
      expect(reservation.createdAt).toBeInstanceOf(Date);
      expect(reservation.updatedAt).toBeInstanceOf(Date);
      expect(mockStorage.saveReservation).toHaveBeenCalledWith(reservation);
    });

    it('should create reservation without notes', async () => {
      const dtoWithoutNotes: CreateReservationDTO = {
        ...validDTO,
        notes: undefined,
      };

      mockStorage.getClient.mockResolvedValue(mockClient);
      mockStorage.saveReservation.mockResolvedValue();

      const reservation = await service.createReservation(dtoWithoutNotes);

      expect(reservation.notes).toBeUndefined();
    });

    it('should throw error when client does not exist', async () => {
      mockStorage.getClient.mockResolvedValue(null);

      await expect(service.createReservation(validDTO)).rejects.toThrow(
        'Client with id client-1 not found'
      );

      expect(mockStorage.saveReservation).not.toHaveBeenCalled();
    });

    it('should throw error for past date', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const pastEndDate = new Date();
      pastEndDate.setDate(pastEndDate.getDate() + 2);

      const dtoWithPastDate: CreateReservationDTO = {
        ...validDTO,
        date: pastDate,
        endDate: pastEndDate,
      };

      mockStorage.getClient.mockResolvedValue(mockClient);

      await expect(service.createReservation(dtoWithPastDate)).rejects.toThrow(
        'Cannot create reservation for a past date'
      );

      expect(mockStorage.saveReservation).not.toHaveBeenCalled();
    });

    it('should throw error for past end date', async () => {
      const pastEndDate = new Date();
      pastEndDate.setDate(pastEndDate.getDate() - 1);

      const dtoWithPastEndDate: CreateReservationDTO = {
        ...validDTO,
        endDate: pastEndDate,
      };

      mockStorage.getClient.mockResolvedValue(mockClient);

      await expect(service.createReservation(dtoWithPastEndDate)).rejects.toThrow(
        'Cannot create reservation with end date in the past'
      );

      expect(mockStorage.saveReservation).not.toHaveBeenCalled();
    });

    it('should throw error when end date is before start date', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 7);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 5); // Before start date

      const dtoWithInvalidDates: CreateReservationDTO = {
        ...validDTO,
        date: startDate,
        endDate: endDate,
      };

      mockStorage.getClient.mockResolvedValue(mockClient);

      await expect(service.createReservation(dtoWithInvalidDates)).rejects.toThrow(
        'End date must be after start date'
      );

      expect(mockStorage.saveReservation).not.toHaveBeenCalled();
    });

    it('should throw error for zero guests', async () => {
      const dtoWithZeroGuests: CreateReservationDTO = {
        ...validDTO,
        numberOfGuests: 0,
      };

      mockStorage.getClient.mockResolvedValue(mockClient);

      await expect(service.createReservation(dtoWithZeroGuests)).rejects.toThrow(
        'Number of guests must be greater than 0'
      );

      expect(mockStorage.saveReservation).not.toHaveBeenCalled();
    });

    it('should throw error for negative guests', async () => {
      const dtoWithNegativeGuests: CreateReservationDTO = {
        ...validDTO,
        numberOfGuests: -1,
      };

      mockStorage.getClient.mockResolvedValue(mockClient);

      await expect(
        service.createReservation(dtoWithNegativeGuests)
      ).rejects.toThrow('Number of guests must be greater than 0');

      expect(mockStorage.saveReservation).not.toHaveBeenCalled();
    });
  });

  describe('getReservation', () => {
    it('should return a reservation by id', async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 3);
      const mockReservation: Reservation = {
        id: 'reservation-1',
        clientId: 'client-1',
        date: startDate,
        endDate: endDate,
        time: '18:00',
        numberOfGuests: 4,
        status: ReservationStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStorage.getReservation.mockResolvedValue(mockReservation);

      const reservation = await service.getReservation('reservation-1');

      expect(reservation).toEqual(mockReservation);
      expect(mockStorage.getReservation).toHaveBeenCalledWith('reservation-1');
    });

    it('should return null when reservation not found', async () => {
      mockStorage.getReservation.mockResolvedValue(null);

      const reservation = await service.getReservation('non-existent');

      expect(reservation).toBeNull();
    });
  });

  describe('getAllReservations', () => {
    it('should return all reservations', async () => {
      const startDate1 = new Date();
      const endDate1 = new Date();
      endDate1.setDate(endDate1.getDate() + 3);
      const startDate2 = new Date();
      const endDate2 = new Date();
      endDate2.setDate(endDate2.getDate() + 5);
      const reservations: Reservation[] = [
        {
          id: 'reservation-1',
          clientId: 'client-1',
          date: startDate1,
          endDate: endDate1,
          time: '18:00',
          numberOfGuests: 4,
          status: ReservationStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'reservation-2',
          clientId: 'client-2',
          date: startDate2,
          endDate: endDate2,
          time: '19:00',
          numberOfGuests: 2,
          status: ReservationStatus.CONFIRMED,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockStorage.getAllReservations.mockResolvedValue(reservations);

      const result = await service.getAllReservations();

      expect(result).toEqual(reservations);
      expect(mockStorage.getAllReservations).toHaveBeenCalled();
    });
  });

  describe('getReservationsByClient', () => {
    it('should return reservations for a specific client', async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 3);
      const reservations: Reservation[] = [
        {
          id: 'reservation-1',
          clientId: 'client-1',
          date: startDate,
          endDate: endDate,
          time: '18:00',
          numberOfGuests: 4,
          status: ReservationStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockStorage.getReservationsByClient.mockResolvedValue(reservations);

      const result = await service.getReservationsByClient('client-1');

      expect(result).toEqual(reservations);
      expect(mockStorage.getReservationsByClient).toHaveBeenCalledWith('client-1');
    });
  });

  describe('updateReservation', () => {
    const existingReservation: Reservation = {
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

    it('should update reservation with valid data', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const futureEndDate = new Date();
      futureEndDate.setDate(futureEndDate.getDate() + 10);

      mockStorage.getReservation.mockResolvedValue(existingReservation);
      mockStorage.updateReservation.mockResolvedValue();

      const updateDTO: UpdateReservationDTO = {
        date: futureDate,
        endDate: futureEndDate,
        time: '19:00',
        numberOfGuests: 6,
      };

      const updated = await service.updateReservation('reservation-1', updateDTO);

      expect(updated.date).toEqual(futureDate);
      expect(updated.endDate).toEqual(futureEndDate);
      expect(updated.time).toBe('19:00');
      expect(updated.numberOfGuests).toBe(6);
      expect(updated.updatedAt.getTime()).toBeGreaterThan(
        existingReservation.updatedAt.getTime()
      );
      expect(mockStorage.updateReservation).toHaveBeenCalled();
    });

    it('should throw error when reservation not found', async () => {
      mockStorage.getReservation.mockResolvedValue(null);

      await expect(
        service.updateReservation('non-existent', { time: '20:00' })
      ).rejects.toThrow('Reservation with id non-existent not found');

      expect(mockStorage.updateReservation).not.toHaveBeenCalled();
    });

    it('should throw error for past date', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      mockStorage.getReservation.mockResolvedValue(existingReservation);

      await expect(
        service.updateReservation('reservation-1', { date: pastDate })
      ).rejects.toThrow('Cannot update reservation to a past date');

      expect(mockStorage.updateReservation).not.toHaveBeenCalled();
    });

    it('should throw error for past end date', async () => {
      const pastEndDate = new Date();
      pastEndDate.setDate(pastEndDate.getDate() - 1);

      mockStorage.getReservation.mockResolvedValue(existingReservation);

      await expect(
        service.updateReservation('reservation-1', { endDate: pastEndDate })
      ).rejects.toThrow('Cannot update reservation with end date in the past');

      expect(mockStorage.updateReservation).not.toHaveBeenCalled();
    });

    it('should throw error when end date is before start date in update', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 7);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 5); // Before start date

      mockStorage.getReservation.mockResolvedValue(existingReservation);

      await expect(
        service.updateReservation('reservation-1', {
          date: startDate,
          endDate: endDate,
        })
      ).rejects.toThrow('End date must be after start date');

      expect(mockStorage.updateReservation).not.toHaveBeenCalled();
    });

    it('should throw error for zero guests', async () => {
      mockStorage.getReservation.mockResolvedValue(existingReservation);

      await expect(
        service.updateReservation('reservation-1', { numberOfGuests: 0 })
      ).rejects.toThrow('Number of guests must be greater than 0');

      expect(mockStorage.updateReservation).not.toHaveBeenCalled();
    });

    it('should throw error for negative guests', async () => {
      mockStorage.getReservation.mockResolvedValue(existingReservation);

      await expect(
        service.updateReservation('reservation-1', { numberOfGuests: -1 })
      ).rejects.toThrow('Number of guests must be greater than 0');

      expect(mockStorage.updateReservation).not.toHaveBeenCalled();
    });

    it('should allow updating status', async () => {
      mockStorage.getReservation.mockResolvedValue(existingReservation);
      mockStorage.updateReservation.mockResolvedValue();

      const updated = await service.updateReservation('reservation-1', {
        status: ReservationStatus.CONFIRMED,
      });

      expect(updated.status).toBe(ReservationStatus.CONFIRMED);
      expect(mockStorage.updateReservation).toHaveBeenCalled();
    });
  });

  describe('deleteReservation', () => {
    it('should delete an existing reservation', async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 3);
      const mockReservation: Reservation = {
        id: 'reservation-1',
        clientId: 'client-1',
        date: startDate,
        endDate: endDate,
        time: '18:00',
        numberOfGuests: 4,
        status: ReservationStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStorage.getReservation.mockResolvedValue(mockReservation);
      mockStorage.deleteReservation.mockResolvedValue(true);

      const result = await service.deleteReservation('reservation-1');

      expect(result).toBe(true);
      expect(mockStorage.deleteReservation).toHaveBeenCalledWith('reservation-1');
    });

    it('should throw error when reservation not found', async () => {
      mockStorage.getReservation.mockResolvedValue(null);

      await expect(service.deleteReservation('non-existent')).rejects.toThrow(
        'Reservation with id non-existent not found'
      );

      expect(mockStorage.deleteReservation).not.toHaveBeenCalled();
    });
  });

  describe('confirmReservation', () => {
    it('should confirm a reservation', async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 3);
      const mockReservation: Reservation = {
        id: 'reservation-1',
        clientId: 'client-1',
        date: startDate,
        endDate: endDate,
        time: '18:00',
        numberOfGuests: 4,
        status: ReservationStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStorage.getReservation.mockResolvedValue(mockReservation);
      mockStorage.updateReservation.mockResolvedValue();

      const confirmed = await service.confirmReservation('reservation-1');

      expect(confirmed.status).toBe(ReservationStatus.CONFIRMED);
      expect(mockStorage.updateReservation).toHaveBeenCalledWith(
        'reservation-1',
        expect.objectContaining({ status: ReservationStatus.CONFIRMED })
      );
    });
  });

  describe('cancelReservation', () => {
    it('should cancel a reservation', async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 3);
      const mockReservation: Reservation = {
        id: 'reservation-1',
        clientId: 'client-1',
        date: startDate,
        endDate: endDate,
        time: '18:00',
        numberOfGuests: 4,
        status: ReservationStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStorage.getReservation.mockResolvedValue(mockReservation);
      mockStorage.updateReservation.mockResolvedValue();

      const cancelled = await service.cancelReservation('reservation-1');

      expect(cancelled.status).toBe(ReservationStatus.CANCELLED);
      expect(mockStorage.updateReservation).toHaveBeenCalledWith(
        'reservation-1',
        expect.objectContaining({ status: ReservationStatus.CANCELLED })
      );
    });
  });
});

