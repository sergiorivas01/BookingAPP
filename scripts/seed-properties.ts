/**
 * Script to seed example properties into the database
 * Run with: npm run db:seed:properties
 */
import { PostgreSQLStorage } from '../backend/database/PostgreSQLStorage';
import { initializePool, closePool } from '../backend/database/connection';
import { Property, PropertyType, AvailabilityStatus } from '../src/Properties/Property';
import { generateId } from '../src/utils/idGenerator';

const exampleProperties: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Cozy Downtown Apartment',
    description: 'Beautiful 2-bedroom apartment in the heart of the city with modern amenities.',
    specifications: {
      type: PropertyType.APARTMENT,
      area: 85,
      capacity: 4,
      bedrooms: 2,
      bathrooms: 1,
      amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Parking'],
      location: 'Downtown',
    },
    price: 120.00,
    availability: AvailabilityStatus.AVAILABLE,
  },
  {
    name: 'Luxury Beach Villa',
    description: 'Stunning 4-bedroom villa with ocean view, private pool, and direct beach access.',
    specifications: {
      type: PropertyType.HOUSE,
      area: 250,
      capacity: 8,
      bedrooms: 4,
      bathrooms: 3,
      amenities: ['WiFi', 'Pool', 'Beach Access', 'Full Kitchen', 'BBQ', 'Parking', 'AC'],
      location: 'Beachfront',
    },
    price: 450.00,
    availability: AvailabilityStatus.AVAILABLE,
  },
  {
    name: 'Modern Office Space',
    description: 'Professional office space perfect for meetings and workshops. Fully equipped with presentation equipment.',
    specifications: {
      type: PropertyType.OFFICE,
      area: 120,
      capacity: 20,
      amenities: ['WiFi', 'Projector', 'Whiteboard', 'Coffee Machine', 'Parking'],
      location: 'Business District',
    },
    price: 200.00,
    availability: AvailabilityStatus.AVAILABLE,
  },
  {
    name: 'Elegant Wedding Venue',
    description: 'Beautiful venue for weddings and special events. Includes garden area and reception hall.',
    specifications: {
      type: PropertyType.VENUE,
      area: 500,
      capacity: 150,
      amenities: ['WiFi', 'Sound System', 'Catering Kitchen', 'Garden', 'Parking', 'Bridal Suite'],
      location: 'Historic District',
    },
    price: 2500.00,
    availability: AvailabilityStatus.AVAILABLE,
  },
  {
    name: 'Comfortable Studio Room',
    description: 'Compact and comfortable studio room perfect for solo travelers or couples.',
    specifications: {
      type: PropertyType.ROOM,
      area: 30,
      capacity: 2,
      bedrooms: 0,
      bathrooms: 1,
      amenities: ['WiFi', 'TV', 'Mini Kitchen', 'AC'],
      location: 'City Center',
    },
    price: 65.00,
    availability: AvailabilityStatus.AVAILABLE,
  },
];

async function seedProperties(): Promise<void> {
  try {
    console.log('🌱 Seeding example properties...\n');
    
    // Initialize database connection
    initializePool();
    const storage = new PostgreSQLStorage();
    
    const now = new Date();
    let created = 0;
    let skipped = 0;
    
    for (const propData of exampleProperties) {
      // Check if property with same name already exists
      const existing = await storage.getAllProperties();
      if (existing.some(p => p.name === propData.name)) {
        console.log(`⏭️  Skipping "${propData.name}" (already exists)`);
        skipped++;
        continue;
      }
      
      const property: Property = {
        ...propData,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      
      await storage.saveProperty(property);
      console.log(`✅ Created: ${property.name} (${property.specifications.type}) - $${property.price}/night`);
      created++;
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Created: ${created} properties`);
    console.log(`   Skipped: ${skipped} properties (already exist)`);
    console.log(`   Total in database: ${(await storage.getAllProperties()).length} properties`);
    
  } catch (error) {
    console.error('❌ Error seeding properties:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    process.exit(1);
  } finally {
    await closePool();
    console.log('\n🔌 Database connection closed.');
  }
}

seedProperties();

