import { Pool, PoolClient } from 'pg';
import { getDatabaseConfig } from './config';

/**
 * PostgreSQL connection pool
 */
let pool: Pool | null = null;

/**
 * Initialize database connection pool
 */
export function initializePool(): Pool {
  if (!pool) {
    const config = getDatabaseConfig();
    
    // SSL configuration: Use SSL for all non-localhost connections
    // Azure PostgreSQL and most cloud providers require SSL
    const isLocalhost = config.host === 'localhost' || config.host === '127.0.0.1';
    const useSSL = !isLocalhost || process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production';
    
    const sslConfig = useSSL
      ? {
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false', // Default: true (verify certificate)
        }
      : false;
    
    console.log('Database connection config:', {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      ssl: sslConfig,
      isLocalhost,
      nodeEnv: process.env.NODE_ENV,
    });
    
    // Create the pool first
    pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: sslConfig,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
    
    // Verify connection and list available tables (after pool is created)
    pool.connect()
      .then(async (client: PoolClient) => {
        try {
          // Get database and user info separately
          const dbInfo = await client.query('SELECT current_database() as db, current_user as user');
          const dbName = dbInfo.rows[0]?.db;
          const dbUser = dbInfo.rows[0]?.user;
          
          console.log('Connected to database:', dbName);
          console.log('Connected as user:', dbUser);
          
          // Get all tables in public schema
          const tablesResult = await client.query<{ table_name: string }>(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
          `);
          console.log('Available tables in public schema:', tablesResult.rows.map(r => r.table_name));
          
          // Also check all schemas
          const allSchemas = await client.query<{ schema_name: string }>(`
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
            ORDER BY schema_name
          `);
          console.log('Available schemas:', allSchemas.rows.map(r => r.schema_name));
          
          // Check if tables exist in any schema
          const allTables = await client.query<{ table_schema: string; table_name: string }>(`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_type = 'BASE TABLE'
            AND table_schema NOT IN ('information_schema', 'pg_catalog')
            ORDER BY table_schema, table_name
          `);
          if (allTables.rows.length > 0) {
            console.log('All tables in database:');
            allTables.rows.forEach(t => {
              console.log(`  ${t.table_schema}.${t.table_name}`);
            });
          } else {
            console.log('⚠️  No tables found in any schema!');
          }
        } catch (err) {
          console.error('Error checking database info:', err);
        } finally {
          client.release();
        }
      })
      .catch((err: Error) => {
        console.error('Error connecting to database:', err);
      });
  }
  return pool;
}

/**
 * Get database connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    return initializePool();
  }
  return pool;
}

/**
 * Close database connection pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Execute a query with automatic connection management
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializePool() first.');
  }
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Execute a transaction
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

