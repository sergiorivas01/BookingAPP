import * as readline from 'readline';
import Table from 'cli-table3';
import chalk from 'chalk';
import { ClientService } from '../services/ClientService';
import { ReservationService } from '../services/ReservationService';
import { Client, CreateClientDTO } from '../models/Client';
import {
  Reservation,
  CreateReservationDTO,
  ReservationStatus,
} from '../models/Reservation';
import { IStorage } from '../storage/Storage';
import { displayCalendar } from '../utils/calendar';
import {
  displaySection,
  displaySuccess,
  displayError,
  displayWarning,
  displayInfo,
  displayDivider,
  displayMenu,
} from '../utils/consoleHelpers';

/**
 * Console interface for interacting with the application
 * This will be replaced by React UI in Phase 2
 */
export class ConsoleInterface {
  private rl: readline.Interface;

  constructor(
    private clientService: ClientService,
    private reservationService: ReservationService,
    private storage: IStorage
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
    displaySection(
      'BookingAPP',
      'Reservation and Client Manager'
    );
    await this.showMainMenu();
  }

  /**
   * Display main menu and handle user input
   */
  private async showMainMenu(): Promise<void> {
    displayMenu('Main Menu', [
      'Client Management',
      'Reservation Management',
      'Exit',
    ]);

    const choice = await this.question('Select an option: ');

    switch (choice.trim()) {
      case '1':
        await this.showClientMenu();
        break;
      case '2':
        await this.showReservationMenu();
        break;
      case '3':
        displaySection('Thank you for using BookingAPP!', 'Goodbye! 👋');
        this.rl.close();
        process.exit(0);
        break;
      default:
        displayError('Invalid option. Please try again.');
        await this.showMainMenu();
    }
  }

