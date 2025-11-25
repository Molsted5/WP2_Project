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

function SpaceStation({ ws }) {
  const [chartData, setChartData] = useState([]); // change of state schedules new return (render difference update)
  const [error, setError] = useState(null);

  useEffect(() => { // useEffect handles live communication orderly, which is needed because for example, parent components passing props down, ui events or setinterval timers setting state and so on can cause rerenders and this makes it unpredictable in combination with live connections, so useEffect is there to give live connections a safe place in the order of operations
    function handleMessage(event) {
      try {
        const data = JSON.parse(event.data);
        console.log("Message from server:", data);
        setChartData(collectData(data));
      } catch (err) {
        console.error("Failed to parse:", event.data, err);
      }
    }

    ws.addEventListener("message", handleMessage);

    async function loadApod() {
      const url = '/spaceStation/get';

      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Server responded with status ${res.status}`);
        }
        const data = await res.json();
        console.log(data);
        let result = collectData(data);
        setChartData(result);
      } catch (err) {
        console.error('Failed to load space station data:', err);
        setError('Could not load space station data. Please try again later.');
      }
    }

    loadApod();

    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [ws]); // [] and therefore only running useEffect on initial component render, would be enough, because we dont need to depend on ws changing in order to run the useEffect, however this futureproofs, so it is set to handle reconnecting or connection swapping. 

  return ( // rendered or returned anew each time useState changes
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
