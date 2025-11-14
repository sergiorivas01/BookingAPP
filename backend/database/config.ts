/**
 * Database configuration for PostgreSQL connection
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

/**
 * Get database configuration from environment variables or use defaults
 */
export function getDatabaseConfig(): DatabaseConfig {
  // Support DATABASE_URL format: postgres://user:password@host:port/database
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      return {
        host: url.hostname,
        port: parseInt(url.port || '5432', 10),
        database: url.pathname.slice(1), // Remove leading '/'
        user: url.username,
        password: url.password,
      };
    } catch (error) {
      console.error('Error parsing DATABASE_URL:', error);
    }
  }

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'bookingapp',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  };

  // Log configuration (without password) for debugging
  console.log('Database config:', {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password ? '***' : 'not set',
  });

  return config;
}

/**
 * Get database URL for node-pg-migrate
 */
export function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const config = getDatabaseConfig();
  return `postgres://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
}

