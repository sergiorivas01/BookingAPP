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
    hasDatabaseUrl: !!process.env.DATABASE_URL,
  });

  return config;
}

/**
 * Get database URL for node-pg-migrate
 * Includes SSL parameters when needed for cloud databases
 */
export function getDatabaseUrl(): string {
  const config = getDatabaseConfig();
  
  // Check if we need SSL (non-localhost or production)
  const isLocalhost = config.host === 'localhost' || config.host === '127.0.0.1';
  const useSSL = !isLocalhost || process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production';
  
  // If DATABASE_URL is provided and already includes SSL params, use it as-is
  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    // If it already has sslmode parameter, return as-is
    if (url.includes('sslmode=')) {
      return url;
    }
    // Otherwise, add SSL parameters if needed
    if (useSSL) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}sslmode=require`;
    }
    return url;
  }

  // Build URL from config
  let url = `postgres://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
  
  // Add SSL parameter if needed
  if (useSSL) {
    url += '?sslmode=require';
  }
  
  return url;
}

