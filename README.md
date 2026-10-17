# My Chotu

> Your neighbourhood. Just a tap away.

Multi-vendor local-commerce SaaS platform for Indian neighbourhood shops.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 App Router · JavaScript |
| Styling | Tailwind CSS v4 · shadcn/ui |
| Backend | Node.js · Express (CommonJS) |
| Database | PostgreSQL · Prisma ORM |
| Validation | Zod |
| Auth | JWT · bcryptjs |
| Real-time | Socket.IO (Phase 4) |
| Jobs | BullMQ + Redis (Phase 4) |
| Storage | S3-compatible (Phase 3) |

## Structure

```
my-chotu/
  apps/
    web/       Next.js frontend
    api/       Express REST API
  packages/
    shared/    Enums, constants shared by both apps
  prisma/      Schema, migrations, seed
  docs/
  tests/
```

## Getting started

### 1. Prerequisites

- Node.js ≥ 20
- Docker (for Postgres + Redis)

### 2. Start infrastructure

```bash
docker-compose up -d
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment

```bash
cp .env.example .env
# Fill in JWT_SECRET and verify DATABASE_URL
```

### 5. Migrate & seed database

```bash
npm run db:migrate
npm run db:seed
```

### 6. Run development servers

```bash
npm run dev          # starts both api (4000) and web (3000)
npm run dev:api      # api only
npm run dev:web      # web only
```

### 7. View API docs

Open `http://localhost:4000/api-docs` once Swagger is wired up (Phase 2).

## Delivery phases

| Phase | Scope |
|-------|-------|
| 1 | Repo, design tokens, DB schema, auth ✅ |
| 2 | Customer storefront, shop discovery, cart, COD checkout |
| 3 | Shopkeeper onboarding, subscriptions, inventory, order mgmt |
| 4 | Delivery staff, COD collection, notifications |
| 5 | QR codes, printable PDFs, public storefronts |
| 6 | Super Admin, plan CRUD, analytics, audit logs |
| 7 | Security review, tests, responsive QA, deployment |
