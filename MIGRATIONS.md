# TypeORM Migrations Guide

## Overview
This project uses TypeORM migrations for production database schema management instead of `synchronize: true`.

## Production-Ready Configuration

### Database Module (`src/database/database.module.ts`)
- `synchronize: true` only in development (`NODE_ENV=development`)
- `synchronize: false` in production (`NODE_ENV=production`)
- Automatic migration execution in production (`migrationsRun: true`)
- Environment-dependent logging

### TypeORM CLI Configuration (`src/database/typeorm.config.ts`)
- Standalone configuration for migration commands
- Uses environment variables for database connection

### Migration Commands
```bash
# Generate new migration (after entity changes)
npm run migration:generate src/migrations/MigrationName

# Run pending migrations
npm run migration:run

# Show migration status
npm run migration:show

# Revert last migration (if needed)
npm run migration:revert
```

## Initial Migration
**Important**: The initial migration (`1725785320000-InitialMigration.ts`) 

- **7 Main Tables**: users, countries, services, clients, vendors, projects, vendor_matches
- **3 Junction Tables**: vendor_countries, vendor_services, project_services
- **All Relationships**: Foreign keys, indexes, and constraints
- **Enums**: User roles, project status, vendor status

## Production Deployment

### Environment Setup
Ensure your production `.env` includes:
```env
NODE_ENV=production
MYSQL_HOST=your_host
MYSQL_PORT=3306
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database
```

### Deployment Steps
1. **Deploy code** with migration files
2. **Set environment** to `NODE_ENV=production`
3. **Run migrations**: `npm run migration:run`
4. **Start application** (migrations will auto-run on future deployments)

### Verification
```bash
# Check migration status
npm run migration:show

# Verify tables exist
# Connect to your database and run: SHOW TABLES;
```

## Development Workflow

### For New Schema Changes
1. **Modify entities** in development
2. **Generate migration**:
```bash
npm run migration:generate src/migrations/YourChangeName
```
3. **Review generated SQL** carefully
4. **Test migration**:
```bash
npm run migration:run
```
5. **Commit migration file** to version control

### Important Notes
- **Never use `synchronize: true` in production**
- **Always review generated migrations before applying**
- **Test migrations on staging/copy of production data first**
- **Keep all migration files in version control**
- **Migrations are irreversible in production - plan carefully**

## Current Status
✅ Initial migration created and ready for production 
✅ Environment-based configuration active
✅ Automatic migration execution configured for production
