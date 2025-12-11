import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Create users table
  pgm.createTable('users', {
    id: { type: 'varchar(255)', primaryKey: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    name: { type: 'varchar(255)', notNull: true },
    picture: { type: 'text' },
    provider: { type: 'varchar(100)', notNull: true },
    provider_id: { type: 'varchar(255)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Create unique index for provider + provider_id combination
  pgm.createIndex('users', ['provider', 'provider_id'], {
    unique: true,
    name: 'idx_users_provider_provider_id',
  });

  // Create index for email
  pgm.createIndex('users', 'email', { name: 'idx_users_email' });

  // Add trigger to update updated_at
  pgm.createTrigger('users', 'update_users_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'update_updated_at_column',
    level: 'ROW',
  });

  // Create sessions table for express-session with connect-pg-simple
  pgm.createTable('session', {
    sid: { type: 'varchar', primaryKey: true },
    sess: { type: 'json', notNull: true },
    expire: { type: 'timestamp(6)', notNull: true },
  });

  // Create index on expire for session cleanup
  pgm.createIndex('session', 'expire', { name: 'idx_session_expire' });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // Drop triggers
  pgm.dropTrigger('users', 'update_users_updated_at', { ifExists: true });

  // Drop indexes
  pgm.dropIndex('session', 'idx_session_expire', { ifExists: true });
  pgm.dropIndex('users', 'idx_users_email', { ifExists: true });
  pgm.dropIndex('users', 'idx_users_provider_provider_id', { ifExists: true });

  // Drop tables
  pgm.dropTable('session', { ifExists: true, cascade: true });
  pgm.dropTable('users', { ifExists: true, cascade: true });
}

