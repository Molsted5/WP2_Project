const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.DATABASE_URI);

async function connectToDB() {
    try {
        await client.connect();
        return client.db();
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
    }
}

module.exports = connectToDB;
