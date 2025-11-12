const connectDB = require('../config/dbConnection');
let isFetching = false;

async function fetchAndStoreApod() {
  console.log(`[${new Date().toISOString()}] Starting fetchAndStoreApod`);

  const response = await fetch('http://api.open-notify.org/iss-now.json');
  console.log(`[${new Date().toISOString()}] Fetched response with status: ${response.status}`);

  const data = await response.json();
  console.log(`[${new Date().toISOString()}] Parsed data:`, data);
  console.log(`[${new Date().toISOString()}] Timestamp value: ${data.timestamp}, Type: ${typeof data.timestamp}`);

  const db = await connectDB();
  console.log(`[${new Date().toISOString()}] Connected to database`);

  try {
    if (!response.ok || data.error) {
      console.error(`[${new Date().toISOString()}] Bad response or error in data`);
      throw new Error(data.error?.message || 'Fetching space station data failed');
    }

    const exists = await db.collection('spaceStation').findOne({ timestamp: data.timestamp });
    console.log(`[${new Date().toISOString()}] DB lookup result for timestamp ${data.timestamp}:`, exists);

    if (exists) {
      console.info(`[${new Date().toISOString()}] Skipped insert — timestamp already exists: ${data.timestamp}`);
      return;
    }

    await db.collection('spaceStation').insertOne(data);
    console.info(`[${new Date().toISOString()}] Inserted new data with timestamp: ${data.timestamp}`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error during DB operation:`, error);
  }
}


// keep in mind that it only starts when controlelr is first loaded and that the isFecthing bool is independent of the actual fetching function, which might lead to conflicts with future callers.
function startSpaceFetchInterval() {
  setInterval(async () => {
    if (isFetching) {
      console.warn(`[${new Date().toISOString()}] Skipping fetch — previous run still in progress`);
      return;
    }
  
    isFetching = true;
    console.log(`[${new Date().toISOString()}] Triggered interval fetch`);
  
    try {
      await fetchAndStoreApod();
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Unexpected error in interval:`, err.message);
    } finally {
      isFetching = false;
      console.log(`[${new Date().toISOString()}] Fetch cycle complete`);
    }
  }, 10000);
}

async function getApod(req, res) {
  try {
    const db = await connectDB();
    const timeStampParam = req.query.timestamp;

    let query = {};
    let sort = { timestamp: -1 };

    if (timeStampParam) {
      query = { timestamp: timeStampParam };
      sort = {};
    }

    const result = await db.collection('spaceStation')
      .find(query)
      .sort(sort)
      .limit(10)   
      .toArray();

    if (result.length === 0) {
      console.warn(`[${new Date().toISOString()}] No data found for query:`, query);
      return res.status(404).json({ error: 'No space station data found' });
    }

    const spaceStationData = result[0];
    console.log(`[${new Date().toISOString()}] Returning data:`, spaceStationData);
    
    let output = [];
    for(let i = 0; i < result.length; i++){
      output.push({
        timestamp: result[i].timestamp,
        iss_position: result[i].iss_position
      });
    }
    return res.json(output);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in getApod:`, error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  fetchAndStoreApod,
  startSpaceFetchInterval,
  getApod
};
