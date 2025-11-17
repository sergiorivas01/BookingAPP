/**
 * Test script to simulate console flow and verify database operations
 */
import { PostgreSQLStorage } from '../backend/database/PostgreSQLStorage';
import { initializePool, closePool } from '../backend/database/connection';
import { ClientService } from '../src/services/ClientService';
import { ReservationService } from '../src/services/ReservationService';

async function testConsoleFlow(): Promise<void> {
  try {
    console.log('🧪 Testing Console Flow...\n');
    
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
    
    // Simulate creating a client (like the console would do)
    console.log('3. Simulating client creation (like console interface)...');
    const clientData = {
      name: 'Console Test Client',
      email: 'console-test@example.com',
      phone: '+9876543210',
    };
    
    console.log('   Creating client with data:', clientData);
    const client = await clientService.createClient(clientData);
    console.log(`   ✅ Client created: ${client.id}\n`);
    
    // Wait a bit to ensure async operations complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify client in database
    console.log('4. Verifying client in database...');
    const dbClient = await storage.getClient(client.id);
    
    if (dbClient) {
      console.log('   ✅ Client found in database:');
      console.log(`   ID: ${dbClient.id}`);
      console.log(`   Name: ${dbClient.name}`);
      console.log(`   Email: ${dbClient.email}\n`);
    } else {
      console.error('   ❌ Client NOT found in database!');
      throw new Error('Client was not saved to database');
    }
    
    // Check all clients
    console.log('5. Checking all clients in database...');
    const allClients = await storage.getAllClients();
    console.log(`   Total clients: ${allClients.length}`);
    allClients.forEach(c => {
      console.log(`   - ${c.id}: ${c.name} (${c.email})`);
    });
    console.log('');
    
    console.log('✅ All tests passed!');
    
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

testConsoleFlow();

