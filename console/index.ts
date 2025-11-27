// Load environment variables first
import 'dotenv/config';

import { PostgreSQLStorage } from '../backend/database/PostgreSQLStorage';
import { initializePool, closePool } from '../backend/database/connection';
import { ClientService, ReservationService } from '@azucar_1/bookingapp';
import { ConsoleInterface } from './ConsoleInterface';

/**
 * Application entry point
 * Initializes services and starts the console interface
 */
async function main(): Promise<void> {
  try {
    // Verify .env is loaded
    if (process.env.DB_USER || process.env.DATABASE_URL) {
      console.log('✓ Environment variables loaded from .env file');
    }
    
    // Initialize database connection pool
    console.log('Initializing database connection...');
    initializePool();
    console.log('Database connection established.');

    // Initialize PostgreSQL storage
    const storage = new PostgreSQLStorage();

    // Initialize services
    const clientService = new ClientService(storage);
    const reservationService = new ReservationService(storage);

    // Setup graceful shutdown handlers
    const shutdown = async () => {
      console.log('\nClosing database connection...');
      await closePool();
      console.log('Database connection closed.');
      process.exit(0);
    };

    process.on('SIGINT', shutdown); // Ctrl+C
    process.on('SIGTERM', shutdown); // Termination signal

    // Initialize and start console interface
    const consoleInterface = new ConsoleInterface(clientService, reservationService, storage);
    console.log('Starting console interface...');
    await consoleInterface.start();
    console.log('Console interface ended (this should not happen until exit)');
  } catch (error) {
    console.error('Error initializing application:', error);
    await closePool();
    process.exit(1);
  }
}

// Start the application
main().catch(async (error) => {
  console.error('Fatal error:', error);
  await closePool();
  process.exit(1);
});

