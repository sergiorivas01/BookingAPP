import * as readline from 'readline';
import { ClientService } from '../services/ClientService';
import { ReservationService } from '../services/ReservationService';
import { Client, CreateClientDTO } from '../models/Client';
import {
  Reservation,
  CreateReservationDTO,
  ReservationStatus,
} from '../models/Reservation';

/**
 * Console interface for interacting with the application
 * This will be replaced by React UI in Phase 2
 */
export class ConsoleInterface {
  private rl: readline.Interface;

  constructor(
    private clientService: ClientService,
    private reservationService: ReservationService
  ) {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Start the console interface
   */
  async start(): Promise<void> {
    console.log('=== BookingAPP - Reservation and Client Manager ===\n');
    await this.showMainMenu();
  }

  /**
   * Display main menu and handle user input
   */
  private async showMainMenu(): Promise<void> {
    console.log('\nMain Menu:');
    console.log('1. Client Management');
    console.log('2. Reservation Management');
    console.log('3. Exit');
    console.log('');

    const choice = await this.question('Select an option: ');

    switch (choice.trim()) {
      case '1':
        await this.showClientMenu();
        break;
      case '2':
        await this.showReservationMenu();
        break;
      case '3':
        console.log('Goodbye!');
        this.rl.close();
        process.exit(0);
        break;
      default:
        console.log('Invalid option. Please try again.');
        await this.showMainMenu();
    }
  }

  /**
   * Display client management menu
   */
  private async showClientMenu(): Promise<void> {
    console.log('\nClient Management:');
    console.log('1. Create Client');
    console.log('2. Get Client by ID');
    console.log('3. Update Client');
    console.log('4. Back to Main Menu');
    console.log('');

    const choice = await this.question('Select an option: ');

    switch (choice.trim()) {
      case '1':
        await this.createClient();
        break;

      case '2':
        await this.getClientById();
        break;

      case '3':
        await this.updateClient();
        break;

      case '4':
        await this.showMainMenu();
        break;
      default:
        console.log('Invalid option. Please try again.');
        await this.showClientMenu();
    }
  }

  /**
   * Display reservation management menu
   */
  private async showReservationMenu(): Promise<void> {
    console.log('\nReservation Management:');
    console.log('1. Create Reservation');
    console.log('2. Get Reservation by ID (with client info)');
    console.log('3. Get Reservations by Client');
    console.log('4. Get Reservations by Property');
    console.log('5. Get Property Reservations with Clients');
    console.log('6. Update Reservation');
    console.log('7. Confirm Reservation');
    console.log('8. Cancel Reservation');
    console.log('9. Delete Reservation');
    console.log('10. Back to Main Menu');
    console.log('');

    const choice = await this.question('Select an option: ');

    switch (choice.trim()) {
      case '1':
        await this.createReservation();
        break;
      case '2':
        await this.getReservationById();
        break;
      case '3':
        await this.getReservationsByClient();
        break;
      case '4':
        await this.getReservationsByProperty();
        break;
      case '5':
        await this.getPropertyReservationsWithClients();
        break;
      case '6':
        await this.updateReservation();
        break;
      case '7':
        await this.confirmReservation();
        break;
      case '8':
        await this.cancelReservation();
        break;
      case '9':
        await this.deleteReservation();
        break;
      case '10':
        await this.showMainMenu();
        break;
      default:
        console.log('Invalid option. Please try again.');
        await this.showReservationMenu();
    }
  }

  // Client operations
  private async createClient(): Promise<void> {
    try {
      const name = (await this.question('Client name: ')).trim();
      const email = (await this.question('Client email: ')).trim();
      const phone = (await this.question('Client phone: ')).trim();

      if (!name || !email || !phone) {
        console.error('Error: All fields are required');
        await this.showClientMenu();
        return;
      }

      const dto: CreateClientDTO = { name, email, phone };
      const client = await this.clientService.createClient(dto);
      console.log('\nClient created successfully:');
      this.displayClient(client);
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
    }
    await this.showClientMenu();
  }

  private async getClientById(): Promise<void> {
    try {
      const id = await this.question('Client ID: ');
      const client = await this.clientService.getClient(id);
      if (client) {
        this.displayClient(client);
      } else {
        console.log('Client not found.');
      }
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
    }
    await this.showClientMenu();
  }

  private async updateClient(): Promise<void> {
    try {
      const id = await this.question('Client ID to update: ');
      const name = await this.question('New name (press Enter to skip): ');
      const email = await this.question('New email (press Enter to skip): ');
      const phone = await this.question('New phone (press Enter to skip): ');

      const dto: any = {};
      if (name.trim()) dto.name = name.trim();
      if (email.trim()) dto.email = email.trim();
      if (phone.trim()) dto.phone = phone.trim();

      const client = await this.clientService.updateClient(id, dto);
      console.log('\nClient updated successfully:');
      this.displayClient(client);
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
    }
    await this.showClientMenu();
  }

  // Reservation operations
  private async createReservation(): Promise<void> {
    try {
      const clientId = (await this.question('Client ID: ')).trim();
      const dateStr = (await this.question('Start date (YYYY-MM-DD): ')).trim();
      const endDateStr = (await this.question('End date (YYYY-MM-DD): ')).trim();
      const time = (await this.question('Time (HH:MM): ')).trim();
      const numberOfGuests = parseInt(
        (await this.question('Number of guests: ')).trim(),
        10
      );
      const propertyId = (await this.question('Property ID (optional, press Enter to skip): ')).trim();
      const notes = (await this.question('Notes (optional, press Enter to skip): ')).trim();

      if (!clientId || !dateStr || !endDateStr || !time || isNaN(numberOfGuests)) {
        console.error('Error: Client ID, start date, end date, time, and number of guests are required');
        await this.showReservationMenu();
        return;
      }

      const date = new Date(dateStr);
      const endDate = new Date(endDateStr);
      const dto: CreateReservationDTO = {
        clientId,
        date,
        endDate,
        time,
        numberOfGuests,
        propertyId: propertyId || undefined,
        notes: notes || undefined,
      };

      const reservation = await this.reservationService.createReservation(dto);
      console.log('\nReservation created successfully:');
      this.displayReservation(reservation);
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
    }
    await this.showReservationMenu();
  }

  private async getReservationById(): Promise<void> {
    try {
      const id = (await this.question('Reservation ID: ')).trim();
      const result = await this.reservationService.getReservationWithClient(id);
      
      console.log('\n=== Reservation Details ===');
      this.displayReservation(result.reservation);
      
      if (result.client) {
        console.log('=== Client Information ===');
        console.log(`  Client ID: ${result.client.id}`);
        console.log(`  Name: ${result.client.name}`);
        console.log(`  Email: ${result.client.email}`);
        console.log(`  Phone: ${result.client.phone}`);
        console.log('');
      } else {
        console.log('Client information not found for this reservation.');
      }
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
    }
    await this.showReservationMenu();
  }

  private async getReservationsByClient(): Promise<void> {
    try {
      const clientId = (await this.question('Client ID: ')).trim();
      const reservations =
        await this.reservationService.getReservationsByClient(clientId);
      if (reservations.length === 0) {
        console.log('No reservations found for this client.');
      } else {
        console.log(`\nFound ${reservations.length} reservation(s):`);
        reservations.forEach((reservation) =>
          this.displayReservation(reservation)
        );
      }
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
    }
    await this.showReservationMenu();
  }

  private async getReservationsByProperty(): Promise<void> {
    try {
      const propertyId = (await this.question('Property ID: ')).trim();
      const reservations =
        await this.reservationService.getReservationsByProperty(propertyId);
      if (reservations.length === 0) {
        console.log('No reservations found for this property.');
      } else {
        console.log(`\nFound ${reservations.length} reservation(s) for property ${propertyId}:`);
        reservations.forEach((reservation) =>
          this.displayReservation(reservation)
        );
      }
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
    }
    await this.showReservationMenu();
  }

  private async getPropertyReservationsWithClients(): Promise<void> {
    try {
      const propertyId = (await this.question('Property ID: ')).trim();
      const reservationsWithClients =
        await this.reservationService.getPropertyReservationsWithClients(propertyId);
      
      if (reservationsWithClients.length === 0) {
        console.log('No reservations found for this property.');
      } else {
        console.log(`\n=== Property ${propertyId} Reservations ===`);
        console.log(`Found ${reservationsWithClients.length} reservation(s):\n`);
        
        reservationsWithClients.forEach((item, index) => {
          console.log(`--- Reservation ${index + 1} ---`);
          this.displayReservation(item.reservation);
          
          if (item.client) {
            console.log('  Client Details:');
            console.log(`    Name: ${item.client.name}`);
            console.log(`    Email: ${item.client.email}`);
            console.log(`    Phone: ${item.client.phone}`);
            console.log(`    Client ID: ${item.client.id}`);
          } else {
            console.log('  Client information not available');
          }
          console.log('');
        });
      }
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
    }
    await this.showReservationMenu();
  }

  private async updateReservation(): Promise<void> {
    try {
      const id = (await this.question('Reservation ID to update: ')).trim();
      const dateStr = (await this.question('New start date (YYYY-MM-DD, press Enter to skip): ')).trim();
      const endDateStr = (await this.question('New end date (YYYY-MM-DD, press Enter to skip): ')).trim();
      const time = (await this.question('New time (HH:MM, press Enter to skip): ')).trim();
      const numberOfGuestsStr = (await this.question(
        'New number of guests (press Enter to skip): '
      )).trim();
      const status = (await this.question(
        'New status (pending/confirmed/cancelled/completed, press Enter to skip): '
      )).trim();
      const notes = (await this.question('New notes (press Enter to skip): ')).trim();

      const dto: any = {};
      if (dateStr) dto.date = new Date(dateStr);
      if (endDateStr) dto.endDate = new Date(endDateStr);
      if (time) dto.time = time;
      if (numberOfGuestsStr)
        dto.numberOfGuests = parseInt(numberOfGuestsStr, 10);
      if (status) dto.status = status as ReservationStatus;
      if (notes) dto.notes = notes;

      const reservation = await this.reservationService.updateReservation(id, dto);
      console.log('\nReservation updated successfully:');
      this.displayReservation(reservation);
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
    }
    await this.showReservationMenu();
  }

  private async confirmReservation(): Promise<void> {
    try {
      const id = await this.question('Reservation ID to confirm: ');
      const reservation = await this.reservationService.confirmReservation(id);
      console.log('\nReservation confirmed successfully:');
      this.displayReservation(reservation);
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
    }
    await this.showReservationMenu();
  }

  private async cancelReservation(): Promise<void> {
    try {
      const id = await this.question('Reservation ID to cancel: ');
      const reservation = await this.reservationService.cancelReservation(id);
      console.log('\nReservation cancelled successfully:');
      this.displayReservation(reservation);
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
    }
    await this.showReservationMenu();
  }

  private async deleteReservation(): Promise<void> {
    try {
      const id = await this.question('Reservation ID to delete: ');
      await this.reservationService.deleteReservation(id);
      console.log('Reservation deleted successfully.');
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
    }
    await this.showReservationMenu();
  }

  // Display helpers
  private displayClient(client: Client): void {
    console.log(`  ID: ${client.id}`);
    console.log(`  Name: ${client.name}`);
    console.log(`  Email: ${client.email}`);
    console.log(`  Phone: ${client.phone}`);
    console.log(`  Created: ${client.createdAt.toISOString().split('T')[0]}`);
    console.log(`  Updated: ${client.updatedAt.toISOString().split('T')[0]}`);
    console.log('');
  }

  private displayReservation(reservation: Reservation): void {
    console.log(`  ID: ${reservation.id}`);
    console.log(`  Client ID: ${reservation.clientId}`);
    if (reservation.propertyId) {
      console.log(`  Property ID: ${reservation.propertyId}`);
    }
    console.log(`  Start Date: ${reservation.date.toISOString().split('T')[0]}`);
    console.log(`  End Date: ${reservation.endDate.toISOString().split('T')[0]}`);
    console.log(`  Time: ${reservation.time}`);
    console.log(`  Guests: ${reservation.numberOfGuests}`);
    console.log(`  Status: ${reservation.status}`);
    if (reservation.notes) {
      console.log(`  Notes: ${reservation.notes}`);
    }
    console.log(`  Created: ${reservation.createdAt.toISOString()}`);
    console.log(`  Updated: ${reservation.updatedAt.toISOString()}`);
    console.log('');
  }

  private question(query: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(query, resolve);
    });
  }
}

