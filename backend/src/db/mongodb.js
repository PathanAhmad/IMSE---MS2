const { MongoClient } = require("mongodb");
const { config } = require("../config");

let client;

async function getMongo() {
  if (!client) {
    // I keep a single MongoClient for the whole app.
    client = new MongoClient(config.mongodb.uri);
    await client.connect();
  }

  const db = client.db(config.mongodb.db);
  return { client, db };
}

async function ensureMongoIndexes() {
  const { db } = await getMongo();

  // I enforce orderId uniqueness so Student 1 can safely allocate numeric order IDs.
  await db.collection("orders").createIndex({ orderId: 1 }, { name: "idx_orders_orderId_unique", unique: true });

  // I index the fields my Student 2 report filters on.
  // I also clean up an older index name from earlier iterations so explain output is less confusing.
  try {
    await db.collection("orders").dropIndex("idx_orders_delivery_rider_date_status");
  } catch (_e) {
    // ignore: index might not exist
  }

  await db.collection("orders").createIndex(
    { "delivery.rider.email": 1, createdAt: -1, "delivery.deliveryStatus": 1, "delivery.assignedAt": -1 },
    { name: "idx_orders_student2_report" }
  );

  // I index the fields my Student 1 report filters/sorts on.
  await db.collection("orders").createIndex({ "restaurant.name": 1, createdAt: -1 }, { name: "idx_orders_student1_report" });
}

module.exports = { getMongo, ensureMongoIndexes };

