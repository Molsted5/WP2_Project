const connectDB = require('../config/dbConnection');
const { getWSS } = require('../config/webSocket');
let isFetching = false;

async function fetchAndStoreApod() {
  const response = await fetch('http://api.open-notify.org/iss-now.json');
  const data = await response.json();

  console.log(`Parsed data:`, data);

  const db = await connectDB();

  try {
    if (!response.ok || data.error) {
      console.error(`Bad response or error in data`);
      throw new Error(data.error?.message || 'Fetching space station data failed');
    }

    const exists = await db.collection('spaceStation').findOne({ timestamp: data.timestamp });
    if (exists) {
      console.info(`Skipped insert — timestamp already exists: ${data.timestamp}`);
      return;
    }

    await db.collection('spaceStation').insertOne(data);

    const result = await queryLatest(db, 8);
    broadcastISSData(result);
  } catch (error) {
    console.error(`Error during DB operation:`, error);
  }
}

// keep in mind that it only starts when controller is first loaded and that the isFecthing bool is independent of the actual fetching function, which might lead to conflicts with future callers.
function startSpaceFetchInterval() {
  setInterval(async () => {
    if (isFetching) {
      console.warn(`Skipping fetch — previous run still in progress`);
      return;
    }
  
    isFetching = true;
  
    try {
      await fetchAndStoreApod();
    } catch (err) {
      console.error(`Unexpected error in interval:`, err.message);
    } finally {
      isFetching = false;
    }
  }, 6000);
}

async function getApod(req, res) {
  try {
    const db = await connectDB();
    const result = await queryLatest(db, 8);

    if (result.length === 0) {
      console.warn(`No data found for query:`, result);
      return res.status(404).json({ error: 'No space station data found' });
    }

    return res.json(result);
  } catch (error) {
      console.error(`Error in getApod:`, error.message);
      return res.status(500).json({ error: 'Internal server error' });
  }
}

// helper functions
async function queryLatest(db, limit = 8) {
  const result = await db.collection('spaceStation')
    .find({})
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();

  let output = [];
  for (let i = 0; i < result.length; i++) {
    output.push({
      timestamp: result[i].timestamp,
      iss_position: result[i].iss_position
    });
  }
  return output;
}

function broadcastISSData(data) {
  const wss = getWSS();
  if (wss) {
    const msg = JSON.stringify(data);
    for (const client of wss.clients) {
      if (client.readyState === client.OPEN) {
        client.send(msg);
      }
    }
    console.log(`Broadcasted ${data.length} ISS records`);
  }
}

module.exports = {
  fetchAndStoreApod,
  startSpaceFetchInterval,
  getApod
};



