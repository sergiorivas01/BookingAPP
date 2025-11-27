# BookingAPP - Reservation and Client Manager

A comprehensive reservation and client management application built with TypeScript and Node.js, featuring PostgreSQL database support and a console-based interface.

## Project Overview

BookingAPP is a full-featured system for managing reservations, clients, and properties. The project is being developed in phases, starting with a console application and later expanding to include a React-based web interface and API.

## Technology Stack

- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js
- **Database**: PostgreSQL
- **Testing**: Jest
- **Migrations**: node-pg-migrate
- **Frontend**: React 18 with Vite
- **Future Backend**: API project

## Features

### Current Implementation (Phase 1)

- **Client Management**
  - Create, read, update, and delete clients
  - Email validation and duplicate checking
  - Client information tracking

- **Reservation Management**
  - Create, read, update, and delete reservations
  - Date validation and conflict checking
  - Guest count validation
  - Reservation status tracking
  - Calendar view for reservations

- **Property Management**
  - Property model with specifications (area, capacity, bedrooms, bathrooms, amenities)
  - Property availability tracking
  - Property availability helper utilities
  - Current booking information

- **Storage Options**
  - In-memory storage (for testing and development)
  - PostgreSQL storage (production-ready)

- **Console Interface**
  - Interactive CLI menu system
  - Colorful output with chalk and boxen
  - Table displays for data visualization
  - Calendar visualization

## Development Phases

### Phase 1: Console Application ✅
The initial development focuses on building a fully functional console/CLI application that handles:
- Client management (CRUD operations)
- Reservation management (CRUD operations)
- Property management
- Core business logic and data operations
- PostgreSQL database integration
- Database migrations

### Phase 2: React Client ✅ (In Progress)
A React-based web interface has been created to provide a user-friendly graphical interface for the same functionality. The frontend is ready for integration with the backend API.

### Phase 3: API Project (Planned)
A RESTful API will be created to serve both the React client and potentially other clients.

## Project Structure

```
BookingAPP/
├── src/                          # TypeScript source files
│   ├── models/                   # Data models
│   │   ├── Client.ts            # Client model and DTOs
│   │   └── Reservation.ts       # Reservation model and DTOs
│   ├── Properties/              # Property management
│   │   ├── Property.ts          # Property model and interfaces
│   │   └── PropertyAvailabilityHelper.ts
│   ├── services/                # Business logic services
│   │   ├── ClientService.ts     # Client business logic
│   │   ├── ReservationService.ts # Reservation business logic
│   │   └── __tests__/           # Service unit tests
│   ├── storage/                  # Data storage implementations
│   │   ├── Storage.ts           # Storage interface
│   │   ├── InMemoryStorage.ts   # In-memory storage implementation
│   │   └── __tests__/           # Storage unit tests
│   ├── utils/                   # Utility functions
│   │   ├── calendar.ts          # Calendar utilities
│   │   ├── consoleHelpers.ts    # Console display helpers
│   │   └── idGenerator.ts       # ID generation utilities
│   ├── console/                 # Console interface
│   │   └── ConsoleInterface.ts  # Main console UI
│   └── index.ts                 # Application entry point
├── backend/                      # Backend infrastructure
│   └── database/                # Database configuration
│       ├── config.ts            # Database configuration
│       ├── connection.ts        # Connection pool management
│       ├── PostgreSQLStorage.ts # PostgreSQL storage implementation
│       └── migrations/          # Database migrations
│           └── 001_create_tables.ts
├── frontend/                     # React frontend application
│   ├── src/                      # React source files
│   │   ├── components/          # Reusable React components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API service layer
│   │   ├── types/               # TypeScript type definitions
│   │   └── styles/              # Global styles
│   ├── package.json             # Frontend dependencies
│   └── vite.config.ts           # Vite configuration
├── scripts/                     # Utility scripts
│   ├── check-data.ts            # Data inspection script
│   ├── seed-properties.ts       # Property seeding script
│   ├── test-console-flow.ts     # Console flow testing
│   ├── test-db-connection.ts    # Database connection testing
│   └── test-storage.ts           # Storage testing
├── dist/                         # Compiled JavaScript output
├── coverage/                     # Test coverage reports (generated)
├── jest.config.js                # Jest configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Project dependencies and scripts
├── .cursorrules                  # Project-specific rules and guidelines
├── ToDO.md                       # Project TODO list
└── README.md                     # This file
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- PostgreSQL (v12 or higher) - for production database
- A `.env` file with database configuration (see Configuration section)

### Installation

#### Backend (Console Application)

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run build

# Run database migrations (if using PostgreSQL)
npm run db:migrate

# Run the console application
npm start
```

