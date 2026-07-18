const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGODB_URI;
const dbName = process.env.APP_DB_NAME || "elevora";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectDB() {
  if (db) return db;
  await client.connect();
  db = client.db(dbName);
  return db;
}

function getDB() {
  if (!db) {
    throw new Error("Database not connected yet. Call connectDB() first.");
  }
  return db;
}

module.exports = { connectDB, getDB };
