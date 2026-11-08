# Antiqo

Multi-vendor marketplace for vintage products — a NestJS + PostgreSQL REST API with JWT auth, COD checkout and Swagger docs. Frontend is added later.

**Course:** CSC4161 — Advanced Programming in Web Technology · **Group 8, Section D**

## Structure

- `backend/` — the NestJS API (setup in `backend/README.md`)
- `frontend/` — added later

## Team

| Member | Area |
|---|---|
| Abdullah Al Taieb | Foundation & security |
| Md. Rezaul Islam | Catalogue |
| Golam Iffat Rahman Farah | Commerce |
| Sadia Aniqua | Trust & post-sale |

## Getting started (backend)

```bash
cd backend
npm install
cp .env.example .env     # then fill in the values
npm run start:dev
```

API docs will be available at `http://localhost:3000/api/docs`.