#### Frontend (React Application)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
# Option 1: Individual variables
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bookingapp
DB_USER=postgres
DB_PASSWORD=postgres

# Option 2: Connection string (alternative)
# DATABASE_URL=postgres://user:password@host:port/database
```

The application will use default values if environment variables are not set, but it's recommended to configure them properly for production use.

## Development

```bash
# Watch mode for development (auto-compile on changes)
npm run dev

# Type checking without compilation
npm run type-check

# Build and start in one command
npm run build-start
```

## Database Management

The project uses `node-pg-migrate` for database migrations:

```bash
# Run all pending migrations
npm run db:migrate

# Run migrations up
npm run db:migrate:up

# Rollback last migration
npm run db:migrate:down

# Create a new migration
npm run db:migrate:create <migration-name>

# Test database connection
npm run db:test

# Test storage implementation
npm run db:test:storage

# Test console flow
npm run db:test:console

# Check database data
npm run db:check

# Seed properties
npm run db:seed:properties
```

## Testing

The project uses Jest for unit testing. Tests are located in `__tests__` directories alongside the source files.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

Tests are provided for:
- **Storage Layer**: 
  - `InMemoryStorage` - Tests all CRUD operations for clients and reservations
- **Service Layer**: 
  - `ClientService` - Tests client management with validation (email format, duplicates)
  - `ReservationService` - Tests reservation management with validation (dates, guests, client existence)
- **Properties**:
  - `PropertyAvailabilityHelper` - Tests property availability calculations
- **Utilities**:
  - Calendar utilities
  - Console helpers
  - ID generation

Coverage reports are generated in the `coverage/` directory and can be viewed in HTML format.

## Dependencies

### Production Dependencies
- `pg` - PostgreSQL client for Node.js
- `node-pg-migrate` - Database migration tool
- `dotenv` - Environment variable management
- `uuid` - UUID generation
- `chalk` - Terminal string styling
- `boxen` - Create boxes in terminal
- `cli-table3` - Pretty tables in terminal

### Development Dependencies
- `typescript` - TypeScript compiler
- `ts-node` - TypeScript execution for Node.js
- `jest` - Testing framework
- `ts-jest` - TypeScript preprocessor for Jest
- `@types/*` - TypeScript type definitions

## Frontend Development

The React frontend is located in the `frontend/` directory. See `frontend/README.md` for detailed information about the frontend setup, structure, and development.

### Quick Start (Frontend)

```bash
cd frontend
npm install
npm run dev
```

### Frontend Features

- **Modern UI**: Built with React 18 and modern CSS
- **Type Safety**: Full TypeScript support with types matching backend models
- **Routing**: React Router for navigation
- **API Ready**: Service layer prepared for backend API integration
- **Responsive Design**: Mobile-friendly interface

### Next Steps for Frontend

1. Implement API backend to connect with existing business logic
2. Add form components for creating/editing clients and reservations
3. Implement data tables/lists for displaying data
4. Add calendar component for viewing reservations
5. Add error handling and loading states

## License

ISC

## Contributing

Contributions are welcome! Please ensure that:
- Code follows TypeScript best practices
- All tests pass
- New features include appropriate tests
- Code is properly documented in English

