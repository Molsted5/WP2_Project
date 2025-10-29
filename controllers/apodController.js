const connectDB = require('../config/dbConnection');

async function fetchAndStoreApod() {
    const response = await fetch('https://api.nasa.gov/planetary/apod?api_key=NlRFb0W6YdCdCnPnc1Ewjzh47OXHUaR8dkL4wNdb');
    const data = await response.json();
    const db = await connectDB();

    try {
        if( await db.collection('apod').findOne({ 'data.date': data.date })) {
            console.info('Skipped adding APOD - already exists');
            return;
        }

        if(!response.ok || data.error) {
            throw new Error(data.error?.message || 'Fetching APOD failed');
        }

        await db.collection('apod').insertOne({ data });
    } catch (error) {
        console.error(error);
    } finally {
        setTimeout(fetchAndStoreApod, 3600000);
    }
}

async function getApod(req, res) {
  try {
    const db = await connectDB();
    const dateParam = req.query.date;

    let query = {};
    let sort = { 'data.date': -1 };

    if (dateParam) {
      query = { 'data.date': dateParam };
      sort = {}; // no sort needed for exact match
    }

    const result = await db.collection('apod')
      .find(query)
      .sort(sort)
      .limit(1)
      .toArray();

    if (!result.length) {
      return res.status(404).json({ error: 'No APOD found' });
    }

    const apodData = result[0].data;
    const url = apodData.url;
    const date = apodData.date;
    const explanation = apodData.explanation;

    return res.json({
      url: url,
      date: date,
      explanation: explanation
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