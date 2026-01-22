# SQL → MongoDB Migration Demo (Food Delivery)

A small, dockerized full-stack demo that starts with a **normalized SQL schema (MariaDB)**, then **migrates a snapshot into MongoDB** using a document model optimized for the API’s read patterns.

This project focuses on **data modeling trade-offs**, **migration strategy**, and **operational clarity** (one-command local startup).

![ER Diagram](Food%20Delivery%20ER%20_20260110_013128_0000.png)

---

## Why this project

- **Polyglot persistence**: relational model for transactional consistency + document model for read-optimized access.
- **Snapshot migration (no dual writes)**: a deliberate trade-off that keeps the system simple while demonstrating a real migration path.
- **Document modeling with historical accuracy**: order documents embed/snapshot key data so reports and order history remain correct even if entities change later.
- **Indexes and observability**: MongoDB indexes are created at startup; the health endpoint exposes DB connectivity, document counts, and migration metadata.

---

## What you can do in the UI

The frontend has an **Admin** tab that drives the demo flow:

1. **Check Health**: verifies MariaDB connectivity + ensures MongoDB indexes exist.
2. **Import & Reset Data**: creates SQL schema and inserts demo data.
3. **Migrate to MongoDB**: reads a full snapshot from MariaDB and writes it into MongoDB.

After migration, the app **automatically switches to MongoDB mode** (there is intentionally no manual toggle).

---

## Architecture (high level)

- **Frontend**: React + Vite (talks to the backend at `/api/...`).
- **Backend**: Node.js + Express.
  - SQL endpoints use **MariaDB**.
  - Mongo endpoints use **MongoDB**.
  - Migration endpoint copies SQL → MongoDB and writes a migration marker document.

---

## Data modeling (SQL vs MongoDB)

### SQL (MariaDB)

The relational schema captures the core domain (people, customers/riders, restaurants, menu items, orders, payments, deliveries) with foreign keys and join tables.

Schema file: `db/mariadb/schema.sql`.

### MongoDB (read model)

MongoDB stores a small set of collections designed around common API use-cases:

- `restaurants`: basic restaurant info
- `people`: customers + riders in one collection (with a `type` discriminator)
- `orders`: an order-centric document that **embeds**:
  - `orderItems`
  - `payment`
  - `delivery` (+ rider snapshot)
  - snapshots of restaurant and customer at order time

Design notes and query examples: `NOSQL_DESIGN.md`.

---

## Run locally (Docker)

### Prerequisites

- Docker + Docker Compose

### Start everything

```bash
docker compose up --build
```

### Stop everything

```bash
docker compose down
```

### Full reset (delete DB volumes)

```bash
docker compose down -v
```

### URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`

---

## Quick API smoke test

After starting containers:

```bash
curl http://localhost:3000/api/health
```

The response includes:
- MariaDB connectivity check
- MongoDB connectivity + document counts
- Migration marker metadata (used by the UI to determine active mode)

---

## Repo layout

- `frontend/`: React UI
- `backend/`: Express API + DB adapters
- `db/mariadb/schema.sql`: SQL schema used by import/reset
- `docker-compose.yml`: service wiring

---

## Notes on tooling

AI tooling was used only for **language cleanup in documentation** and generating **synthetic demo data**. The implementation decisions and code were written and verified by the authors.
