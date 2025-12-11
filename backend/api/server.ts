// Load environment variables first
import 'dotenv/config';

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import connectPgSimple from 'connect-pg-simple';
import { initializePool, closePool, getPool } from '../../backend/database/connection';
import { PostgreSQLStorage } from '../../backend/database/PostgreSQLStorage';
import { ClientService, ReservationService } from '@azucar_1/bookingapp';
import { clientRoutes } from './routes/clients';
import { reservationRoutes } from './routes/reservations';
import { propertyRoutes } from './routes/properties';
import { 
  createOAuth2Strategy, 
  createAuthRoutes, 
  getSessionConfig,
  UserService 
} from '../../backend/auth';

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
  private userService!: UserService;
  private authEnabled: boolean = false;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '8006', 10);
    
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
    this.userService = new UserService();
  }

  private setupMiddleware(): void {
    // CORS configuration - Allow all origins in development for easier debugging
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    console.log(`CORS configured for origin: ${frontendUrl}`);
    console.log(`Development mode: ${isDevelopment}`);
    
    this.app.use(
      cors({
        origin: (origin, callback) => {
          // In development, allow all localhost origins
          if (isDevelopment) {
            if (!origin) {
              return callback(null, true);
            }
            
            // Allow any localhost origin in development
            if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
              return callback(null, true);
            }
            
            // Allow the configured frontend URL
            if (origin === frontendUrl) {
              return callback(null, true);
            }
          }
          
          // Allow requests with no origin (like mobile apps or curl requests)
          if (!origin) {
            return callback(null, true);
          }
          
          // Allow the configured frontend URL
          if (origin === frontendUrl) {
            return callback(null, true);
          }
          
          // Allow Azure Static Web Apps (check if origin contains azurestaticapps.net)
          if (origin.includes('azurestaticapps.net')) {
            return callback(null, true);
          }
          
          console.warn(`CORS blocked origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: [
          'Content-Type',
          'Authorization',
          'X-Requested-With',
          'traceparent', // Application Insights correlation header
          'tracestate', // Application Insights correlation header
          'Request-Id', // Application Insights correlation header
          'Request-Context', // Application Insights correlation header
        ],
        exposedHeaders: ['Content-Length', 'Content-Type'],
        maxAge: 86400, // 24 hours
      })
    );

    // Parse JSON bodies
    this.app.use(express.json());

    // Setup authentication if enabled
    this.setupAuthentication();

    // Request logging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  private setupAuthentication(): void {
    // Check if OAuth 2.0 is enabled
    const oauthEnabled = process.env.OAUTH2_ENABLED === 'true';
    
    if (!oauthEnabled) {
      console.log('OAuth 2.0 authentication is disabled. Set OAUTH2_ENABLED=true to enable.');
      return;
    }

    try {
      this.authEnabled = true;
      console.log('Setting up OAuth 2.0 authentication...');

      // Setup session store with PostgreSQL
      const PgSession = connectPgSimple(session);
      const pool = getPool();
      
      if (!pool) {
        throw new Error('Database pool not initialized');
      }

      // Configure session middleware
      const sessionConfig = getSessionConfig();
      this.app.use(
        session({
          ...sessionConfig,
          store: new PgSession({
            pool: pool as any,
            tableName: 'session',
            createTableIfMissing: false,
          }),
        })
      );

      // Initialize Passport
      this.app.use(passport.initialize());
      this.app.use(passport.session());

      // Configure Passport serialization
      passport.serializeUser((user: any, done) => {
        done(null, user.id);
      });

      passport.deserializeUser(async (id: string, done) => {
        try {
          const user = await this.userService.findById(id);
          done(null, user);
        } catch (error) {
          done(error);
        }
      });

      // Setup OAuth 2.0 strategy
      const oauth2Strategy = createOAuth2Strategy(this.userService);
      passport.use('oauth2', oauth2Strategy);

      console.log('✓ OAuth 2.0 authentication configured successfully');
    } catch (error) {
      console.error('Failed to setup authentication:', error);
      console.warn('Continuing without authentication...');
      this.authEnabled = false;
    }
  }

  /**
   * Async route wrapper to catch all errors
   */
  private asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void> | void) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch((error) => {
        console.error('Async route error:', error);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
          });
        }
      });
    };
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ 
        status: 'ok', 
        message: 'API is running',
        authEnabled: this.authEnabled,
      });
    });

    // Database diagnostic endpoint
    this.app.get('/health/db', this.asyncHandler(async (req: Request, res: Response) => {
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
    }));

    // Authentication routes (if enabled)
    if (this.authEnabled) {
      const authRoutes = createAuthRoutes();
      this.app.use('/auth', authRoutes);
      console.log('✓ Authentication routes mounted at /auth');
    }

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
    // Global error handler - must be last middleware
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Express Error Handler:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
      });
      
      // Ensure response hasn't been sent
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? err.message : undefined,
        });
      } else {
        // If headers were sent, we can't send a response, but we can log
        console.error('Error occurred after response was sent');
      }
    });

    // Handle unhandled promise rejections - CRITICAL: Don't let these crash the server
    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
      console.error('Unhandled Rejection - Server will continue running:', {
        reason: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
      });
      // CRITICAL: Do NOT exit the process - just log and continue
    });

    // Handle uncaught exceptions - CRITICAL: Only exit on truly critical errors
    process.on('uncaughtException', (error: Error) => {
      console.error('Uncaught Exception:', {
        message: error.message,
        stack: error.stack,
      });
      
      // Only exit on critical system errors
      const criticalErrors = [
        'EADDRINUSE',
        'port',
        'EACCES',
        'ENOTFOUND',
        'ECONNREFUSED',
      ];
      
      const isCritical = criticalErrors.some(critical => 
        error.message.includes(critical) || error.name.includes(critical)
      );
      
      if (isCritical) {
        console.error('Critical error detected. Exiting...');
        process.exit(1);
      } else {
        // For non-critical errors, log and continue
        console.error('Non-critical error. Server will continue running.');
      }
    });
  }

  public start(): void {
    const server = this.app.listen(this.port, '0.0.0.0', () => {
      console.log(`🚀 API Server running on http://localhost:${this.port}`);
      console.log(`📡 Health check: http://localhost:${this.port}/health`);
      console.log('Server is ready to accept connections.');
      console.log(`Listening on all network interfaces (0.0.0.0:${this.port})`);
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${this.port} is already in use. Please use a different port.`);
        process.exit(1);
      } else {
        console.error('Server error:', error);
        // Don't exit, let the server try to recover
      }
    });

    // Keep the process alive
    server.on('close', () => {
      console.log('Server connection closed.');
    });

    // Handle client connections
    server.on('connection', (socket) => {
      console.log(`New connection from ${socket.remoteAddress}:${socket.remotePort}`);
      socket.on('close', () => {
        console.log(`Connection closed from ${socket.remoteAddress}:${socket.remotePort}`);
      });
    });

    // Store server reference to prevent garbage collection
    (this as any).httpServer = server;
  }

  public async shutdown(): Promise<void> {
    console.log('\nShutting down server gracefully...');
    try {
      await closePool();
      console.log('Database connection closed.');
    } catch (error) {
      console.error('Error closing database pool:', error);
    }
    process.exit(0);
  }
}

// Create and start server
let server: ApiServer;
try {
  server = new ApiServer();
  server.start();
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}

// Graceful shutdown - only on explicit signals
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT (Ctrl+C). Shutting down gracefully...');
  if (server) {
    server.shutdown();
  } else {
    process.exit(0);
  }
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM. Shutting down gracefully...');
  if (server) {
    server.shutdown();
  } else {
    process.exit(0);
  }
});

// Prevent the process from exiting on uncaught errors
// Keep the server running unless it's a critical error
process.on('exit', (code) => {
  console.log(`Process exiting with code: ${code}`);
});

// Keep process alive - prevent default Node.js behavior of exiting on empty event loop
if (typeof setImmediate !== 'undefined') {
  setImmediate(() => {
    // Keep the event loop alive
  });
}

