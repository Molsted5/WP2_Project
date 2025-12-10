import { useState, useEffect } from "react"
import './App.css';
import SpaceStation from './components/SpaceStation';

function App() {
  const [ws, setWs] = useState(null); // change of state schedules new return (render difference update)
  
  // Effects let you specify side effects that are caused by rendering itself, rather than by a particular event
  // This is used for websocket as connecting to it isnt a pure calculation, so it cant run during rendering and there are no events like onClick to "hook" into, so we hook into useEffect, which is run after commit.
  // Note event handlers like onClick has "side effects" as they change state, but the code is not run during rendering. The event handler is only defined during rendering, but handles outside it and then triggers rendering. 
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
  }, []); // [] means the useEffect only runs on first render. Without [], useEffect would run each time the component is rendered. With a state with a not empty value, useEffect would run each time, that state is updated (or changed?) 
  
  return ( 
    <div className="App">
      <h1>Space Station Tracker</h1>
      { ws ? <SpaceStation ws={ ws }/> : null }
    </div>
  );
}

export default App; // specify the main component in the file
