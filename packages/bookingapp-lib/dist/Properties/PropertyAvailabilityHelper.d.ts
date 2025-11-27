import { Property, PropertyAvailabilityInfo, PropertyAvailabilityDisplay } from './Property';
import { Reservation } from '../models/Reservation';
/**
 * Helper functions for calculating and displaying property availability
 */
export declare class PropertyAvailabilityHelper {
    /**
     * Calculate availability information for a property based on its reservations
     * @param property The property to calculate availability for
     * @param reservations Array of reservations for this property
     * @returns PropertyAvailabilityInfo with calculated availability details
     */
    static calculateAvailabilityInfo(property: Property, reservations: Reservation[]): PropertyAvailabilityInfo;
    /**
     * Create a display-friendly availability object for clients
     * @param property The property
     * @param availabilityInfo Calculated availability information
     * @returns PropertyAvailabilityDisplay with human-readable information
     */
    static createAvailabilityDisplay(property: Property, availabilityInfo: PropertyAvailabilityInfo): PropertyAvailabilityDisplay;
    /**
     * Calculate number of days between two dates
     * @param startDate Start date
     * @param endDate End date
     * @returns Number of days
     */
    private static calculateDaysBetween;
    /**
     * Get all properties with their availability information
     * @param properties Array of properties
     * @param reservations Array of all reservations
     * @returns Array of PropertyAvailabilityDisplay for each property
     */
    static getPropertiesAvailability(properties: Property[], reservations: Reservation[]): PropertyAvailabilityDisplay[];
}
//# sourceMappingURL=PropertyAvailabilityHelper.d.ts.map