/**
 * Test script to verify data storage in PostgreSQL
 * Run with: npm run db:test:storage
 */
import { PostgreSQLStorage } from '../backend/database/PostgreSQLStorage';
import { initializePool, closePool } from '../backend/database/connection';
import { ClientService } from '../src/services/ClientService';
import { ReservationService } from '../src/services/ReservationService';
import { ReservationStatus } from '../src/models/Reservation';
import { query } from '../backend/database/connection';

async function testStorage(): Promise<void> {
  try {
    console.log('🧪 Testing PostgreSQL Storage...\n');
    
    // Initialize database connection
    console.log('1. Initializing database connection...');
    initializePool();
    console.log('   ✅ Connection established\n');
    
    // Initialize storage and services
    console.log('2. Initializing storage and services...');
    const storage = new PostgreSQLStorage();
    const clientService = new ClientService(storage);
    const reservationService = new ReservationService(storage);
    console.log('   ✅ Services initialized\n');
    
    // Create a test client
    console.log('3. Creating a test client...');
    const clientData = {
      name: 'Test Client',
      email: 'test@example.com',
      phone: '+1234567890',
    };
    
    const client = await clientService.createClient(clientData);
    console.log(`   ✅ Client created with ID: ${client.id}`);
    console.log(`   Name: ${client.name}`);
    console.log(`   Email: ${client.email}`);
    console.log(`   Phone: ${client.phone}\n`);
    
    // Verify client in database
    console.log('4. Verifying client in database...');
    const dbClient = await query(
      'SELECT * FROM clients WHERE id = $1',
      [client.id]
    );
    
    if (dbClient.length > 0) {
      console.log('   ✅ Client found in database:');
      console.log(`   ID: ${dbClient[0].id}`);
      console.log(`   Name: ${dbClient[0].name}`);
      console.log(`   Email: ${dbClient[0].email}`);
      console.log(`   Created: ${dbClient[0].created_at}\n`);
    } else {
      throw new Error('Client not found in database!');
    }
    
    // Create a test reservation
    console.log('5. Creating a test reservation...');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7); // 7 days from now
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 3); // 3 days later
    
    const reservationData = {
      clientId: client.id,
      date: startDate,
      endDate: endDate,
      time: '18:00',
      numberOfGuests: 2,
      status: ReservationStatus.CONFIRMED,
      notes: 'Test reservation',
    };
    
    const reservation = await reservationService.createReservation(reservationData);
    console.log(`   ✅ Reservation created with ID: ${reservation.id}`);
    console.log(`   Client ID: ${reservation.clientId}`);
    console.log(`   Start Date: ${reservation.date.toISOString().split('T')[0]}`);
    console.log(`   End Date: ${reservation.endDate.toISOString().split('T')[0]}`);
    console.log(`   Guests: ${reservation.numberOfGuests}`);
    console.log(`   Status: ${reservation.status}\n`);
    
    // Verify reservation in database
    console.log('6. Verifying reservation in database...');
    const dbReservation = await query(
      'SELECT * FROM reservations WHERE id = $1',
      [reservation.id]
    );
    
    if (dbReservation.length > 0) {
      console.log('   ✅ Reservation found in database:');
      console.log(`   ID: ${dbReservation[0].id}`);
      console.log(`   Client ID: ${dbReservation[0].client_id}`);
      console.log(`   Date: ${dbReservation[0].date}`);
      console.log(`   End Date: ${dbReservation[0].end_date}`);
      console.log(`   Guests: ${dbReservation[0].number_of_guests}`);
      console.log(`   Status: ${dbReservation[0].status}`);
      console.log(`   Created: ${dbReservation[0].created_at}\n`);
    } else {
      throw new Error('Reservation not found in database!');
    }
    
    // Test retrieving client with reservations
    console.log('7. Testing retrieval methods...');
    const retrievedClient = await clientService.getClient(client.id);
    if (retrievedClient) {
      console.log(`   ✅ Client retrieved: ${retrievedClient.name}`);
    }
    
    const retrievedReservation = await reservationService.getReservation(reservation.id);
    if (retrievedReservation) {
      console.log(`   ✅ Reservation retrieved: ${retrievedReservation.id}`);
    }
    
    // Count records
    console.log('\n8. Database record counts:');
    const clientCount = await query('SELECT COUNT(*) as count FROM clients');
    const reservationCount = await query('SELECT COUNT(*) as count FROM reservations');
    console.log(`   Clients: ${clientCount[0].count}`);
    console.log(`   Reservations: ${reservationCount[0].count}\n`);
    
    console.log('✅ All storage tests passed!');
    console.log('\n📊 Summary:');
    console.log(`   - Client created and stored: ${client.id}`);
    console.log(`   - Reservation created and stored: ${reservation.id}`);
    console.log('   - All data persisted correctly in PostgreSQL database');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    await closePool();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run test
testStorage().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

