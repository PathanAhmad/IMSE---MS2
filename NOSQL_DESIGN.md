# MongoDB (NoSQL) Design

*Disclaimer: AI (Deepseek) was used to correct grammar, ensure language consistency, and improve phrasing to avoid monotony. The content and design decisions and this document as a whole were developed by us and not blatantly auto-generated*

## Overview

This document explains how we organized our data in MongoDB and the reasoning behind our choices.

---

## How We Organized the Data

### Restaurants Collection

When we migrate from SQL, we bring over the basic restaurant information - ID, name, and address. Pretty straightforward.

One thing we decided NOT to migrate was the menu items table. Why? Well, in a real food delivery app, menu prices change all the time. If we stored menu items separately and then referenced them from orders, old orders might show wrong prices if the menu gets updated. So instead, we just copy the item details directly into each order when it's placed. That way, historical orders always show what the customer actually paid.

**Example structure:**
```javascript
{
  _id: ObjectId,
  restaurantId: Number,
  name: String,      // unique restaurant name
  address: String
}
```

---

### People Collection

We put both customers and riders into one collection called "people". Each person has a type field that tells us whether they're a customer, rider, or just a generic person.

Why combine them? Mainly because they share a lot of common information (name, email, phone), and it makes lookups simpler. When we need to find someone by email, we just search one place. Then depending on their type, they'll have additional fields - customers have their default address and payment preferences, while riders have their vehicle type and rating.

**Example structure:**
```javascript
{
  _id: ObjectId,
  personId: Number,
  type: "customer" | "rider" | "person",
  name: String,
  email: String,
  phone: String | null,

  customer: null | {
    defaultAddress: String | null,
    preferredPaymentMethod: String | null
  },

  rider: null | {
    vehicleType: String,
    rating: Number | null
  }
}
```

---

### Orders Collection

Each order document contains pretty much everything related to that order - the items, payment info, and delivery details.

In SQL, we'd have orders spread across multiple tables (orders, order_items, payments, deliveries), and we'd need to join them all together whenever we want to see the full picture. In MongoDB, we just load one document and we have everything.

We also store "snapshots" of the restaurant and customer info directly in each order. So even if a restaurant changes its name or a customer updates their email, old orders still show what the information was at the time. This is really useful for reports and order history.

**Example structure:**
```javascript
{
  _id: ObjectId,
  orderId: Number,          // unique identifier
  createdAt: Date,
  status: String,           // like "created", "preparing", etc.
  totalAmount: Number,

  // snapshot of restaurant info at order time
  restaurant: {
    restaurantId: Number,
    name: String,
    address: String
  } | null,

  // snapshot of customer info at order time
  customer: {
    personId: Number,
    name: String,
    email: String
  } | null,

  // all items in this order
  orderItems: [
    {
      menuItemId: Number | null,
      name: String | null,
      quantity: Number,
      unitPrice: Number
    }
  ],

  // payment details (added when payment is made)
  payment: null | {
    paymentId: Number | null,
    amount: Number,
    method: String,
    paidAt: Date
  },

  // delivery details (added when delivery is assigned)
  delivery: null | {
    deliveryId: Number,
    deliveryStatus: String,
    assignedAt: Date | null,
    rider: {
      personId: Number,
      name: String,
      email: String,
      vehicleType: String | null,
      rating: Number | null
    } | null
  }
}
```

---

## Key Design Decisions

**Denormalization (copying data):** In traditional SQL databases, you normalize data to avoid duplication. In MongoDB, we often do the opposite - we duplicate information where it makes sense. For example, we copy restaurant and customer details into each order. This might seem wasteful, but it makes queries much faster and simpler since everything you need is in one place.

**Embedding vs. Referencing:** We chose to embed order items, payments, and deliveries directly inside order documents rather than storing them in separate collections. This makes sense because these things are tightly coupled to their order - you'd never look at a payment without caring about which order it belongs to. On the other hand, we keep people and restaurants as separate collections because they exist independently and might be looked up on their own.

**Historical accuracy:** By snapshotting data at the time of the order, we preserve what actually happened, even if things change later. This is particularly important for business reporting and auditing.

---

## Query Examples

Here are some examples of how we actually query the data in MongoDB. These show how the document structure makes common operations straightforward.

**Looking up a person by email:**
```javascript
db.people.findOne({ type: "customer", email: "customer1@example.com" })
db.people.findOne({ type: "rider", email: "rider1@example.com" })
```

**Finding orders for a specific restaurant (with optional date filter):**
```javascript
db.orders.find({
  "restaurant.name": "Plachutta",
  createdAt: { $gte: ISODate("2026-01-01"), $lte: ISODate("2026-01-31") }
}).sort({ createdAt: -1 })
```

Notice how we can filter directly on `restaurant.name` even though restaurant is nested inside the order. That's the benefit of embedding - no joins needed.

**Finding orders for a specific rider:**
```javascript
db.orders.find({
  "delivery.rider.email": "rider1@example.com",
  "delivery.deliveryStatus": "delivered"
}).sort({ "delivery.assignedAt": -1 })
```

Same thing here - we can query nested fields directly.

---

## Performance & Indexing

### Why indexes matter

Without indexes, MongoDB would have to scan through every single document to find what you're looking for. That's fine with 10 orders, but with 10,000 it gets slow. Indexes are like a book's table of contents - they let MongoDB jump straight to the relevant documents.

*Note: For this assignment's use case and data volume, indexes aren't strictly necessary - queries would run fast enough without them. However, we included them as good practice and proper database design. We didn't want to cut corners and submit work that wouldn't scale or follow real-world best practices.*

### What we indexed

We created indexes for the most common query patterns:

**Basic lookups:**
- Finding orders by order ID (for payment and delivery operations)
- Finding restaurants by name
- Finding people by email

These are unique indexes, which also helps ensure data integrity - no duplicate emails or order IDs.

**Reporting queries:**
- Orders by restaurant name (for restaurant performance reports)
- Orders by rider email and delivery status (for rider performance reports)

These indexes match the filters that our report endpoints use frequently.

### How we verify it works

MongoDB has a built-in `explain()` function that shows you exactly what it's doing when you run a query. We can check whether MongoDB is using our indexes (good) or scanning the entire collection (bad).

For example:
```javascript
db.orders.find({ "restaurant.name": "Plachutta" }).explain("executionStats")
```

If this shows an index scan (IXSCAN), we know it's fast. If it shows a collection scan (COLLSCAN), we'd need to add or fix an index.

### Migration tracking

After migrating data from SQL to MongoDB, we save a little metadata document that records when the migration happened and how many documents were migrated. The system health endpoint returns this information, which the frontend uses to automatically switch to "Mongo mode" and show a badge indicating the data source.
