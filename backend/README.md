# Antiqo API

Backend for **Antiqo**, a multi-vendor marketplace for vintage products. REST API built with NestJS and PostgreSQL: JWT auth, role-based access, a transactional cash-on-delivery checkout, and Swagger docs.

Course: CSC4161 — Advanced Programming in Web Technology · Group 8, Section D.

## Tech stack

- **NestJS 11** + **TypeScript**
- **PostgreSQL 18** via **TypeORM** (`synchronize` in dev)
- **Argon2id** password hashing, **JWT** auth (`@nestjs/jwt` + Passport)
- **class-validator** DTOs behind a global `ValidationPipe`
- **Swagger** at `/api/docs` with bearer auth
- **Nodemailer** (Mailtrap) for transactional email

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 18 running locally on port 5432

## 1. Install

```bash
cd backend
npm install
```

## 2. Create the database

```sql
CREATE DATABASE antiqo;
```

(or `createdb antiqo`)

## 3. Configure

Copy the example env file and fill in the values:

```bash
cp .env.example .env
```

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development` enables TypeORM `synchronize` |
| `PORT` | HTTP port (default 3000) |
| `DATABASE_URL` | `postgres://user:pass@localhost:5432/antiqo` |
| `JWT_SECRET` | secret used to sign JWTs |
| `JWT_EXPIRES_IN` | token lifetime, e.g. `1h` |
| `DELIVERY_FEE` | default delivery fee (admin can override at runtime) |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USER` / `MAIL_PASS` | Mailtrap SMTP (optional — email is best-effort) |

Email is optional: if the mail variables are unset or invalid, the app logs a warning and keeps working.

## 4. Run

```bash
npm run start:dev
```

The API listens on `http://localhost:3000`. Tables are created automatically in dev.

## 5. Seed demo data

```bash
npm run seed
```

Creates demo accounts (password `Password123` for all), an approved shop, two products, and one delivered order:

| Role | Email |
|---|---|
| Admin | `admin@antiqo.test` |
| Seller | `seller@antiqo.test` |
| Buyer | `buyer@antiqo.test` |

The seed is safe to re-run (it skips if the admin already exists).

## API docs

Swagger UI: **http://localhost:3000/api/docs**

1. `POST /auth/login` with a seeded account to get a token.
2. Click **Authorize**, paste the token, and call any protected endpoint.

Every response uses a consistent envelope:

```json
{ "success": true, "message": "OK", "data": <payload>, "meta": null }
```

Paginated lists put the rows in `data` and `{ total, page, limit }` in `meta`. Errors return `{ "success": false, "statusCode": ..., "message": ... }`.

## Roles

- **buyer** — browse, cart, checkout, offers, wishlist, reviews, returns
- **seller** — owns an approved shop; manages products and fulfils orders
- **admin** — approves shops, moderates listings/reviews/reports, sets the delivery fee, inspects returns and records refunds

A new account starts as a buyer; applying for a shop and being approved by an admin promotes it to seller.

## Key flows

- **Seller onboarding:** `POST /shops/apply` → admin `PATCH /shops/:id/approve` (promotes the owner to seller) → the seller can create products.
- **Checkout (transactional):** `POST /orders/checkout` builds the order from the cart inside a `QueryRunner` transaction, locks each product row, decrements stock, and rolls the whole thing back with `409` if any item is short — no order, no stock change.
- **Order lifecycle:** `confirm` → `ship` → `deliver` → `record-cod`.
- **Returns:** buyer `POST /returns` on a delivered order → admin `inspect` → admin `refund` (requires COD collected + inspection); a resale-fit return restocks once.

## Minimum requirements (how to verify)

| Requirement | Try |
|---|---|
| CRUD | `GET /products`, `POST/PATCH/DELETE /products` (seller) |
| Transaction + rollback | add more than stock to cart, `POST /orders/checkout` → `409`, stock unchanged |
| JWT 401/403 | call a protected route with no token (401); call a seller/admin route as a buyer (403) |
| DTO validation 400 | `POST /auth/register {}` → 400 |
| Exceptions 404/409 | `GET /products/999999` → 404; apply for a second shop → 409 |

## Scripts

| Command | What it does |
|---|---|
| `npm run start:dev` | run in watch mode |
| `npm run build` | compile to `dist/` |
| `npm run start:prod` | run the compiled build |
| `npm run seed` | load demo data |
| `npm run lint` | lint and autofix |

## Project layout

```
src/
  auth/ users/ addresses/        accounts & security
  shops/ products/ categories/   catalogue
  cart/ orders/ offers/          commerce
  wishlists/ reviews/ reports/ returns/   trust & post-sale
  mail/ settings/                admin & infrastructure
  common/                        enums, guards, decorators, interceptors, filters
  database/                      data source + seed
```
