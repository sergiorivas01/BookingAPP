/**
 * Property model representing a property/space in the system
 */
export interface Property {
  id: string;
  name: string;
  description?: string;
  specifications: PropertySpecifications;
  price: number;
  availability: AvailabilityStatus;
  availabilityInfo?: PropertyAvailabilityInfo; // Detailed availability information
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Detailed availability information for a property
 */
export interface PropertyAvailabilityInfo {
  isAvailable: boolean;
  currentBooking?: CurrentBookingInfo; // Information about current booking if reserved
  nextAvailableDate?: Date; // When the property will be available next
  bookedUntil?: Date; // Until when the property is booked
}

/**
 * Information about the current booking
 */
export interface CurrentBookingInfo {
  reservationId: string;
  clientId: string;
  checkInDate: Date;
  checkOutDate: Date;
  durationDays: number; // Number of days the booking lasts
  status: string; // Reservation status
}

/**
 * Property specifications containing detailed information
 */
export interface PropertySpecifications {
  area?: number; // in square meters or square feet
  capacity?: number; // maximum number of people
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[]; // e.g., ['WiFi', 'Parking', 'Pool']
  location?: string;
  type?: PropertyType;
}

/**
 * Property type enum
 */
export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  ROOM = 'room',
  VENUE = 'venue',
  OFFICE = 'office',
  OTHER = 'other'
}

/**
 * Availability status enum
 */
export enum AvailabilityStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  RESERVED = 'reserved',
  MAINTENANCE = 'maintenance'
}

/**
 * Data transfer object for creating a new property
 */
export interface CreatePropertyDTO {
  name: string;
  description?: string;
  specifications: PropertySpecifications;
  price: number;
  availability?: AvailabilityStatus;
  availabilityInfo?: PropertyAvailabilityInfo;
}

/**
 * Data transfer object for updating an existing property
 */
export interface UpdatePropertyDTO {
  name?: string;
  description?: string;
  specifications?: Partial<PropertySpecifications>;
  price?: number;
  availability?: AvailabilityStatus;
  availabilityInfo?: PropertyAvailabilityInfo;
}

/**
 * Property availability display information for clients
 * This is what clients see when checking property availability
 */
export interface PropertyAvailabilityDisplay {
  propertyId: string;
  propertyName: string;
  isAvailable: boolean;
  currentBooking?: {
    durationDays: number;
    bookedUntil: Date;
    checkInDate: Date;
    checkOutDate: Date;
  };
  nextAvailableDate?: Date;
  message: string; // Human-readable availability message
}

