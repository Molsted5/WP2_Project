import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const ws = new WebSocket('ws://localhost:3500');

function collectData(data) {
  let result = [];
  for (let i = 0; i < data.length; i++) {
    result.push({
      // store numeric timestamp in ms
      time: data[i].timestamp * 1000,
      latitude: parseFloat(data[i].iss_position.latitude),
    });
  }
  return result;
}

function SpaceStation(props) {
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    ws.onmessage = (event) => {
      console.log(event);
      let result = collectData(event.data);
      setChartData(result);
    };
    async function loadApod() {
      const url = '/spaceStation/get';


      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Server responded with status ${res.status}`);
        }
        const data = await res.json();
        console.log(data);

        let result = [];
        for (let i = 0; i < data.length; i++) {
          result.push({
            // store numeric timestamp in ms
            time: data[i].timestamp * 1000,
            latitude: parseFloat(data[i].iss_position.latitude),
          });
        }

        setChartData(result);
      } catch (err) {
        console.error('Failed to load space station data:', err);
        setError('Could not load space station data. Please try again later.');
      }
    }

    loadApod();
  }, []);

  return (
    <div className="space-station">
      {error ? (
        <p>{error}</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#ccc" />
            <XAxis
              dataKey="time"
              tickFormatter={(tick) =>
                new Date(tick).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }
              type="number"
              domain={['auto', 'auto']}
              scale="time"
            />
            <YAxis
              label={{ value: 'Latitude', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              labelFormatter={(label) =>
                new Date(label).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }
            />
            <Line
              type="monotone"
              dataKey="latitude"
              stroke="#8884d8"
              dot={true}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default SpaceStation;
