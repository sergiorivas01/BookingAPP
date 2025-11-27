/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  const now = new Date().toISOString();
  const baseTimestamp = Date.now();
  
  // Generate unique IDs using timestamp format with increment
  const generateId = (index: number) => `${baseTimestamp + index}-prop-${index}`;

  const properties = [
    {
      id: generateId(1),
      name: 'Cozy Downtown Apartment',
      description: 'Beautiful 2-bedroom apartment in the heart of the city with modern amenities.',
      specifications: {
        type: 'apartment',
        area: 85,
        capacity: 4,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Parking'],
        location: 'Downtown',
      },
      price: 120.00,
      availability: 'available',
      availability_info: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateId(2),
      name: 'Luxury Beach Villa',
      description: 'Stunning 4-bedroom villa with ocean view, private pool, and direct beach access.',
      specifications: {
        type: 'house',
        area: 250,
        capacity: 8,
        bedrooms: 4,
        bathrooms: 3,
        amenities: ['WiFi', 'Pool', 'Beach Access', 'Full Kitchen', 'BBQ', 'Parking', 'AC'],
        location: 'Beachfront',
      },
      price: 450.00,
      availability: 'available',
      availability_info: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateId(3),
      name: 'Modern Office Space',
      description: 'Professional office space perfect for meetings and workshops. Fully equipped with presentation equipment.',
      specifications: {
        type: 'office',
        area: 120,
        capacity: 20,
        amenities: ['WiFi', 'Projector', 'Whiteboard', 'Coffee Machine', 'Parking'],
        location: 'Business District',
      },
      price: 200.00,
      availability: 'available',
      availability_info: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateId(4),
      name: 'Elegant Wedding Venue',
      description: 'Beautiful venue for weddings and special events. Includes garden area and reception hall.',
      specifications: {
        type: 'venue',
        area: 500,
        capacity: 150,
        amenities: ['WiFi', 'Sound System', 'Catering Kitchen', 'Garden', 'Parking', 'Bridal Suite'],
        location: 'Historic District',
      },
      price: 2500.00,
      availability: 'available',
      availability_info: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateId(5),
      name: 'Comfortable Studio Room',
      description: 'Compact and comfortable studio room perfect for solo travelers or couples.',
      specifications: {
        type: 'room',
        area: 30,
        capacity: 2,
        bedrooms: 0,
        bathrooms: 1,
        amenities: ['WiFi', 'TV', 'Mini Kitchen', 'AC'],
        location: 'City Center',
      },
      price: 65.00,
      availability: 'available',
      availability_info: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateId(6),
      name: 'Spacious Family House',
      description: 'Large 5-bedroom house with garden, perfect for family gatherings and extended stays.',
      specifications: {
        type: 'house',
        area: 300,
        capacity: 10,
        bedrooms: 5,
        bathrooms: 4,
        amenities: ['WiFi', 'Garden', 'Garage', 'Fireplace', 'Full Kitchen', 'Dishwasher', 'Washing Machine'],
        location: 'Residential Area',
      },
      price: 350.00,
      availability: 'available',
      availability_info: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateId(7),
      name: 'Luxury Penthouse Suite',
      description: 'Exclusive penthouse with panoramic city views, rooftop terrace, and premium finishes.',
      specifications: {
        type: 'apartment',
        area: 180,
        capacity: 6,
        bedrooms: 3,
        bathrooms: 2,
        amenities: ['WiFi', 'Rooftop Terrace', 'City View', 'Premium Kitchen', 'Smart Home', 'Concierge', 'Parking'],
        location: 'Uptown',
      },
      price: 600.00,
      availability: 'available',
      availability_info: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateId(8),
      name: 'Conference Center',
      description: 'Large conference facility with multiple meeting rooms, catering services, and modern AV equipment.',
      specifications: {
        type: 'office',
        area: 800,
        capacity: 200,
        amenities: ['WiFi', 'Multiple Meeting Rooms', 'Catering', 'AV Equipment', 'Parking', 'Reception Area'],
        location: 'Business Park',
      },
      price: 1500.00,
      availability: 'available',
      availability_info: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateId(9),
      name: 'Rustic Countryside Cabin',
      description: 'Charming wooden cabin surrounded by nature, perfect for a peaceful retreat.',
      specifications: {
        type: 'house',
        area: 100,
        capacity: 4,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ['WiFi', 'Fireplace', 'Outdoor BBQ', 'Hiking Trails', 'Nature View'],
        location: 'Countryside',
      },
      price: 150.00,
      availability: 'available',
      availability_info: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: generateId(10),
      name: 'Boutique Event Space',
      description: 'Intimate event space ideal for small celebrations, corporate events, and private parties.',
      specifications: {
        type: 'venue',
        area: 200,
        capacity: 80,
        amenities: ['WiFi', 'Sound System', 'Bar Area', 'Dance Floor', 'Catering Options', 'Parking'],
        location: 'Arts District',
      },
      price: 800.00,
      availability: 'available',
      availability_info: null,
      created_at: now,
      updated_at: now,
    },
  ];

  // Insert all properties using parameterized queries for safety
  for (const property of properties) {
    pgm.db.query(
      `INSERT INTO properties (
        id, name, description, specifications, price, availability, 
        availability_info, created_at, updated_at
      ) VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO NOTHING`,
      [
        property.id,
        property.name,
        property.description,
        JSON.stringify(property.specifications),
        property.price,
        property.availability,
        property.availability_info,
        property.created_at,
        property.updated_at,
      ]
    );
  }
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // Remove the inserted properties by name pattern
  pgm.sql(`
    DELETE FROM properties 
    WHERE name IN (
      'Cozy Downtown Apartment',
      'Luxury Beach Villa',
      'Modern Office Space',
      'Elegant Wedding Venue',
      'Comfortable Studio Room',
      'Spacious Family House',
      'Luxury Penthouse Suite',
      'Conference Center',
      'Rustic Countryside Cabin',
      'Boutique Event Space'
    );
  `);
}
