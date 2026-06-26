# SimpleInvoice (Nx Monorepo)

SimpleInvoice is a full-stack invoice management application built with:

- Frontend: React + TypeScript + Vite + Ant Design
- Backend: NestJS + TypeScript + Prisma
- Database: PostgreSQL
- Workspace orchestration: Nx

This repository is organized as a monorepo managed by Nx while preserving the existing app folders.

## Project Architecture

```
simple-invoice/
|- simple-invoice-server/      # NestJS API + Prisma
|- simple-invoice-webapp/      # React web app (Vite)
|- docker-compose.yml          # Frontend + Backend + PostgreSQL
|- nx.json                     # Nx workspace config
|- package.json                # Root scripts (Nx entrypoint)
`- README.md
```

## Features

- JWT-based authentication
  - POST /auth/login
  - GET /auth/me
- Invoice list
  - Search by invoice number or customer name (case-insensitive, partial match)
  - Filter by status (Draft, Pending, Paid, Overdue)
  - Sort by invoiceDate, dueDate, totalAmount (ASC, DESC)
  - Server-side pagination
- Invoice detail view
- Create invoice
  - Backend-calculated totals
  - Due date validation
  - Unique invoice number enforcement
  - New invoice persisted as Draft
- Swagger/OpenAPI docs at /api/docs

## Monorepo and Nx Commands

Run commands from the repository root.

### Root scripts

- `npm run install:all` install dependencies for server and webapp
- `npm run dev` run server + webapp in parallel through Nx
- `npm run build` build server + webapp
- `npm run lint` lint server + webapp
- `npm run test` run unit test targets for server + webapp
- `npm run test:e2e` run backend e2e tests
- `npm run db:generate` run Prisma generate
- `npm run db:push` push Prisma schema to DB
- `npm run seed` seed database
- `npm run docker:up` start full stack with Docker Compose
- `npm run docker:down` stop stack and remove volumes

### Direct Nx usage

- `npx nx show projects`
- `npx nx run server:dev`
- `npx nx run webapp:dev`
- `npx nx run-many -t build --projects=server,webapp`

## Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop (for containerized workflow)

## Environment Configuration

Create app-level .env files from templates:

### Backend

```bash
cp simple-invoice-server/.env.example simple-invoice-server/.env
```

Required backend keys:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN` (default expected: 3600 seconds)
- `PORT`
- `FRONTEND_URL`

### Frontend

```bash
cp simple-invoice-webapp/.env.example simple-invoice-webapp/.env
```

Required frontend keys:

- `VITE_API_BASE_URL`

## Run with Docker (Recommended for reviewers)

Optional: create a root `.env` file to override Docker Compose JWT values:

```bash
cp .env.example .env
```

From root:

```bash
docker compose up --build
```

Services and ports:

- Frontend: http://localhost:80
- Backend: http://localhost:3000
- Swagger: http://localhost:3000/api/docs
- PostgreSQL: localhost:5432

Stop and cleanup:

```bash
docker compose down -v
```

## Run Locally Without Docker

1. Start PostgreSQL (local or dockerized).
2. Install dependencies:

```bash
npm install
npm run install:all
```

3. Configure environment files (see previous section).
4. Generate Prisma client and sync schema:

```bash
npm run db:generate
npm run db:push
```

5. Seed sample data:

```bash
npm run seed
```

6. Run both apps with Nx:

```bash
npm run dev
```

Default local URLs:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Swagger: http://localhost:3000/api/docs

## Default Reviewer Credentials

Seed script creates a default user:

- Email: `admin@simpleinvoice.com`
- Password: `password123`

## API Summary

- `POST /auth/login` authenticate user and return JWT
- `GET /auth/me` get authenticated profile
- `GET /invoices` list invoices with search/filter/sort/pagination
- `GET /invoices/:id` get invoice detail by id
- `POST /invoices` create invoice

Expected invoice list response shape:

```json
{
  "data": [],
  "paging": {
    "page": 1,
    "pageSize": 10,
    "total": 100
  }
}
```

## Business Logic Notes

- Totals are calculated on the backend.
- Overdue is derived at read time and not persisted.
- Persisted statuses are Draft, Pending, Paid.
- Due date must be on or after invoice date.
- Invoice number uniqueness is enforced by database and service validation.

## Testing

Run all unit tests through Nx:

```bash
npm run test
```

Run backend e2e tests:

```bash
npm run test:e2e
```

## Assumptions and Design Decisions

- Customer data is embedded in the invoice model (invoice-level snapshot).
- Assessment requires one line item for create flow; data model supports multiple items for future expansion.
- JWT token is stored client-side and attached to protected API requests.
- Overdue is computed dynamically from status + due date.
- Nx migration keeps existing app directories unchanged to minimize functional risk.

## Known Limitations / Incomplete Areas

- Backend e2e tests currently focus on auth/guard behavior; a full create-and-list workflow e2e case can be expanded further.
- Prisma migration files are not currently committed; setup uses schema push for local bootstrapping.
- Authentication is access-token only (no refresh token / logout invalidation strategy).

## Submission Notes

This repository includes:

- Full source code for frontend and backend
- Docker setup for full stack
- Seed script (`npm run seed`)
- Swagger documentation at `/api/docs`
- Default reviewer credentials documented above
