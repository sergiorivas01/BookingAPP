# BookingAPP - Reservation and Client Manager

A reservation and client management application built with TypeScript and Node.js.

## Project Overview

BookingAPP is a comprehensive system for managing reservations and clients. The project is being developed in phases, starting with a console application and later expanding to include a React-based web interface.

## Technology Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **Future Frontend**: React

## Development Phases

### Phase 1: Console Application
The initial development focuses on building a fully functional console/CLI application that handles:
- Client management (create, read, update, delete)
- Reservation management (create, read, update, delete)
- Core business logic and data operations

### Phase 2: React Client
Once the console application is complete and tested, a React-based web interface will be developed to provide a user-friendly graphical interface for the same functionality.

## Project Structure

```
BookingAPP/
├── src/                    # TypeScript source files
│   ├── models/             # Data models (Client, Reservation)
│   ├── services/           # Business logic services
│   │   └── __tests__/      # Service unit tests
│   ├── storage/            # Data storage implementations
│   │   └── __tests__/      # Storage unit tests
│   ├── console/            # Console interface
│   └── index.ts            # Application entry point
├── dist/                   # Compiled JavaScript output
├── coverage/               # Test coverage reports (generated)
├── node_modules/           # Dependencies
├── jest.config.js          # Jest configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Project dependencies and scripts
├── .cursorrules            # Project-specific rules and guidelines
└── README.md               # This file
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher recommended)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run build

# Run the application
npm start
```

## Development

```bash
# Watch mode for development
npm run dev

# Type checking
npm run type-check
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
- **Storage Layer**: `InMemoryStorage` - Tests all CRUD operations for clients and reservations
- **Service Layer**: 
  - `ClientService` - Tests client management with validation (email format, duplicates)
  - `ReservationService` - Tests reservation management with validation (dates, guests, client existence)

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]

