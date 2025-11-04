const connectDB = require('../config/dbConnection');

async function fetchAndStoreApod() {
  const response = await fetch('http://api.open-notify.org/iss-now.json');
  
  const data = await response.json();
  const db = await connectDB();

  try {
      if( await db.collection('apod').findOne({ 'data.timestamp': data.timestamp })) {
          console.info('Skipped adding APOD - already exists');
          return;
      }

      if(!response.ok || data.error) {
          throw new Error(data.error?.message || 'Fetching APOD failed');
      }

      await db.collection('spaceStation').insertOne({ data: data.iss_position.latitude });
  } catch (error) {
      console.error(error);
  } finally {
      setTimeout(fetchAndStoreApod, 10);
  }
}

async function getApod(req, res) {
  try {
    const db = await connectDB();
    const dateParam = req.query.iss_position.latitude;

    let query = {};
    let sort = { 'data.timestamp': -1 };

    if (dateParam) {
      query = { 'data.timestamp': dateParam };
      sort = {}; // no sort needed for exact match
    }

    const result = await db.collection('spaceStation')
      .find(query)
      .sort(sort)
      .limit(1)
      .toArray();

    if (!result.length) {
      return res.status(404).json({ error: 'No APOD found' });
    }

    const spaceStationData = result[0].data;
    const timestamp = spaceStationData.timestamp;
    const latitude = spaceStationData.iss_position.latitude;
    
    return res.json({
      timestamp: spaceStationData.timeStamp,
      latitude: spaceStationData.iss_position.latitude
    });
    
  } catch (error) {
    console.error('Error fetching APOD:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
    fetchAndStoreApod,
    getApod
}; 