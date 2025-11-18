jest.mock('chalk', () => {
  const withBold = () => {
    const fn = (str: string) => str;
    (fn as any).bold = (str: string) => str;
    return fn;
  };

  return {
    bold: {
      cyan: (str: string) => str,
      white: (str: string) => str,
      yellow: (str: string) => str,
    },
    gray: (str: string) => str,
    green: withBold(),
    red: withBold(),
  };
});

import { generateCalendar, displayCalendar } from '../calendar';
import {
  Property,
  PropertyType,
  AvailabilityStatus,
} from '../../Properties/Property';
import {
  Reservation,
  ReservationStatus,
} from '../../models/Reservation';

const DAY_MS = 24 * 60 * 60 * 1000;

const createProperty = (): Property => ({
  id: 'property-1',
  name: 'Test Property',
  specifications: {
    type: PropertyType.APARTMENT,
    location: 'Test City',
  },
  price: 150,
  availability: AvailabilityStatus.AVAILABLE,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const createReservation = (
  startDate: Date,
  endDate: Date
): Reservation => ({
  id: 'reservation-1',
  clientId: 'client-1',
  propertyId: 'property-1',
  date: startDate,
  endDate,
  time: '12:00',
  numberOfGuests: 2,
  status: ReservationStatus.CONFIRMED,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('calendar utilities', () => {
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);
  baseDate.setDate(baseDate.getDate() + 1); // ensure future start date

  const reservationStart = new Date(baseDate.getTime() + 2 * DAY_MS);
  const reservationEnd = new Date(baseDate.getTime() + 4 * DAY_MS);

  const property = createProperty();
  const reservation = createReservation(reservationStart, reservationEnd);

  describe('generateCalendar', () => {
    it('should mark reserved and available days correctly', () => {
      const days = generateCalendar(property, [reservation], baseDate, 1);

      expect(days).toHaveLength(7);

      const reservedDays = days.filter((day) => day.isReserved);
      expect(reservedDays).toHaveLength(2);
      expect(
        reservedDays.every(
          (day) => day.reservation && day.reservation.id === reservation.id
        )
      ).toBe(true);

      const availableDays = days.filter((day) => day.isAvailable);
      expect(availableDays.length).toBeGreaterThan(0);
    });
  });

  describe('displayCalendar', () => {
    it('should print calendar output without throwing', () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {
        // no-op to suppress console output during tests
      });

      expect(() =>
        displayCalendar(property, [reservation], baseDate, 1)
      ).not.toThrow();

      expect(logSpy).toHaveBeenCalled();
      logSpy.mockRestore();
    });
  });
});

