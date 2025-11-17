/**
 * Script to check current data in database
 * Run with: npm run db:check
 */
import { query, initializePool, closePool } from '../backend/database/connection';

async function checkData(): Promise<void> {
  try {
    initializePool();
    console.log('📊 Current data in database:\n');
    
    const clients = await query('SELECT id, name, email, phone, created_at FROM clients ORDER BY created_at DESC');
    console.log('👥 Clients:');
    if (clients.length === 0) {
      console.log('   (No clients found)\n');
    } else {
      clients.forEach((c: any) => {
        console.log(`  - ID: ${c.id}`);
        console.log(`    Name: ${c.name}`);
        console.log(`    Email: ${c.email}`);
        console.log(`    Phone: ${c.phone}`);
        console.log(`    Created: ${c.created_at}`);
        console.log('');
      });
    }
    
    const reservations = await query('SELECT id, client_id, date, end_date, number_of_guests, status, created_at FROM reservations ORDER BY created_at DESC');
    console.log('📅 Reservations:');
    if (reservations.length === 0) {
      console.log('   (No reservations found)\n');
    } else {
      reservations.forEach((r: any) => {
        console.log(`  - ID: ${r.id}`);
        console.log(`    Client ID: ${r.client_id}`);
        console.log(`    Start: ${r.date.toISOString().split('T')[0]}`);
        console.log(`    End: ${r.end_date.toISOString().split('T')[0]}`);
        console.log(`    Guests: ${r.number_of_guests}`);
        console.log(`    Status: ${r.status}`);
        console.log(`    Created: ${r.created_at}`);
        console.log('');
      });
    }
    
    // Summary
    const clientCount = await query('SELECT COUNT(*) as count FROM clients');
    const reservationCount = await query('SELECT COUNT(*) as count FROM reservations');
    console.log('📈 Summary:');
    console.log(`   Total Clients: ${clientCount[0].count}`);
    console.log(`   Total Reservations: ${reservationCount[0].count}`);
    
    await closePool();
  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    process.exit(1);
  }
}

checkData();

