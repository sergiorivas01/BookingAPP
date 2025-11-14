import { InMemoryStorage } from './storage/InMemoryStorage';
import { ClientService } from './services/ClientService';
import { ReservationService } from './services/ReservationService';
import { ConsoleInterface } from './console/ConsoleInterface';

/**
 * Application entry point
 * Initializes services and starts the console interface
 */
async function main(): Promise<void> {
  // Initialize storage (in-memory for now)
  const storage = new InMemoryStorage();

  // Initialize services
  const clientService = new ClientService(storage);
  const reservationService = new ReservationService(storage);

  // Initialize and start console interface
  const consoleInterface = new ConsoleInterface(clientService, reservationService);
  await consoleInterface.start();
}

// Start the application
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

