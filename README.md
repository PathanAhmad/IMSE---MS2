# IMSE MS2 - Food Delivery System

Complete food delivery application with SQL (MariaDB) and NoSQL (MongoDB) backends, featuring order management and delivery tracking.

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- No local database setup needed

### Running the Application

```bash
docker compose up --build
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api

### First Time Setup

1. Navigate to the frontend (http://localhost:5173)
2. Go to **Admin / Setup** section
3. Click **"Check Health"** to verify connections
4. Click **"Import & Reset Data"** to populate MariaDB with sample data
5. Click **"Migrate to MongoDB"** to sync data to MongoDB

## Application Features

### Admin Dashboard
- **Health Check:** Verify all services are running
- **Data Import:** Load randomized sample data (20 customers, 10 restaurants, 60 menu items, 30 orders)
- **Migration:** Migrate SQL data to MongoDB

### Student 1 - Order Management (SQL & Mongo)
- **Place Order:** Select customer → restaurant → items → submit
- **Pay Order:** Select order and payment method
- **Report:** View order history by restaurant with optional date filtering

### Student 2 - Delivery Management (SQL & Mongo)
- **Assign Delivery:** Assign riders to orders with delivery status
- **Report:** View delivery history by rider with optional filters

### Database Modes
- **SQL Mode:** Queries against MariaDB (relational)
- **Mongo Mode:** Queries against MongoDB (NoSQL document-based)

## Architecture

```
IMSE---MS2/
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Student1Section, Student2Section, AdminSection
│   │   ├── api.js         # API client
│   │   └── index.css      # Styling
│   └── Dockerfile
├── backend/               # Express.js backend
│   ├── src/
│   │   ├── routes/        # API endpoints (student1, student2, import, migrate)
│   │   ├── services/      # Business logic (importReset, migrateSqlToMongo)
│   │   ├── db/            # Database connections (mariadb, mongodb)
│   │   └── utils/         # Utilities (schema reader)
│   ├── package.json
│   └── Dockerfile
├── db/                    # Database schemas
│   └── mariadb/
│       └── schema.sql     # SQL schema definition
└── docker-compose.yml     # Service orchestration

```

## API Endpoints

### Admin
- `GET /api/health` - Health check
- `POST /api/import_reset` - Import/reset MariaDB data
- `POST /api/migrate_to_mongo` - Migrate to MongoDB
- `GET /api/customers` - List all customers
- `GET /api/restaurants` - List all restaurants
- `GET /api/menu_items?restaurantName=X` - Menu items for restaurant
- `GET /api/riders` - List all riders
- `GET /api/orders?status=X&limit=50` - List orders

### Student 1 (Order Management)
- `POST /api/student1/sql/place_order` - Create order (SQL)
- `POST /api/student1/sql/pay` - Pay order (SQL)
- `GET /api/student1/sql/report?restaurantName=X&from=Y&to=Z` - Report (SQL)
- `POST /api/student1/mongo/place_order` - Create order (MongoDB)
- `POST /api/student1/mongo/pay` - Pay order (MongoDB)
- `GET /api/student1/mongo/report?restaurantName=X&from=Y&to=Z` - Report (MongoDB)

### Student 2 (Delivery Management)
- `POST /api/student2/sql/assign_delivery` - Assign delivery (SQL)
- `GET /api/student2/sql/report?riderEmail=X&from=Y&to=Z&deliveryStatus=W` - Report (SQL)
- `POST /api/student2/mongo/assign_delivery` - Assign delivery (MongoDB)
- `GET /api/student2/mongo/report?riderEmail=X&from=Y&to=Z&deliveryStatus=W` - Report (MongoDB)

## Data Model

### SQL (MariaDB)
- **person** - Base table for customers and riders
- **customer** - Customer details (IS-A relationship with person)
- **rider** - Rider details (IS-A relationship with person)
- **restaurant** - Restaurant information
- **menu_item** - Restaurant menu items
- **order** - Customer orders
- **order_item** - Individual items in order (weak entity)
- **payment** - Payment information for orders
- **delivery** - Delivery tracking

### NoSQL (MongoDB)
Collections:
- **customers** - Denormalized customer data with email lookup
- **riders** - Denormalized rider profiles
- **restaurants** - Restaurant data with embedded menu items
- **orders** - Order documents with embedded items and payment info
- **deliveries** - Delivery tracking with rider and order references

## Demo Workflow

### SQL Mode Demo
1. Click "Import & Reset Data"
2. Go to Student 1 → SQL Mode
3. Select any customer, restaurant
4. Select menu items and place order
5. Note the returned Order ID
6. Go to Pay section, paste Order ID, pay with card
7. View report - should show the order with payment status
8. Go to Student 2 → SQL Mode
9. Assign a rider to the order
10. View delivery report - should show assignment

### MongoDB Demo
1. Click "Migrate to MongoDB"
2. Repeat steps 2-7 but select "Mongo Mode"
3. Verify same operations work with MongoDB

## Sample Data

After import, system contains:
- **20 customers:** customer1@example.com - customer20@example.com
- **10 restaurants:** Pasta Place, Sushi Spot, Burger Barn, Curry Corner, Pizza Palace, etc.
- **60 menu items:** Distributed across restaurants ($5-$25 price range)
- **10 riders:** rider1@example.com - rider10@example.com
- **30 pre-generated orders:** With various statuses and dates

## Troubleshooting

### "Table doesn't exist" error
→ Click "Import & Reset Data" in Admin section first

### "Customer not found" error
→ Use a customer from the list (customer1@example.com - customer20@example.com)

### Connection refused
→ Ensure all containers are running: `docker compose ps`

### Port already in use
→ Change ports in docker-compose.yml or stop conflicting services

## Technologies

- **Frontend:** React 18, Vite, Axios
- **Backend:** Express.js, Node.js
- **Databases:** MariaDB 11, MongoDB 7
- **Containerization:** Docker, Docker Compose
- **Language:** JavaScript (Node.js)

## Development Notes

This is a simplified implementation for teaching purposes. Features:
- No authentication/authorization (all users treated equally)
- No HTTPS (self-signed certificates acceptable per requirements)
- Randomized data generation for repeatability
- Clean separation between SQL and NoSQL implementations
