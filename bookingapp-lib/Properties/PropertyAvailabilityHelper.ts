import { Property, PropertyAvailabilityInfo, PropertyAvailabilityDisplay, CurrentBookingInfo } from './Property';
import { Reservation, ReservationStatus } from '../models/Reservation';

/**
 * Helper functions for calculating and displaying property availability
 */
export class PropertyAvailabilityHelper {
  /**
   * Calculate availability information for a property based on its reservations
   * @param property The property to calculate availability for
   * @param reservations Array of reservations for this property
   * @returns PropertyAvailabilityInfo with calculated availability details
   */
  static calculateAvailabilityInfo(
    property: Property,
    reservations: Reservation[]
  ): PropertyAvailabilityInfo {
    const now = new Date();
    
    // Filter active reservations (confirmed or pending, not cancelled or completed)
    const activeReservations = reservations.filter(
      (res) =>
        res.propertyId === property.id &&
        (res.status === ReservationStatus.CONFIRMED ||
          res.status === ReservationStatus.PENDING) &&
        new Date(res.endDate) >= now
    );

    // Sort by check-in date to find current and next bookings
    activeReservations.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Find current booking (if any)
    const currentBooking = activeReservations.find(
      (res) =>
        new Date(res.date) <= now &&
        new Date(res.endDate) >= now
    );

    // Find next booking after current one
    const nextBooking = activeReservations.find(
      (res) =>
        new Date(res.date) > now ||
        (new Date(res.endDate) > now && !currentBooking)
    );

    let availabilityInfo: PropertyAvailabilityInfo = {
      isAvailable: !currentBooking && property.availability !== 'maintenance',
    };

    if (currentBooking) {
      const checkInDate = new Date(currentBooking.date);
      const checkOutDate = new Date(currentBooking.endDate);
      const durationDays = this.calculateDaysBetween(checkInDate, checkOutDate);

      const bookingInfo: CurrentBookingInfo = {
        reservationId: currentBooking.id,
        clientId: currentBooking.clientId,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        durationDays: durationDays,
        status: currentBooking.status,
      };

      availabilityInfo.currentBooking = bookingInfo;
      availabilityInfo.bookedUntil = checkOutDate;
      availabilityInfo.isAvailable = false;

      // If there's a next booking, set next available date
      if (nextBooking && nextBooking !== currentBooking) {
        const nextCheckOut = new Date(nextBooking.endDate);
        if (nextCheckOut > checkOutDate) {
          // There's a gap between bookings
          availabilityInfo.nextAvailableDate = new Date(
            checkOutDate.getTime() + 24 * 60 * 60 * 1000
          );
        }
      } else {
        // No next booking, available after current checkout
        availabilityInfo.nextAvailableDate = new Date(
          checkOutDate.getTime() + 24 * 60 * 60 * 1000
        );
      }
    } else if (nextBooking) {
      // No current booking, but there's a future booking
      const nextCheckIn = new Date(nextBooking.date);
      if (nextCheckIn > now) {
        availabilityInfo.nextAvailableDate = nextCheckIn;
        availabilityInfo.isAvailable = true;
      }
    } else {
      // No bookings at all
      availabilityInfo.isAvailable = property.availability !== 'maintenance';
      availabilityInfo.nextAvailableDate = now;
    }

    return availabilityInfo;
  }

  /**
   * Create a display-friendly availability object for clients
   * @param property The property
   * @param availabilityInfo Calculated availability information
   * @returns PropertyAvailabilityDisplay with human-readable information
   */
  static createAvailabilityDisplay(
    property: Property,
    availabilityInfo: PropertyAvailabilityInfo
  ): PropertyAvailabilityDisplay {
    let message: string;

    if (property.availability === 'maintenance') {
      message = 'Property is currently under maintenance';
    } else if (availabilityInfo.isAvailable) {
      message = 'Property is available now';
    } else if (availabilityInfo.currentBooking) {
      const booking = availabilityInfo.currentBooking;
      const bookedUntil = availabilityInfo.bookedUntil
        ? availabilityInfo.bookedUntil.toISOString().split('T')[0]
        : 'N/A';
      
      message = `Property is booked for ${booking.durationDays} day(s). Available from ${bookedUntil}`;
    } else if (availabilityInfo.nextAvailableDate) {
      const nextDate = availabilityInfo.nextAvailableDate
        .toISOString()
        .split('T')[0];
      message = `Property will be available on ${nextDate}`;
    } else {
      message = 'Availability information not available';
    }

    const display: PropertyAvailabilityDisplay = {
      propertyId: property.id,
      propertyName: property.name,
      isAvailable: availabilityInfo.isAvailable,
      nextAvailableDate: availabilityInfo.nextAvailableDate,
      message: message,
    };

    if (availabilityInfo.currentBooking) {
      display.currentBooking = {
        durationDays: availabilityInfo.currentBooking.durationDays,
        bookedUntil: availabilityInfo.currentBooking.checkOutDate,
        checkInDate: availabilityInfo.currentBooking.checkInDate,
        checkOutDate: availabilityInfo.currentBooking.checkOutDate,
      };
    }

    return display;
  }

  /**
   * Calculate number of days between two dates
   * @param startDate Start date
   * @param endDate End date
   * @returns Number of days
   */
  private static calculateDaysBetween(startDate: Date, endDate: Date): number {
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  }

  /**
   * Get all properties with their availability information
   * @param properties Array of properties
   * @param reservations Array of all reservations
   * @returns Array of PropertyAvailabilityDisplay for each property
   */
  static getPropertiesAvailability(
    properties: Property[],
    reservations: Reservation[]
  ): PropertyAvailabilityDisplay[] {
    return properties.map((property) => {
      const propertyReservations = reservations.filter(
        (res) => res.propertyId === property.id
      );
      const availabilityInfo = this.calculateAvailabilityInfo(
        property,
        propertyReservations
      );
      return this.createAvailabilityDisplay(property, availabilityInfo);
    });
  }
}

