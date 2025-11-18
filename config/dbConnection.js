const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.DATABASE_URI);

let db; // cache

async function connectToDB() {
  if (!db) {
    try {
      await client.connect();
      db = client.db();
      console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
  }
  return db;
}

module.exports = connectToDB;
