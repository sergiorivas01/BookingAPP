import { PropertyAvailabilityHelper } from '../PropertyAvailabilityHelper';
import {
  Property,
  PropertyAvailabilityInfo,
  PropertyAvailabilityDisplay,
  AvailabilityStatus,
  PropertyType,
} from '../Property';
import { Reservation, ReservationStatus } from '../../models/Reservation';

describe('PropertyAvailabilityHelper', () => {
  const createMockProperty = (
    id: string,
    name: string,
    availability: AvailabilityStatus = AvailabilityStatus.AVAILABLE
  ): Property => ({
    id,
    name,
    description: 'Test property',
    specifications: {
      area: 100,
      capacity: 4,
      bedrooms: 2,
      bathrooms: 1,
      type: PropertyType.APARTMENT,
    },
    price: 100,
    availability,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  });

  const createMockReservation = (
    id: string,
    propertyId: string,
    checkInDate: Date,
    checkOutDate: Date,
    status: ReservationStatus = ReservationStatus.CONFIRMED
  ): Reservation => ({
    id,
    clientId: 'client-1',
    propertyId,
    date: checkInDate,
    endDate: checkOutDate,
    time: '14:00',
    numberOfGuests: 2,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  describe('calculateAvailabilityInfo', () => {
    it('should return available when property has no reservations', () => {
      const property = createMockProperty('prop-1', 'Test Property');
      const reservations: Reservation[] = [];

      const result = PropertyAvailabilityHelper.calculateAvailabilityInfo(
        property,
        reservations
      );

      expect(result.isAvailable).toBe(true);
      expect(result.currentBooking).toBeUndefined();
      expect(result.nextAvailableDate).toBeDefined();
    });

    it('should return unavailable when property is in maintenance', () => {
      const property = createMockProperty(
        'prop-1',
        'Test Property',
        AvailabilityStatus.MAINTENANCE
      );
      const reservations: Reservation[] = [];

      const result = PropertyAvailabilityHelper.calculateAvailabilityInfo(
        property,
        reservations
      );

      expect(result.isAvailable).toBe(false);
    });

    it('should detect current booking when reservation is active', () => {
      const property = createMockProperty('prop-1', 'Test Property');
      const now = new Date();
      const checkIn = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
      const checkOut = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

      const reservation = createMockReservation(
        'res-1',
        'prop-1',
        checkIn,
        checkOut,
        ReservationStatus.CONFIRMED
      );

      const result = PropertyAvailabilityHelper.calculateAvailabilityInfo(
        property,
        [reservation]
      );

      expect(result.isAvailable).toBe(false);
      expect(result.currentBooking).toBeDefined();
      expect(result.currentBooking?.reservationId).toBe('res-1');
      expect(result.currentBooking?.durationDays).toBe(5); // 2 days ago to 3 days from now = 5 days
      expect(result.bookedUntil).toEqual(checkOut);
      expect(result.nextAvailableDate).toBeDefined();
    });

    it('should ignore cancelled reservations', () => {
      const property = createMockProperty('prop-1', 'Test Property');
      const now = new Date();
      const checkIn = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
      const checkOut = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

      const cancelledReservation = createMockReservation(
        'res-1',
        'prop-1',
        checkIn,
        checkOut,
        ReservationStatus.CANCELLED
      );

      const result = PropertyAvailabilityHelper.calculateAvailabilityInfo(
        property,
        [cancelledReservation]
      );

      expect(result.isAvailable).toBe(true);
      expect(result.currentBooking).toBeUndefined();
    });

    it('should ignore completed reservations', () => {
      const property = createMockProperty('prop-1', 'Test Property');
      const now = new Date();
      const checkIn = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      const checkOut = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // Past date

      const completedReservation = createMockReservation(
        'res-1',
        'prop-1',
        checkIn,
        checkOut,
        ReservationStatus.COMPLETED
      );

      const result = PropertyAvailabilityHelper.calculateAvailabilityInfo(
        property,
        [completedReservation]
      );

      expect(result.isAvailable).toBe(true);
      expect(result.currentBooking).toBeUndefined();
    });

    it('should ignore reservations for other properties', () => {
      const property = createMockProperty('prop-1', 'Test Property');
      const now = new Date();
      const checkIn = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
      const checkOut = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

      const otherPropertyReservation = createMockReservation(
        'res-1',
        'prop-2', // Different property
        checkIn,
        checkOut
      );

      const result = PropertyAvailabilityHelper.calculateAvailabilityInfo(
        property,
        [otherPropertyReservation]
      );

      expect(result.isAvailable).toBe(true);
      expect(result.currentBooking).toBeUndefined();
    });

    it('should handle future booking correctly', () => {
      const property = createMockProperty('prop-1', 'Test Property');
      const now = new Date();
      const checkIn = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from now
      const checkOut = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000); // 8 days from now

      const futureReservation = createMockReservation(
        'res-1',
        'prop-1',
        checkIn,
        checkOut
      );

      const result = PropertyAvailabilityHelper.calculateAvailabilityInfo(
        property,
        [futureReservation]
      );

      expect(result.isAvailable).toBe(true);
      expect(result.currentBooking).toBeUndefined();
      expect(result.nextAvailableDate).toEqual(checkIn);
    });

    it('should calculate next available date after current booking ends', () => {
      const property = createMockProperty('prop-1', 'Test Property');
      const now = new Date();
      const checkIn = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
      const checkOut = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      const reservation = createMockReservation(
        'res-1',
        'prop-1',
        checkIn,
        checkOut
      );

      const result = PropertyAvailabilityHelper.calculateAvailabilityInfo(
        property,
        [reservation]
      );

      expect(result.nextAvailableDate).toBeDefined();
      if (result.nextAvailableDate) {
        const nextAvailable = new Date(
          checkOut.getTime() + 24 * 60 * 60 * 1000
        );
        expect(result.nextAvailableDate.getTime()).toBeCloseTo(
          nextAvailable.getTime(),
          -3
        );
      }
    });

    it('should handle multiple reservations correctly', () => {
      const property = createMockProperty('prop-1', 'Test Property');
      const now = new Date();
      
      // Current booking
      const currentCheckIn = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
      const currentCheckOut = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      const currentReservation = createMockReservation(
        'res-1',
        'prop-1',
        currentCheckIn,
        currentCheckOut
      );

      // Future booking
      const futureCheckIn = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
      const futureCheckOut = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);
      const futureReservation = createMockReservation(
        'res-2',
        'prop-1',
        futureCheckIn,
        futureCheckOut
      );

      const result = PropertyAvailabilityHelper.calculateAvailabilityInfo(
        property,
        [currentReservation, futureReservation]
      );

      expect(result.isAvailable).toBe(false);
      expect(result.currentBooking?.reservationId).toBe('res-1');
      expect(result.bookedUntil).toEqual(currentCheckOut);
    });
  });

  describe('createAvailabilityDisplay', () => {
    it('should create display for available property', () => {
      const property = createMockProperty('prop-1', 'Test Property');
      const availabilityInfo: PropertyAvailabilityInfo = {
        isAvailable: true,
        nextAvailableDate: new Date(),
      };

      const display = PropertyAvailabilityHelper.createAvailabilityDisplay(
        property,
        availabilityInfo
      );

      expect(display.propertyId).toBe('prop-1');
      expect(display.propertyName).toBe('Test Property');
      expect(display.isAvailable).toBe(true);
      expect(display.message).toBe('Property is available now');
    });

    it('should create display for property in maintenance', () => {
      const property = createMockProperty(
        'prop-1',
        'Test Property',
        AvailabilityStatus.MAINTENANCE
      );
      const availabilityInfo: PropertyAvailabilityInfo = {
        isAvailable: false,
      };

      const display = PropertyAvailabilityHelper.createAvailabilityDisplay(
        property,
        availabilityInfo
      );

      expect(display.message).toBe('Property is currently under maintenance');
      expect(display.isAvailable).toBe(false);
    });

    it('should create display for booked property with duration', () => {
      const property = createMockProperty('prop-1', 'Test Property');
      const checkOut = new Date('2024-12-31');
      const availabilityInfo: PropertyAvailabilityInfo = {
        isAvailable: false,
        currentBooking: {
          reservationId: 'res-1',
          clientId: 'client-1',
          checkInDate: new Date('2024-12-26'),
          checkOutDate: checkOut,
          durationDays: 5,
          status: ReservationStatus.CONFIRMED,
        },
        bookedUntil: checkOut,
        nextAvailableDate: new Date('2025-01-01'),
      };

      const display = PropertyAvailabilityHelper.createAvailabilityDisplay(
        property,
        availabilityInfo
      );

      expect(display.isAvailable).toBe(false);
      expect(display.currentBooking).toBeDefined();
      expect(display.currentBooking?.durationDays).toBe(5);
      expect(display.message).toContain('Property is booked for 5 day(s)');
      expect(display.message).toContain('Available from');
    });

    it('should create display for property with future availability', () => {
      const property = createMockProperty('prop-1', 'Test Property');
      const nextAvailable = new Date('2024-12-31');
      const availabilityInfo: PropertyAvailabilityInfo = {
        isAvailable: false,
        nextAvailableDate: nextAvailable,
      };

      const display = PropertyAvailabilityHelper.createAvailabilityDisplay(
        property,
        availabilityInfo
      );

      expect(display.message).toContain('Property will be available on');
      expect(display.nextAvailableDate).toEqual(nextAvailable);
    });

    it('should include current booking details in display', () => {
      const property = createMockProperty('prop-1', 'Test Property');
      const checkIn = new Date('2024-12-26');
      const checkOut = new Date('2024-12-31');
      const availabilityInfo: PropertyAvailabilityInfo = {
        isAvailable: false,
        currentBooking: {
          reservationId: 'res-1',
          clientId: 'client-1',
          checkInDate: checkIn,
          checkOutDate: checkOut,
          durationDays: 5,
          status: ReservationStatus.CONFIRMED,
        },
        bookedUntil: checkOut,
      };

      const display = PropertyAvailabilityHelper.createAvailabilityDisplay(
        property,
        availabilityInfo
      );

      expect(display.currentBooking).toBeDefined();
      expect(display.currentBooking?.checkInDate).toEqual(checkIn);
      expect(display.currentBooking?.checkOutDate).toEqual(checkOut);
      expect(display.currentBooking?.bookedUntil).toEqual(checkOut);
    });
  });

  describe('getPropertiesAvailability', () => {
    it('should return availability for multiple properties', () => {
      const property1 = createMockProperty('prop-1', 'Property 1');
      const property2 = createMockProperty('prop-2', 'Property 2');
      const now = new Date();

      // Property 1 has a current booking
      const reservation1 = createMockReservation(
        'res-1',
        'prop-1',
        new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
      );

      // Property 2 has no bookings
      const reservations: Reservation[] = [reservation1];

      const results = PropertyAvailabilityHelper.getPropertiesAvailability(
        [property1, property2],
        reservations
      );

      expect(results).toHaveLength(2);
      expect(results[0].propertyId).toBe('prop-1');
      expect(results[0].isAvailable).toBe(false);
      expect(results[1].propertyId).toBe('prop-2');
      expect(results[1].isAvailable).toBe(true);
    });

    it('should filter reservations by property correctly', () => {
      const property1 = createMockProperty('prop-1', 'Property 1');
      const property2 = createMockProperty('prop-2', 'Property 2');
      const now = new Date();

      const reservation1 = createMockReservation(
        'res-1',
        'prop-1',
        new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
      );

      const reservation2 = createMockReservation(
        'res-2',
        'prop-2',
        new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000)
      );

      const results = PropertyAvailabilityHelper.getPropertiesAvailability(
        [property1, property2],
        [reservation1, reservation2]
      );

      expect(results[0].propertyId).toBe('prop-1');
      expect(results[0].isAvailable).toBe(false);
      expect(results[1].propertyId).toBe('prop-2');
      expect(results[1].isAvailable).toBe(true);
    });

    it('should handle empty properties array', () => {
      const results = PropertyAvailabilityHelper.getPropertiesAvailability(
        [],
        []
      );

      expect(results).toHaveLength(0);
    });

    it('should handle properties with no reservations', () => {
      const property1 = createMockProperty('prop-1', 'Property 1');
      const property2 = createMockProperty('prop-2', 'Property 2');

      const results = PropertyAvailabilityHelper.getPropertiesAvailability(
        [property1, property2],
        []
      );

      expect(results).toHaveLength(2);
      expect(results[0].isAvailable).toBe(true);
      expect(results[1].isAvailable).toBe(true);
    });
  });

  describe('calculateDaysBetween (indirect testing)', () => {
    it('should calculate correct duration for bookings', () => {
      const property = createMockProperty('prop-1', 'Test Property');
      const checkIn = new Date('2024-12-01');
      const checkOut = new Date('2024-12-06'); // 5 days

      const reservation = createMockReservation(
        'res-1',
        'prop-1',
        checkIn,
        checkOut
      );

      const result = PropertyAvailabilityHelper.calculateAvailabilityInfo(
        property,
        [reservation]
      );

      // The booking duration should be calculated correctly
      // Since checkIn is in the past relative to "now", we need to adjust
      // Let's use a current booking scenario
      const now = new Date();
      const currentCheckIn = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      const currentCheckOut = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      const currentReservation = createMockReservation(
        'res-2',
        'prop-1',
        currentCheckIn,
        currentCheckOut
      );

      const currentResult = PropertyAvailabilityHelper.calculateAvailabilityInfo(
        property,
        [currentReservation]
      );

      expect(currentResult.currentBooking?.durationDays).toBe(5);
    });

    it('should handle single day bookings', () => {
      const property = createMockProperty('prop-1', 'Test Property');
      const now = new Date();
      const checkIn = new Date(now.getTime() - 12 * 60 * 60 * 1000); // 12 hours ago
      const checkOut = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours from now

      const reservation = createMockReservation(
        'res-1',
        'prop-1',
        checkIn,
        checkOut
      );

      const result = PropertyAvailabilityHelper.calculateAvailabilityInfo(
        property,
        [reservation]
      );

      expect(result.currentBooking?.durationDays).toBeGreaterThanOrEqual(1);
    });
  });
});

