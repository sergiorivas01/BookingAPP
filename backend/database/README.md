# Database Setup

This folder contains the PostgreSQL database implementation for the BookingAPP.

## Prerequisites

1. Install PostgreSQL locally
2. Create a database named `bookingapp` (or update the configuration)

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure database connection:**

   **Option 1: Create a `.env` file in the project root:**

   ```bash
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/bookingapp
   ```

   **Option 2: Set environment variable `DATABASE_URL`:**

   ```bash
   export DATABASE_URL="postgres://user:password@localhost:5432/bookingapp"
   ```

   **Option 3: Set individual variables:**

   ```bash
   export DB_HOST=localhost
   export DB_PORT=5432
   export DB_NAME=bookingapp
   export DB_USER=postgres
   export DB_PASSWORD=postgres
   ```

   **Defaults** (if no environment variables are set):

   - `DB_HOST` = localhost
   - `DB_PORT` = 5432
   - `DB_NAME` = bookingapp
   - `DB_USER` = postgres
   - `DB_PASSWORD` = postgres

3. **Run migrations:**

   ```bash
   # Run all pending migrations
   npm run db:migrate:up

   # Or use the default command (same as up)
   npm run db:migrate
   ```

   **Note:** The scripts automatically load variables from `.env` file using `dotenv`. Make sure your `.env` file is in the project root.

4. **Create a new migration:**

   ```bash
   npm run db:migrate:create migration_name
   ```

5. **Rollback migrations:**
   ```bash
   npm run db:migrate:down
   ```

## Environment Variables

- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_NAME` - Database name (default: bookingapp)
- `DB_USER` - Database user (default: postgres)
- `DB_PASSWORD` - Database password (default: postgres)
- `DATABASE_URL` - Full connection string (takes precedence over individual variables)

## Usage

To use PostgreSQL storage instead of in-memory storage, update `src/index.ts`:

```typescript
import { PostgreSQLStorage } from "../backend/database/PostgreSQLStorage";
import { initializePool } from "../backend/database/connection";

// Initialize database connection
initializePool();

// Use PostgreSQL storage
const storage = new PostgreSQLStorage();
```

## Database Schema

The database includes three main tables:

- **clients** - Stores client information
- **properties** - Stores property information
- **reservations** - Stores reservation information with foreign keys to clients and properties

All tables include `created_at` and `updated_at` timestamps that are automatically managed.
