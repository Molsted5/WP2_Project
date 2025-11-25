import { useState, useEffect } from "react"
import './App.css';
import SpaceStation from './components/SpaceStation';

function App() {
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3500");

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
      socket.send(JSON.stringify({ type: "hello", payload: "Frontend connected!" }));
    };

    socket.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    setWs(socket);

    return () => {
      socket.close(); // cleanup on unmount (on refresh for example)
    };
  }, []); // [] means the useEffect only runs on first render. Without [], useEffect would run each time the component is rendered. With a variable with a not empty value, useEffect would run each time, that variable is updated (or changed?) 

  return (
    <div className="App">
      <h1>Space Station Tracker</h1>
      { ws ? <SpaceStation ws={ ws }/> : null }
    </div>
  );
}

export default App; // specify the main component in the file
