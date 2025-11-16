# Project: Full-Stack TypeScript Application

## Architecture Overview

**3-tier monorepo**: Client (React + Vite) → Server (Express + TypeORM) → Database (PostgreSQL)
- `client/`: React frontend with TypeScript, uses Vite dev server with API proxy
- `server/`: Express REST API with TypeORM ORM layer
- All services orchestrated via Docker Compose with health checks

**Key Integration Point**: Client proxies `/api` requests to server via Vite config (`client/vite.config.ts`), targeting `http://localhost:3003` in local dev.

## Critical Conventions

### TypeORM Migration Pattern
- **Database schema uses migrations, NOT `synchronize: true`** (see `server/src/data-source.ts`)
- Schema changes require explicit migrations: `npm run migration:generate -- src/migrations/MigrationName`
- Run migrations: `npm run migration:run` (required before app starts)
- Entity decorators in `server/src/entities/*.ts` define schema but don't auto-sync

### API Design Pattern
- Routes in `server/src/routes/*.ts` import `AppDataSource.getRepository(Entity)` directly
- Error responses: Always return `{ message: string, error?: any }` with appropriate status codes
- Repository pattern: Use TypeORM's `.findOneBy()`, `.create()`, `.save()` methods (see `users.ts`)

### Docker Environment Distinction
- **Production**: `docker-compose.yml` - Multi-stage builds, production deps only, postgres on port 5433
- **Development**: `docker-compose.dev.yml` - Hot reload via volumes, postgres on port 5432
- Named volumes for node_modules prevent host conflicts (`server_node_modules`, `client_node_modules`)

## Development Workflows

### Starting the Application
**Docker (recommended)**:
```bash
# Development with hot reload
docker compose -f docker-compose.dev.yml up

# Production build
docker compose up
```

**Local (requires local PostgreSQL)**:
```bash
# Terminal 1 - Server (runs on port 5000)
cd server
npm run dev

# Terminal 2 - Client (runs on port 3000)  
cd client
npm run dev
```

### Database Operations
```bash
cd server

# Create new migration after entity changes
npm run migration:generate -- src/migrations/MigrationName

# Apply pending migrations
npm run migration:run

# Rollback last migration
npm run migration:revert
```

### Port Configuration
- **Dev mode**: PostgreSQL `5432`, Server `5000`, Client `3000` (proxy → 5000)
- **Prod mode**: PostgreSQL `5433`, Server `5000`, Client `3000` (proxy → 5000)
- **Vite proxy**: Currently misconfigured to `3003` instead of `5000` - update `client/vite.config.ts` if API calls fail

## File Organization Rules

### Server Structure
- **Entities**: `server/src/entities/*.ts` - TypeORM decorators (`@Entity`, `@Column`, etc.)
- **Routes**: `server/src/routes/*.ts` - Express routers mounted in `index.ts` (e.g., `/api/users`)
- **Migrations**: `server/src/migrations/*.ts` - Timestamped, sequential DB changes
- **Data Source**: `server/src/data-source.ts` - Single source of truth for DB config

### Client Structure
- **Services**: `client/src/services/*.ts` - Axios wrappers, use `/api` base path
- **Types**: `client/src/types/*.ts` - Shared interfaces, must match server entities
- **Components**: `client/src/components/*.tsx` - React functional components with hooks

## Configuration Points

### Environment Variables
- **Server**: Requires `.env` file (see `README.md` for template), fallbacks in `data-source.ts`
- **Docker**: Injects env vars directly in compose files (no `.env` file needed)

### TypeScript Compilation
- Server: `ts-node` for dev, `tsc` builds to `dist/` for production
- Client: Vite handles TS, outputs to `dist/` on build

## Common Pitfalls

1. **Forgetting migrations**: Adding `@Column` to entity doesn't update DB - must generate migration
2. **Port mismatches**: Vite proxy points to 3003, but server runs on 5000 (likely config error)
3. **Docker node_modules**: Don't delete named volumes - they cache dependencies
4. **CORS**: Server uses `cors()` middleware - no config needed for same-origin API proxy
