// Load environment variables first
import 'dotenv/config';

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { initializePool, closePool } from '../../backend/database/connection';
import { PostgreSQLStorage } from '../../backend/database/PostgreSQLStorage';
import { ClientService, ReservationService } from '@azucar_1/bookingapp';
import { clientRoutes } from './routes/clients';
import { reservationRoutes } from './routes/reservations';
import { propertyRoutes } from './routes/properties';

/**
 * Express API Server
 * Provides REST API endpoints for the React frontend
 */
class ApiServer {
  private app: Express;
  private port: number;
  private clientService!: ClientService;
  private reservationService!: ReservationService;
  private storage!: PostgreSQLStorage;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '5000', 10);
    
    // Initialize database and services
    this.initializeDatabase();
    this.initializeServices();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private initializeDatabase(): void {
    console.log('Initializing database connection...');
    initializePool();
    console.log('Database connection established.');
  }

  private initializeServices(): void {
    this.storage = new PostgreSQLStorage();
    this.clientService = new ClientService(this.storage);
    this.reservationService = new ReservationService(this.storage);
  }

  private setupMiddleware(): void {
    // CORS configuration
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    console.log(`CORS configured for origin: ${frontendUrl}`);
    
    this.app.use(
      cors({
        origin: (origin, callback) => {
          // Allow requests with no origin (like mobile apps or curl requests)
          if (!origin) {
            return callback(null, true);
          }
          
          // Allow the configured frontend URL
          if (origin === frontendUrl) {
            return callback(null, true);
          }
          
          // In development, allow localhost
          if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost')) {
            return callback(null, true);
          }
          
          // Allow Azure Static Web Apps (check if origin contains azurestaticapps.net)
          if (origin.includes('azurestaticapps.net')) {
            return callback(null, true);
          }
          
          callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );

    // Parse JSON bodies
    this.app.use(express.json());

    // Request logging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', message: 'API is running' });
    });

    // Database diagnostic endpoint
    this.app.get('/health/db', async (req: Request, res: Response) => {
      try {
        const { query } = await import('../../backend/database/connection');
        const { getDatabaseConfig } = await import('../../backend/database/config');
        
        const config = getDatabaseConfig();
        
        // Get database and user info
        const dbInfo = await query<{ db: string; user: string }>(
          'SELECT current_database() as db, current_user as user'
        );
        
        // Get tables in public schema
        const publicTables = await query<{ table_name: string }>(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name
        `);
        
        // Get all schemas
        const schemas = await query<{ schema_name: string }>(`
          SELECT schema_name 
          FROM information_schema.schemata 
          WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
          ORDER BY schema_name
        `);
        
        // Get all tables in all schemas
        const allTables = await query<{ table_schema: string; table_name: string }>(`
          SELECT table_schema, table_name 
          FROM information_schema.tables 
          WHERE table_type = 'BASE TABLE'
          AND table_schema NOT IN ('information_schema', 'pg_catalog')
          ORDER BY table_schema, table_name
        `);
        
        res.json({
          config: {
            host: config.host,
            port: config.port,
            database: config.database,
            user: config.user,
          },
          connection: {
            database: dbInfo[0]?.db,
            user: dbInfo[0]?.user,
          },
          schemas: schemas.map(s => s.schema_name),
          tables: {
            public: publicTables.map(t => t.table_name),
            all: allTables.map(t => `${t.table_schema}.${t.table_name}`),
          },
        });
      } catch (error) {
        res.status(500).json({
          error: 'Database connection failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // API routes
    this.app.use('/api/clients', clientRoutes(this.clientService));
    this.app.use('/api/reservations', reservationRoutes(this.reservationService, this.clientService));
    this.app.use('/api/properties', propertyRoutes(this.storage));

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ error: 'Route not found' });
    });
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    });
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 API Server running on http://localhost:${this.port}`);
      console.log(`📡 Health check: http://localhost:${this.port}/health`);
    });
  }

  public async shutdown(): Promise<void> {
    console.log('\nShutting down server...');
    await closePool();
    console.log('Database connection closed.');
    process.exit(0);
  }
}

// Create and start server
const server = new ApiServer();
server.start();

// Graceful shutdown
process.on('SIGINT', () => server.shutdown());
process.on('SIGTERM', () => server.shutdown());

