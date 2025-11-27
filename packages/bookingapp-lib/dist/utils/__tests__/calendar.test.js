"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('chalk', () => {
    const withBold = () => {
        const fn = (str) => str;
        fn.bold = (str) => str;
        return fn;
    };
    return {
        bold: {
            cyan: (str) => str,
            white: (str) => str,
            yellow: (str) => str,
        },
        gray: (str) => str,
        green: withBold(),
        red: withBold(),
    };
});
const calendar_1 = require("../calendar");
const Property_1 = require("../../Properties/Property");
const Reservation_1 = require("../../models/Reservation");
const DAY_MS = 24 * 60 * 60 * 1000;
const createProperty = () => ({
    id: 'property-1',
    name: 'Test Property',
    specifications: {
        type: Property_1.PropertyType.APARTMENT,
        location: 'Test City',
    },
    price: 150,
    availability: Property_1.AvailabilityStatus.AVAILABLE,
    createdAt: new Date(),
    updatedAt: new Date(),
});
const createReservation = (startDate, endDate) => ({
    id: 'reservation-1',
    clientId: 'client-1',
    propertyId: 'property-1',
    date: startDate,
    endDate,
    time: '12:00',
    numberOfGuests: 2,
    status: Reservation_1.ReservationStatus.CONFIRMED,
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
            const days = (0, calendar_1.generateCalendar)(property, [reservation], baseDate, 1);
            expect(days).toHaveLength(7);
            const reservedDays = days.filter((day) => day.isReserved);
            expect(reservedDays).toHaveLength(2);
            expect(reservedDays.every((day) => day.reservation && day.reservation.id === reservation.id)).toBe(true);
            const availableDays = days.filter((day) => day.isAvailable);
            expect(availableDays.length).toBeGreaterThan(0);
        });
    });
    describe('displayCalendar', () => {
        it('should print calendar output without throwing', () => {
            const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {
                // no-op to suppress console output during tests
            });
            expect(() => (0, calendar_1.displayCalendar)(property, [reservation], baseDate, 1)).not.toThrow();
            expect(logSpy).toHaveBeenCalled();
            logSpy.mockRestore();
        });
    });
});
//# sourceMappingURL=calendar.test.js.map