  /**
   * Display client management menu
   */
  private async showClientMenu(): Promise<void> {
    displayMenu('Client Management', [
      'Create Client',
      'Get Client by ID',
      'Update Client',
      'Back to Main Menu',
    ]);

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
        displayError('Invalid option. Please try again.');
        await this.showClientMenu();
    }
  }

  /**
   * Display reservation management menu
   */
  private async showReservationMenu(): Promise<void> {
    displayMenu('Reservation Management', [
      'Create Reservation',
      'Get Reservation by ID (with client info)',
      'Get Reservations by Client',
      'Get Reservations by Property',
      'Get Property Reservations with Clients',
      'Update Reservation',
      'Confirm Reservation',
      'Cancel Reservation',
      'Delete Reservation',
      'Back to Main Menu',
    ]);

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
      displaySuccess('Client created successfully!');
      displayDivider();
      this.displayClient(client);
    } catch (error) {
      displayError((error as Error).message);
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
      displayError((error as Error).message);
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
      displayError((error as Error).message);
    }
    await this.showClientMenu();
  }

  // Reservation operations
  private async createReservation(): Promise<void> {
    try {
      // Show available properties
      const properties = await this.storage.getAllProperties();
      if (properties.length > 0) {
        console.log('\n' + chalk.bold.cyan('📋 Available Properties:'));
        const propertiesTable = new Table({
          head: ['ID', 'Name', 'Type', 'Price/Night', 'Status'],
          style: { head: ['cyan'] },
        });
        
        properties.forEach(prop => {
          propertiesTable.push([
            prop.id.substring(0, 12) + '...',
            prop.name,
            prop.specifications.type || 'N/A',
            `$${prop.price}`,
            prop.availability,
          ]);
        });
        
        console.log(propertiesTable.toString());
        console.log('');
      }
      
      const propertyId = (await this.question('Property ID (optional, press Enter to skip): ')).trim();
      
      // If property ID is provided, show calendar
      if (propertyId) {
        const property = await this.storage.getProperty(propertyId);
        if (property) {
          const reservations = await this.reservationService.getReservationsByProperty(propertyId);
          displayCalendar(property, reservations);
        } else {
          console.log(chalk.yellow('⚠️  Property not found. Continuing without calendar...'));
        }
      }
      
      const clientId = (await this.question('Client ID: ')).trim();
      const dateStr = (await this.question('Start date (YYYY-MM-DD): ')).trim();
      const endDateStr = (await this.question('End date (YYYY-MM-DD): ')).trim();
      const time = (await this.question('Time (HH:MM): ')).trim();
      const numberOfGuests = parseInt(
        (await this.question('Number of guests: ')).trim(),
        10
      );
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
      displaySuccess('Reservation created successfully!');
      displayDivider();
      await this.displayReservation(reservation);
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
      await this.displayReservation(result.reservation);
      
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
        for (const reservation of reservations) {
          await this.displayReservation(reservation);
        }
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
        for (const reservation of reservations) {
          await this.displayReservation(reservation);
        }
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
        
        for (const [index, item] of reservationsWithClients.entries()) {
          console.log(`--- Reservation ${index + 1} ---`);
          await this.displayReservation(item.reservation);
          
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
        }
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
      displaySuccess('Reservation updated successfully!');
      displayDivider();
      await this.displayReservation(reservation);
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
    }
    await this.showReservationMenu();
  }

  private async confirmReservation(): Promise<void> {
    try {
      const id = await this.question('Reservation ID to confirm: ');
      const reservation = await this.reservationService.confirmReservation(id);
      displaySuccess('Reservation confirmed successfully!');
      displayDivider();
      await this.displayReservation(reservation);
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
    }
    await this.showReservationMenu();
  }

  private async cancelReservation(): Promise<void> {
    try {
      const id = await this.question('Reservation ID to cancel: ');
      const reservation = await this.reservationService.cancelReservation(id);
      displaySuccess('Reservation cancelled successfully!');
      displayDivider();
      await this.displayReservation(reservation);
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
    const table = new Table({
      head: [chalk.cyan('Field'), chalk.cyan('Value')],
      style: { head: ['cyan'] },
    });
    
    table.push(
      ['ID', client.id],
      ['Name', client.name],
      ['Email', client.email],
      ['Phone', client.phone],
      ['Created', client.createdAt.toISOString().split('T')[0]],
      ['Updated', client.updatedAt.toISOString().split('T')[0]]
    );
    
    console.log(table.toString());
    console.log('');
  }

  private async displayReservation(reservation: Reservation): Promise<void> {
    const table = new Table({
      head: [chalk.cyan('Field'), chalk.cyan('Value')],
      style: { head: ['cyan'] },
    });
    
    // Calculate days between start and end date
    const startDate = new Date(reservation.date);
    const endDate = new Date(reservation.endDate);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    // Calculate total cost if property exists
    let totalCost: string = chalk.gray('N/A');
    if (reservation.propertyId) {
      try {
        const property = await this.storage.getProperty(reservation.propertyId);
        if (property) {
          const cost = property.price * days;
          totalCost = chalk.green(`$${cost.toFixed(2)}`);
        }
      } catch (error) {
        // Property not found or error, keep as N/A
      }
    }
    
    table.push(
      ['ID', reservation.id],
      ['Client ID', reservation.clientId],
      ['Property ID', reservation.propertyId || chalk.gray('N/A')],
      ['Start Date', reservation.date.toISOString().split('T')[0]],
      ['End Date', reservation.endDate.toISOString().split('T')[0]],
      ['Duration', `${days} day(s)`],
      ['Time', reservation.time],
      ['Guests', reservation.numberOfGuests.toString()],
      ['Status', reservation.status],
      ['Total Cost', totalCost],
      ['Notes', reservation.notes || chalk.gray('N/A')],
      ['Created', reservation.createdAt.toISOString()],
      ['Updated', reservation.updatedAt.toISOString()]
    );
    
    console.log(table.toString());
    console.log('');
  }

  private question(query: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(query, resolve);
    });
  }
}

