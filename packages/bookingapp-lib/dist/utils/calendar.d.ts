/**
 * Calendar utility for displaying property availability
 */
import { Reservation } from '../models/Reservation';
import { Property } from '../Properties/Property';
export interface CalendarDay {
    date: Date;
    isAvailable: boolean;
    isReserved: boolean;
    reservation?: Reservation;
    isToday: boolean;
    isPast: boolean;
}
/**
 * Generate calendar view for a property showing availability
 */
export declare function generateCalendar(property: Property, reservations: Reservation[], startDate?: Date, weeks?: number): CalendarDay[];
/**
 * Display calendar in console
 */
export declare function displayCalendar(property: Property, reservations: Reservation[], startDate?: Date, weeks?: number): void;
//# sourceMappingURL=calendar.d.ts.map