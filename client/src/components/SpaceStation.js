import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function collectData(data) {
  let result = [];
  for (let i = 0; i < data.length; i++) {
    result.push({
      time: data[i].timestamp * 1000,
      latitude: parseFloat(data[i].iss_position.latitude),
    });
  }
  return result;
}

function SpaceStation() {
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3500"); // same port as your server

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      ws.send(JSON.stringify({ type: "hello", payload: "Frontend connected!" }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Message from server:", data);
        let result = collectData(data);
        setChartData(result);
      } catch (err) {
        console.error("Failed to parse:", event.data, err);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setError("WebSocket connection failed.");
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

    return () => ws.close(); // cleanup on unmount
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
