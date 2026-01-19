# IMSE MS2 - Food Delivery System

We built a small food delivery demo that works in **two modes**:

- **SQL mode** (MariaDB): normal relational tables + joins
- **Mongo mode** (MongoDB): documents optimized for our specific API use-cases

There is **no manual SQL/Mongo toggle** in the UI. The app **switches to Mongo mode automatically after migration** (as required by the MS2 guidelines).

---

## Startup instructions

### Prerequisites
- Docker + Docker Compose

### What starts up
When we run Docker Compose, we start 4 containers:
- **MariaDB** (SQL)
- **MongoDB** (NoSQL)
- **Backend** (Node.js + Express) on port **3000**
- **Frontend** (React + Vite) on port **5173**

After it's running:
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:3000/api`

### First-time demo setup (from the UI)
In the frontend, open the **Admin** tab.

Then run:
- **Check Health** (pings MariaDB + ensures Mongo indexes exist)
- **Import & Reset Data** (creates schema + inserts demo data)
- **Migrate to MongoDB** (copies the SQL snapshot into MongoDB)

After migration, the main screen shows **Data Source: MongoDB (after migration)** and Student 1/2 use cases + reports run against MongoDB endpoints.

---

## How to run (Docker commands)

### Start everything

```bash
docker compose up --build
```

### Stop everything

```bash
docker compose down
```

### Full reset (delete DB volumes)
Use this if you want a clean database state.

```bash
docker compose down -v
```

## Architecture overview

### High-level flow
- The **frontend** calls the **backend** at `/api/...`.
- The backend talks to **MariaDB** for SQL mode endpoints.
- For Mongo mode endpoints, the backend talks to **MongoDB**.
- The **migration** endpoint reads a full snapshot from MariaDB and writes it into MongoDB (we don't "dual write").

### Repo layout (main folders)
- `frontend/`: React UI (Vite dev server in Docker)
- `backend/`: Express API + DB adapters
- `db/mariadb/schema.sql`: SQL schema used by the import/reset step
- `docker-compose.yml`: wires all services together

---

## AI tools (responsible use)

We used AI tools to brainstorm UI/UX ideas, to improve wording in documentation, and to generate the fake data.
We did **not** copy-paste AI-generated code, and we did not use AI to “solve” the assignment for us.
All code and final decisions were made and verified by us.

---

## Troubleshooting

- If the UI is empty or errors: check logs (`docker compose logs -f backend` / `docker compose logs -f frontend`).
- If data looks wrong: in **Admin**, run **Check Health → Import & Reset Data → Migrate to MongoDB** (in that order).
- If nothing loads: confirm `http://localhost:5173` and `http://localhost:3000/api` are reachable and `docker compose ps` shows all containers up.
