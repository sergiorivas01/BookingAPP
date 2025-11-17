/**
 * Test script to verify database connection
 * Run with: npx ts-node -r dotenv/config scripts/test-db-connection.ts
 */
import { initializePool, closePool, query } from '../backend/database/connection';
import { getDatabaseConfig } from '../backend/database/config';

async function testConnection(): Promise<void> {
  try {
    console.log('Testing database connection...');
    
    // Get config to display connection info (without password)
    const config = getDatabaseConfig();
    console.log(`Connecting to: ${config.user}@${config.host}:${config.port}/${config.database}`);
    
    // Initialize pool
    const pool = initializePool();
    
    // Test query
    console.log('Executing test query...');
    const result = await query('SELECT NOW() as current_time, version() as pg_version');
    
    if (result.length > 0) {
      console.log('✅ Database connection successful!');
      console.log(`Current time: ${result[0].current_time}`);
      console.log(`PostgreSQL version: ${result[0].pg_version.split(' ')[0]} ${result[0].pg_version.split(' ')[1]}`);
    }
    
    // Check if tables exist
    console.log('\nChecking tables...');
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    if (tables.length > 0) {
      console.log('✅ Tables found:');
      tables.forEach((table: { table_name: string }) => {
        console.log(`  - ${table.table_name}`);
      });
    } else {
      console.log('⚠️  No tables found. Run migrations first: npm run db:migrate:up');
    }
    
    // Check migration status
    console.log('\nChecking migration status...');
    const migrations = await query(`
      SELECT name, run_on 
      FROM pgmigrations 
      ORDER BY run_on DESC
    `).catch(() => []);
    
    if (migrations.length > 0) {
      console.log('✅ Migrations applied:');
      migrations.forEach((migration: { name: string; run_on: Date }) => {
        console.log(`  - ${migration.name} (${migration.run_on})`);
      });
    } else {
      console.log('⚠️  No migrations found. Run migrations first: npm run db:migrate:up');
    }
    
    console.log('\n✅ All database checks passed!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    process.exit(1);
  } finally {
    await closePool();
    console.log('\nConnection closed.');
  }
}

// Run test
testConnection().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

