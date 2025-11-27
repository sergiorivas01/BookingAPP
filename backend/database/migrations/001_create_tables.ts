import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Create clients table
  pgm.createTable('clients', {
    id: { type: 'varchar(255)', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    phone: { type: 'varchar(50)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Create properties table
  pgm.createTable('properties', {
    id: { type: 'varchar(255)', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    specifications: { type: 'jsonb' },
    price: { type: 'decimal(10, 2)', notNull: true },
    availability: { type: 'varchar(50)', notNull: true, default: 'available' },
    availability_info: { type: 'jsonb' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Create reservations table
  pgm.createTable('reservations', {
    id: { type: 'varchar(255)', primaryKey: true },
    client_id: { type: 'varchar(255)', notNull: true, references: 'clients(id)', onDelete: 'CASCADE' },
    property_id: { type: 'varchar(255)', references: 'properties(id)', onDelete: 'SET NULL' },
    date: { type: 'timestamp', notNull: true },
    end_date: { type: 'timestamp', notNull: true },
    time: { type: 'varchar(10)', notNull: true },
    number_of_guests: { type: 'integer', notNull: true },
    status: { type: 'varchar(50)', notNull: true, default: 'pending' },
    notes: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Create indexes for better query performance
  pgm.createIndex('reservations', 'client_id', { name: 'idx_reservations_client_id' });
  pgm.createIndex('reservations', 'property_id', { name: 'idx_reservations_property_id' });
  pgm.createIndex('reservations', 'date', { name: 'idx_reservations_date' });
  pgm.createIndex('reservations', 'end_date', { name: 'idx_reservations_end_date' });
  pgm.createIndex('clients', 'email', { name: 'idx_clients_email' });

  // Create function to update updated_at timestamp
  pgm.createFunction(
    'update_updated_at_column',
    [],
    {
      returns: 'trigger',
      language: 'plpgsql',
      replace: true,
    },
    `
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    `
  );

  // Create triggers to automatically update updated_at
  pgm.createTrigger('clients', 'update_clients_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'update_updated_at_column',
    level: 'ROW',
  });

  pgm.createTrigger('properties', 'update_properties_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'update_updated_at_column',
    level: 'ROW',
  });

  pgm.createTrigger('reservations', 'update_reservations_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'update_updated_at_column',
    level: 'ROW',
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // Drop triggers
  pgm.dropTrigger('reservations', 'update_reservations_updated_at', { ifExists: true });
  pgm.dropTrigger('properties', 'update_properties_updated_at', { ifExists: true });
  pgm.dropTrigger('clients', 'update_clients_updated_at', { ifExists: true });

  // Drop function
  pgm.dropFunction('update_updated_at_column', [], { ifExists: true });

  // Drop tables (order matters due to foreign keys)
  pgm.dropTable('reservations', { ifExists: true, cascade: true });
  pgm.dropTable('properties', { ifExists: true, cascade: true });
  pgm.dropTable('clients', { ifExists: true, cascade: true });
}

